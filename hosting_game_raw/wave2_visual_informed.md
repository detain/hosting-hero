# Wave 2 — Graphics / Visual Designer lens (informed pass)

*Read against the full merged `hosting_game.md` (11,236 lines, §0–§9). Everything below is either
**absent** from that document (Part A) or a **concrete visual upgrade to something already in it**
(Part B, which cites the existing heading by name so the merge agent can find it).*

**Method.** I went looking for three kinds of hole: (1) systems that are mechanically defined and have
no described visual expression at all — the business machine (§4.9), most of §2.10, most of §3.2's
archetype list, the Three-Clock Rule (§7.9), the Hands resource (P4); (2) places where two entries
give the same colour, shape or surface two different jobs; (3) places where an entry hand-waves
("a meter," "a gauge," "it looks different") where a spec is needed to actually build it.

**Cross-cutting rendering laws live in Part A §8.** Categories 1–7 and 9 reference them. If the merge
agent only takes one thing from this report, take §8's **Hue Ledger**, **Emissive Allowance**,
**Ring Taxonomy** and **Instrument Design Language** — they resolve four collisions that will
otherwise surface as bugs in production.

---
---

# PART A — NEW IDEAS

---

## 1. Levels, scenarios, and progression

### The Perspective Frame Device
*The single biggest missed opportunity in §1.2.* Each perspective-shift level currently changes who
you are but not how the screen is built.

**How it looks:** Every perspective level gets its own **viewport chrome** — a physical frame around
the world that tells you instantly whose eyes you're in. `The NOC Shift` is four CRT monitor bezels
with a seam down the middle and a reflection of a dark room. `The Datacenter Tech` is a helmet-cam
vignette with a lanyard swinging in the bottom corner and a work-order PDA in the lower right.
`The Auditor` is a clipboard: the world renders *inside the paper*, with a pen and a checkbox column
down the right margin. `Eyes of the Packet` is a first-person tube with header fields drawn on the
walls. `Founder Mode` is a desk: the world is on a laptop screen at an angle, with a coffee cup and a
phone on the desk that rings. `The Support Queue Level` is a helpdesk window with the world *absent* —
just the ticket list and a dark, wrong-feeling empty space where the board should be.
**Interacts with:** §1.2 in full, §8.8's HUD skeleton (the frame *replaces* the HUD rather than adding
to it, so screen budget stays constant), §9.1's modes.

### The Establishing Frame vs the Working Frame
Every level ships **two** authored compositions, not one.

**How it looks:** The **Establishing Frame** is cinematic — low camera, strong horizon, dramatic
lighting, the hero silhouette of the line, no UI. It plays for ~6 seconds at level start (§8.12's Cold
Open lands here), and it is the level-select card, the loading screen and the score-screen backdrop.
The **Working Frame** is the flat, high, legible, boring-on-purpose gameplay camera. **Authoring both
stops the art team from compromising the working camera to make screenshots pretty** — the most common
way strategy games go unreadable.
**Interacts with:** §8.10's Signature Frame, §8.3's altitudes, §1.8's tier postcards.

### The Objective Totem
Win conditions are currently text. Make them objects.

**How it looks:** Each scenario places one physical object on the board that *is* the objective, lit
differently from everything else and always visible at every altitude. `Zero Downtime Migration` puts
a **TTL hourglass** on a pedestal by the entrance. `Compliance Week` puts a **blank certificate in a
frame** on the office wall that fills in as controls are satisfied. `Runway: 6 Weeks` puts a **fuel
gauge** on the office door. `Sold Out` puts a **signed contract under glass**. `The Honeymoon` puts an
**empty visitor's chair**. When the objective completes, the totem does something physical (the
hourglass is turned over and put away; the certificate is stamped; the chair is sat in).
**Interacts with:** §1.5 scenario library (every entry), §6.9 scoring, §8.8 (removes a HUD element).

### The Constraint Band
Scenario special rules are the most-forgotten information in a TD. Render them *on the tool*, not in a
briefing.

**How it looks:** A scenario rule physically modifies the UI furniture it constrains. `The Change
Freeze` runs **hazard tape diagonally across the build palette** and the deploy button; you can see the
tape, and clicking under it plays a refusal. `The Cheap Bid` puts a **"REFURB ONLY" sticker** on the
catalogue and renders all new-hardware entries behind frosted glass. `The Long Weekend` **greys out the
hands dock and draws an out-of-office sticky note over it**. `Blind Mode` covers the graph drawer with
a **dust sheet**. `The Quiet Month` hangs a **"NO SCHEDULED THREATS" card** on the threat gantry, which
is somehow more unsettling than threats.
**Interacts with:** §1.5, §7.5 (change freeze, maintenance windows), §8.8.

### The Fail-Forward Fade
Losing a level should not be a modal.

**How it looks:** When a lose condition trips, the game does **not** cut to a screen. It takes the
controls away gently: the camera slowly pulls back to the Establishing Frame while the facility goes
dark **in dependency order** — edge first, then app, then data, then the lights, then the LEDs, then
the exit signs — over about eight seconds, with the hum falling away in steps. The last thing lit is
whatever you built first in the campaign. *Then* the postmortem document slides in.
**Interacts with:** §6.10's soft-over-hard rule, §8.12, §1.7's "lose slowly."

### The Campaign Spine as a Patch Panel
§1.6 and §9.1 imply a branching campaign map but never draw one.

**How it looks:** The campaign map is a **patch panel** on the office wall. Each level is a labelled
port; completed levels have a cable plugged in; branches are visible as where cables can still go.
Hosting-line unlocks add a whole new panel row with its own colour band. The **Line Draft** (§9.1)
deals you three unplugged cables and you choose which port to seat. The cable you plug in stays plugged
for the rest of the run, so the panel is a record of your route.
**Interacts with:** §9.1 Line Draft and Campaign, §5.6, §5.8's presentation-as-objects house style.

### Level Select as the Job Board
An alternative/companion to the patch panel for scenario levels.

**How it looks:** A corkboard of printed tickets, work orders and faxes — each scenario is a piece of
paper with an era-appropriate letterhead, a priority stamp, a customer name and a deadline. Completed
ones are spiked on a bill spike in the corner. **Cheap, diegetic, and it reuses the ticket art already
required by §9.3's ticket generator.**

### The Scale Handshake Frame
§1.1's best presentation idea — "each tier's map becomes one icon in the next tier's map" — needs one
authored frame to land.

**How it looks:** At tier-up, the camera pulls out until the entire previous level fits inside a
rectangle; the rectangle then **hard-snaps to the grid of the new level's iconography** with an audible
detent, and the old world's detail collapses into the new world's single glyph in one frame. Hold on
that glyph for a beat with its label (`RACK 04`, `SUITE 200`, `IAD1`) before the new board draws in.
**The snap, not the zoom, is what sells it.**

### Per-Tier Composition Rules
Make the tier postcards actually distinct by fixing composition, not just content.

**How it looks:** Tier 0 — **one object, centred, warm, shallow depth of field, horizon high.** Tier 1
— one object, off-centre, cool, a second light source. Tier 2 — a vertical slice (the cabinet), strong
verticals, horizon lost. Tier 3 — a horizontal flow left-to-right, the diagram's shape visible. Tier 4
— a one-point perspective down an aisle, vanishing point dead centre. Tier 5 — an orthographic map, no
horizon at all. Tier 6 — the horizon returns, from orbit. **You can identify the tier from a thumbnail
with the content blurred**, which is the actual test §1.8 is asking for.

### The Aisle Vanishing Point
A specific, cheap device for Tier 4+.

**How it looks:** Every facility level has one canonical aisle whose vanishing point is the camera's
home position. Alarm state at the far end of that aisle is visible as a coloured glow at the vanishing
point even when you're zoomed elsewhere — **the room tells you something is wrong at the back of it**
without an alert.

### Mid-Level Re-Skin Wipe
For `Pivot`, `Diversify`, `Multi-Line` and any level where the business changes under you.

**How it looks:** The line skin (§0.2's Five-Asset Kit) changes as a **wipe along the floor**, not a
crossfade: floor paint, then lighting, then faceplates, then visitor costumes, advancing rack row by
rack row at about one row per second. You can see the old business retreating.
**Interacts with:** §1.4 `Pivot`, §8.10.

### The Legacy Age Ladder in the World
§1.6's Legacy debt and §9.2's Legacy Box need a visible age.

**How it looks:** Five authored age states applied as material variants, not new models: **New**
(crisp decal, bright LEDs, protective film corner still on), **Working** (clean, slight bezel dust),
**Aged** (yellowed plastic, one dead LED, a label reprinted over the old one), **Legacy** (mismatched
faceplate, hand-written label tape, cable ties replaced with electrical tape), **Cursed** (a sticky
note, a wrong-coloured screw, a chassis that doesn't match its rails). A machine's age state is
*earned by uptime and neglect*, so the Tier-1 box you never replaced arrives at Tier 4 looking it.

### The Weather Card
For any level where §9.2's "Weather Affects Everything" is live.

**How it looks:** A small, always-visible card in the corner drawn like a mid-century forecast card:
a hand-drawn sun/cloud/storm glyph, an outside temperature, and a grid-price arrow. Its background
tint is the same tint applied to the level's outdoor light, so **the card and the world agree**, and
you learn to read the card because the window is already telling you.

### The Season Wheel
§1.6's Seasonality has no readout.

**How it looks:** A thin annular ring around the game clock, divided into twelve, with icons for the
seasonal events the game knows about (a turkey, a snowflake, a mortarboard, a receipt for tax season,
a patch-Tuesday cog repeating monthly). The current month is a lit wedge; the next event is a small
marker. **One ring answers "what is coming this year," which is otherwise a menu dive.**

### Scenario Icon Family
§1.5 lists ~50 scenarios with no iconography.

**How it looks:** A single-weight, 24px, two-colour icon per scenario, all built from the same eight
primitives (a wave, a clock, a bolt, a flame, a padlock, a coin, a paper, a person). The icon appears
on the job-board ticket, the timeline ribbon marker, the postmortem, and the achievement. **Fifty icons
from eight primitives is an afternoon of work and it makes the scenario library feel like a set.**

### The Acquisition Normalization Bar
§1.2's `The Acquisition` says "visual consistency as a win condition" — build it a readout.

**How it looks:** A horizontal bar showing your estate as tiles, tinted by which visual *dialect* each
object belongs to (yours, theirs, third-party). The objective is to make the bar one colour. Each
normalized object flips its faceplate, label font and cable colour to your house style with a little
sweep. **A progress bar made of art direction** is a genuinely novel objective readout.

### The Retro Boot Screen
Era levels need a transition that isn't a title card.

**How it looks:** Loading a period level plays that era's boot: a 1996 BIOS POST with a memory count,
a 2005 splash with a progress bar and a gradient, a 2016 systemd scroll, a 2025 telemetry dashboard
that assembles itself. **Twelve seconds of typography doing all the work.**

### Loading Is Provisioning
Kill the abstract progress bar.

**How it looks:** The load screen is an install: `Racking… Cabling… Imaging… Configuring… Warming
cache… Bringing into rotation`, each step with its own tiny animation in the rack elevation on screen
(§8.12's loading screens) and a green check when done. **The player learns the real bring-up order by
reading load screens for twenty hours.**

### The "You Are Here" Sticker
Wayfinding at Tier 4+.

**How it looks:** The camera's current position is marked in-world by a small printed floor-plan
sticker on the end cap of the nearest row, with a dot. Zooming out shows the same floor plan getting
larger until it *becomes* the minimap. **The minimap and the world are literally the same object at
different scales.**

### The Tier-6 Constellation Pullback
§1.1's Tier 6 has the idea ("zoom out one more stop than the player thought existed") but no image.

**How it looks:** The world map's site markers stop being pins and become **light**: your sites as
warm points, competitors as cool ones, transit as faint lines, and then the map itself recedes into a
dark field where the pattern of lights reads as a constellation with your company's mark traced
between your own sites. Used exactly once. **Restraint is what makes it work.**

---

## 2. Threats

### The Off-Board Register (threats that never enter the board)
*The largest single hole in §2's presentation.* BGP hijack, registrar hijack, DNS poisoning, blocklist
listing, upstream null-route, payment-processor termination, silent deprioritization and regulatory
action all damage you **without traversing the lane**, and the document has no rendering scheme for
them beyond "the board looks healthy."

**How it looks:** A dedicated **bezel register** — the frame of the screen itself. The world stays
clean and green; the *frame* develops the problem. A BGP hijack draws a magenta bar along the top edge
that steadily eats leftward, with a tiny world-map inset showing your prefix colour changing hands.
A blocklist listing stains the bottom edge. A registrar hijack puts a lock glyph on the frame and the
board's entrance sign goes blank. A processor termination turns the money column's chrome grey. The
register is **outside** the Three-Layer Rule (§8.2) on purpose: it is the game telling you that the
call is coming from outside the house.
**Interacts with:** §2.7 (all), §2.10 (processor, upstream, regulatory), §2.12 (bulletproof, email,
DNS), §8.2, §8.8's HUD skeleton.

### The Attribution Direction Law
§2.12's bulletproof entry has a brilliant one-off: a dead arc goes grey **from their end**, not yours.
Promote it to a universal law.

**How it looks:** Every failed link animates its grey from the end that caused it. Your NIC died → grey
starts at your port. Their router died → grey starts at theirs. A cut in the middle → grey blooms from
the cut point with a spark. Cross-connect billing dispute → grey starts at the meet-me room panel.
**Direction of failure is free information and no game uses it.**
**Interacts with:** §2.7, §7.2's link health rendering, §7.6's diagnosis.

### The Threat Despawn Vocabulary
Right now threats mostly "dissolve." There are at least seven distinct reasons a threat leaves, and
they should look different, because the difference is the diagnosis.

**How it looks:** **Blocked** — recoil off a surface, a spark, a counter tick, the unit intact and
bouncing away (it will try again). **Dropped** — the unit simply stops rendering mid-stride with no
effect, one frame, no particle (this is what a null-route looks like, and its *silence* is the tell).
**Filtered** — dissolves into grey ash and settles (scrubbing). **Tarpitted** — sinks and stays,
visible, wasting its own time. **Expired** — fades out on its own timer having found nothing (the
scanner that found no open port). **Diverted** — turns and walks to the honeypot with a slightly
too-eager gait. **Neutralized** — captured: a dome drops over it and it becomes a Codex specimen.
**Seven exits, seven reads, zero new art beyond particles.**

### The Entropy Eruption Grammar
§2.8 correctly says entropy threats "erupt from inside your own buildings" but never says what that
looks like as a family.

**How it looks:** Entropy never has a creature and never has magenta. It uses a shared **spall**
language: a hairline crack appears on the object's own faceplate, propagates over 2–8 seconds
depending on severity, and the failure emerges *through* it. Disk failure spalls at a drive bay; PSU
pop spalls at the power inlet; a fan failure spalls nothing and instead **loses** an element (the blur
stops). The shared read is: **the damage is coming from the object, not at it**, which is precisely the
mechanical distinction §2.8 is making.

### The Paper Family (business and legal threats)
§2.10 has 35 entries and almost no visual language. Give the whole family one material.

**How it looks:** Business threats are **paper and print**. A chargeback is a small receipt fluttering
*out* of the vault. A DMCA is a manila envelope with a red string closure. A regulatory notice is a
heavy cream sheet with a seal. A lawsuit is a briefcase that opens on your desk. A vendor price hike is
a letter that lands with a thud and a shockwave (already noted for The Vendor Squeeze — generalize it).
An SLA credit claim is a carbon-copy form. A licensing audit is a spreadsheet printout that keeps
printing. **Paper accumulates**: unhandled paper stacks on the desk, then the floor, then blocks the
door — which is the doom clock §2.10 keeps describing in text.
**Interacts with:** §2.10 in full, §4.9 (the Back Office, below), §9.3's ticket generator.

### The Broadcast Family (reputation threats)
Reputation threats are neither creatures nor paper.

**How it looks:** They are **signage and screens**: a billboard truck (already used for Review Bomb —
make it the family's flagship), a star rating that visibly loses a point with a physical click, a
headline crawl on the office TV, a forum thread rendered as a growing wall poster outside your gate
that arriving visitors stop and read. The shared read: **reputation threats are things other people can
see**, and they are positioned *outside* your perimeter facing inward.
**Interacts with:** §2.10, §3.4's Trust Gap, §3.6's Uptime Trophy Wall.

### The Human Family (credential, insider, physical)
**How it looks:** Human threats are the only threats drawn with **your own staff art set**, re-lit.
They cast a visible shadow when nothing else does; their badge is the tell (§2.6 already has the
inverted badge — extend it: a visitor badge in a staff-only zone, a badge with an expired date
readable at Z1, two people on one swipe). They move at walking pace, always, which distinguishes them
from everything else on the board.

### The Mimic Tell Must Not Be Colour
§2.4's Mimic Tell law currently lists "a fill colour a few degrees off" as a legitimate tell. That is
invisible to ~8% of male players and violates §8.2's own Diamond/Circle/Triangle law.

**How it looks:** Four non-colour tell channels, one per mimic class. **Cadence** — their footfall
lands exactly on the global heartbeat (§8.9) while real visitors are slightly off it. **Formation** —
they arrive in a rank that is too even (Card Tester). **Path** — perfectly systematic traversal
(AI Scraper). **Prop** — an identical wallet, an identical user-agent tag, an identical query-string
squiggle. **Every tell must survive greyscale**, and a Contrast Audit Mode (§8.9) pass should be part
of mimic sign-off.

### The Threat Scale Law
**How it looks:** A threat's rendered size is proportional to **what it will cost you**, not to its
packet volume. A tiny toll-fraud cord that will cost $60,000 renders *large*. A 50Gbps flood that your
scrubber absorbs for free renders as a wall that is visibly thin. **Size means money.** This makes the
board honest and stops the player from mis-triaging by spectacle — which is exactly the skill §7.5's
triage wants to teach.

### The Wave Composition Bar
§1.7's Telegraph Depth ("next wave visible, the one after a silhouette, the one after a question mark")
has no widget.

**How it looks:** A horizontal bar above the incoming edge, split into three segments. Segment 1 is a
row of solid threat glyphs with counts. Segment 2 is the same row in filled silhouette with no counts.
Segment 3 is a single `?` in a dashed box. Unlocking better monitoring **shifts the boundary right**,
which is a visible, permanent, felt upgrade to a UI element — the best kind.

### The Pressure Gradient (ambient attack baseline)
`DDoS Season` (§1.5) says "a permanent magenta haze at the map edges." Spec it as a reusable system.

**How it looks:** A one-channel screen-space gradient from the inbound edge, whose **reach** (not
opacity) encodes baseline attack pressure. At low pressure it's a 40px lip at the edge; at high
pressure it reaches a third of the way across the board. It never obscures — it tints the substrate
only, never the Flow or Annotation layers. **Ambient difficulty as a measurable distance.**

### The Designator
For every threat aimed at one specific tenant (Grudge Booter, Ransom DDoS, targeted L7).

**How it looks:** A thin magenta reticle that locks onto the target object with a small triangulation
animation *before* the attack arrives, plus a tenant-coloured tag showing whose it is. **The
designator is what makes §1.1's Tier-4 signature moment work** — you can see it is customer 14 being
hit, and you can see the null-route decision coming.

### The Mound of the Stopped
Give blocked traffic somewhere to go.

**How it looks:** Dropped and blocked units accumulate as a visible low drift at the base of the
defense that stopped them, colour-coded magenta (correctly blocked) and amber (false positives). The
drift decays slowly. **An amber-heavy drift under your WAF is the most damning image the game can
show you**, and it costs one particle system.
**Interacts with:** §8.6's false-positive flash, §4.5's WAF, §6.9's Traffic Sankey.

### The Adaptation Marks
§2.13's "Hunters adapt" law is invisible.

**How it looks:** When a threat archetype returns after being countered, its sprite carries a visible
**retrofit** — a plate bolted over the spot your defense hit, a second set of legs, a rotating
address-drum. Three retrofit levels, authored once per family. **You can see that they learned**,
which makes attrition feel like a conversation instead of a difficulty number.

### The 4am Grade
§2.13's "Suspicious Uptick at 4am" wants the clock to be a diagnostic tool.

**How it looks:** The night band isn't just darker — it's a **different grade**: blues compress,
saturation drops globally by ~25%, and the only fully saturated things on screen are threats and
alerts. Consequence: **a magenta triangle at 4am is visually louder than the same triangle at noon**,
which is exactly right, because at 4am you have fewer hands.

### The Poisoned Tint
For cache poisoning, DNS poisoning, replica drift, bad deploys, silent corruption.

**How it looks:** Content that is *wrong but serving* carries a faint off-register tint — one channel
shifted a few degrees, like bad print registration — that propagates downstream with the data. It's
subtle at Z3 and obvious at Z1. **The visual grammar of "this is working and it is wrong"**, which is
§7.7's worst partial-failure state and currently has no render.

### The Silent Threat Strip
§8.11 says a mimic is **silent** and that's what makes it terrifying — but silence is invisible.

**How it looks:** The **Hum Bar** (§8 below) shows room tone as a live strip. A silent threat creates a
visible *notch* in the strip — an absence of the expected noise floor. **Rendering silence as a hole is
the only way deaf players get the mimic's best tell**, and it's a genuinely striking image for everyone.

### The Correlated Failure White Line
§2.9 calls this "the game's signature learning moment" and never draws it.

**How it looks:** In the postmortem overlay, the world desaturates completely except for the two failed
objects (red) and a **single bright white line** drawn between them through whatever they shared — down
to the PDU, back to the same firmware build, out to the same upstream, or up to the same person's
avatar. The line draws itself in one second with a rising tone. It should be the only pure white thing
on the screen (§8's Hue Ledger reserves white for player intent — this is the exception, and it's
earned).

### The Zero-Day Sky
Global events need a global image.

**How it looks:** On a disclosure event, the **skylight / window / outdoor light changes colour** for
the whole facility — a sodium-orange wash that reaches every level of the game simultaneously and
appears in every player's session. The trade-press ticker (§9.3) scrolls. Your fleet's patch-lag pips
light up. **Nothing on the board has changed and the room feels different**, which is precisely what
that night feels like.

### The Turned-Away Map
For blocklisting, deliverability collapse, and geo-blocking.

**How it looks:** At Z4, the destinations that are refusing you **rotate their arrival arcs away** —
the arc's terminus lifts off your node and curls back on itself. A map full of curled arcs is
instantly legible as "the world is declining to talk to you," and it's the same asset used for
§2.12's silent deprioritization (where only *some* arcs curl, and slowly).

### The Camera Cone Gap
§4.7's "an uncovered camera cone gap is where the Insider walks" is stated and never rendered.

**How it looks:** In the security overlay, camera coverage is drawn as pale cones on the floor; gaps
are literal dark polygons. The Insider, Tailgater and Evil Maid **path through the dark polygons**, so
their route is predictable, discoverable and fixable by buying one more camera. **A stealth threat with
a readable path is a puzzle; without one it's a dice roll.**

### The Taxi Meter
For any threat that costs money per second: toll fraud, egress bill bomb, recursive invocation,
95th-percentile overage, SLA credit accrual.

**How it looks:** A shared widget — a small mechanical fare meter with clicking digits — that attaches
to the *object* incurring the cost, not the HUD. Several can be on screen at once and they are
horrible to look at, which is the point. **One widget, six threats, one unforgettable sound.**

---

## 3. Visitors, traffic, and clients

### The Costume Kit (the actual spec behind "one shape, many costumes")
§3.3 states the principle and never defines the parts.

**How it looks:** Every visitor is assembled from exactly five slots: **Hull** (the shape token from
§8.2 — circle/square/teardrop/diamond, which encodes *duration class*), **Livery** (a two-tone paint
that encodes the hosting line), **Prop** (one silhouette-breaking attachment that encodes the
archetype — a shopping bag, a clipboard, a camera flash, a helmet, a briefcase, a crate), **Ring**
(patience — see the Ring Taxonomy in §8), **Tag** (one optional floating datum — ping, size, value).
Five slots, ~6 options each, and the whole visitor population of thirty-plus archetypes across
twenty-five hosting lines is authored. **This is the §0.2 Five-Asset Skin Kit applied to the thing the
player looks at most.**

### Value as Ornament, not Size
§8.6 says "value as size and glow." Size fails at Z3 and glow fails the colour-blind test.

**How it looks:** Value is encoded as **ornament count** — a plain visitor has a bare hull; each value
tier adds one visible embellishment (a rim, then a second rim, then a corner notch, then a crown
notch). A whale is visibly *decorated*, not merely big, so it still reads at 8px and in greyscale.
Keep the size cue as a secondary, and the glow as a tertiary.

### The Bounce Cause Tag
§8.6's bounce puff tells you someone left, not why.

**How it looks:** The puff carries a single 12px glyph for one frame longer than the puff itself: a
clock (patience), a shield (blocked by your defense — amber), a broken-page (error), a padlock-slash
(cert warning), a price tag (price shock), a checklist (missing feature), a spinner (queue). **A
screen-full of clock glyphs and a screen-full of shield glyphs demand completely different fixes**, and
this is the cheapest possible way to say which you have.
**Interacts with:** §3.4 in full, §6.9's Traffic Sankey (same glyph set labels the Sankey's branches).

### The Bounce Heatmap Decay
§8.6's grey marks are a great idea with no lifecycle.

**How it looks:** Grey marks persist ~60 seconds and accumulate into a **scorch** on the path segment.
A segment with sustained bouncing develops a visible worn/burned patch that fades over minutes. Repeat
visitors' paving (§3.2) is the same system in positive: **one shader with a signed value — bright where
you succeed, scorched where you fail.**

### The Customer Portrait System
§3.5's table names fourteen recurring characters (Hobby Harold, Whale Wendy, Enterprise Edith…) and
gives them zero visual identity. They're the emotional core of the business layer.

**How it looks:** A **paperdoll portrait** on a card: a flat two-colour bust silhouette, one garment
token, one prop, one background tint for their cohort, and a mood ring. Harold has headphones and a
cracked phone. Brenda has a bakery apron and a laminated invoice. Anya has a lanyard with five client
badges clipped to it. Raj's portrait contains **smaller portraits behind him** (he is fifty customers).
Edith has a procurement folder and a second, smaller lawyer in the frame. Wendy's card is a
*different size* from everyone else's and doesn't fit the tray. **Cheap flat art, enormous
personality**, and it feeds the Client Card (§3.9), the Wall of Ghosts (§6.9) and the review cards.

### The Ticket Paper Grammar
Support is one of the game's main pressure systems (§2.9's Ticket Avalanche) and has one visual note.

**How it looks:** Tickets are physical slips with encoded stock: **colour = sentiment** (cream neutral,
pink angry, blue enterprise), **size = customer value**, **corner fold = age**, **a red stamp = SLA
breached**, **a paperclip = attached to a parent incident**. In the tray they stack; in an avalanche
they rain; when Tier-1 deflects one it goes in a recycling bin with a satisfying whoosh; when one is
escalated it is physically carried across the office by a support sprite to an engineer's desk.
**You can read the whole support situation from across the room.**

### The Doorstep
§3.4's Trust Gap describes visitors checking your signals and never shows it.

**How it looks:** A threshold strip just inside the spawn edge. Visitors **stop on it for ~0.4s** and a
small thought-bubble checklist appears with your trust signals as ticks or crosses: padlock, status
board, review stars, phone number, years-in-business. Then they either walk on or turn around. **A
line of visitors stopping and turning at the doorstep is a completely different diagnosis from a line
of visitors bouncing at your app**, and you can see it from Z3.

### The Wall of Mirrors
§8.8's Site Preview Window is called "the single best UI idea in the document." At scale, one window
isn't enough.

**How it looks:** A togglable grid of miniature customer-eye previews — 4, 9 or 16 tiles, like a
broadcast monitor wall, each labelled with the tenant name and tinted by their tenant colour. Tiles
go red when that customer's experience is broken. **The video/streaming level already implies this
("a wall of preview thumbnails is the primary monitoring surface") — promote it to a universal
buildable-unlocked UI**, because "which customers are actually affected" is §8.8's stated
decision-changing question.

### The Arrival Metronome
§8.10's Visitor rhythm signature is a great idea with no instrument.

**How it looks:** A thin strip at the inbound edge showing arrivals as tick marks over the last 60
seconds. DNS is a solid grey blur; game servers are a rising evening ramp; backup is a single thick
block at 01:00; colo is one tick a quarter, drawn enormous. **The strip's silhouette is the line's
fingerprint**, and it is the same asset as §6's invoice calendar strip rotated.

### The Convoy and the Window Band
Backup's visitor needs its own staging.

**How it looks:** A translucent band lies across the board's timeline representing the backup window.
Jobs are freight crates that queue at the edge before the band opens, roll in while it is open, and
**are physically cut off at the band's trailing edge** — unfinished crates sit outside, half-open,
with a red seal. The band's edge is the level's clock and it moves visibly.
**Interacts with:** §7.8's Window mechanic, §1.3 "Restore Point," §1.5 `Hardware Refresh Weekend`
(same asset).

### The Red Case
Backup's *real* visitor — the restore request — deserves a bespoke unit.

**How it looks:** A single courier with a **red hard case**, arriving alone, walking slowly, with the
Taxi Meter running above them. Everything else on the board dims slightly while they're on it. When
the restore succeeds the case opens and its contents solidify (§8.7's FX_GhostSolidify). When it fails,
it opens and is empty. **One unit, one image, the whole business line's thesis.**

### The Party Chain
§3.3's group-arrival mechanic (five players, all-or-nothing) needs a render.

**How it looks:** Party members are drawn linked by a short visible tether, and the whole chain
occupies slots as a unit. If capacity is 3 and the party is 5, you watch the chain **fail to fit** and
the whole thing rebounds. **Partial capacity being worthless is instantly legible**, no tutorial.

### The Blueprint Visitor
Kubernetes/PaaS's "a visitor that changes your infrastructure" (§3.3) is the strangest visitor in the
game and has no art.

**How it looks:** A deployment arrives carrying a **rolled blueprint**. It walks to the control plane,
unrolls it, and the board physically rearranges to match — pods sliding, containers re-stacking. A
bad manifest unrolls into a blueprint with a visible error mark and the board rearranges *wrongly*,
which you watch happen. **Terrifying and correct**, exactly as §1.3 describes it.

### The Cohort Pattern (not colour)
§3.7's "Cohorts as colour" assigns paid/organic/referral/affiliate to orange/green/blue/purple — four
hues that all already mean something else in §8.2's language.

**How it looks:** Cohorts are encoded as **fill pattern on the visitor's livery band**: solid
(organic), diagonal hatch (paid), dotted (referral), cross-hatch (affiliate). Pattern survives the
colour-blind pass, survives greyscale, and leaves the hue budget alone. The Cohort Wall (§8.8) uses
the same four patterns, so the wall and the world agree.

### The Tour Rail
§3.3 calls the colo tenant tour "the best visitor idea in the brief" and §1.2 makes it a level. It
needs a camera.

**How it looks:** The tour is a **rail-cam sequence**: the camera locks to the prospect's shoulder and
moves on the Tour Route you built, at walking pace, for ~90 seconds. You cannot free-roam. A judging
strip at the bottom fills with small verdicts as they see things — `CABLE MGMT ✓`, `SPARE CAPACITY ✓`,
`AISLE 3: OBSTRUCTED ✗`, `UPS AGE: 7 YRS ✗`. **The player's only agency is what they built before the
camera started**, which is the entire point of the level.

### The Entourage
For whales and delegations.

**How it looks:** High-value units travel with smaller satellite units orbiting them — an enterprise
delegation is three distinct props (engineer's laptop, lawyer's folder, CFO's calculator) on a shared
slow-moving base, each with its own small satisfaction pip. If any pip empties, the whole group turns.
**Three meters on one unit is more legible than three units.**

### Glance Animations
A tiny reusable behaviour that carries a lot.

**How it looks:** Visitors perform a 0.3s head-turn toward things that matter to them: the uptime
board, the price tag, a queue, a competitor's billboard, another visitor bouncing. **Watching a
visitor look at a bouncing visitor and then leave** is word-of-mouth rendered without a system.

### The Empty Server Spiral, Drawn
§2.12's game-hosting spiral is a population feedback loop with no image.

**How it looks:** Each game shard renders a small crowd on its faceplate. As population drops, the
crowd thins, and **arriving players glance at the thin crowd and turn away** (reusing the Glance
Animation). The spiral becomes visible and its intervention point becomes obvious: seed the server.

---

## 4. Buildables: services and infrastructure

### The Back Office Mezzanine
*The biggest structural gap in the visual design.* §4.9 makes 40+ business functions buildable and
places none of them anywhere. They currently have no home on a board made of racks.

**How it looks:** A **mezzanine** — a glass-fronted office level running along one side of the
facility, visible at Z2–Z4 as a lit strip above the floor. Business buildables are **desks and
furniture** in it: Billing is a desk with a printer that runs on the 1st; Legal is a shelf of binders
and a closed door; Collections is a phone and an aging tray; Sales is an open bullpen with a gong;
Compliance is a locked cabinet with a seal; Insurance is a framed policy on the wall; the Board is a
meeting room with a long table that is empty except quarterly. **Business capacity becomes as
spatially legible as compute capacity** — an understaffed support function is visibly empty desks, and
a bloated one is visibly a crowded room you're paying for.
**Interacts with:** §4.9 in full, §6 (the Ledger Drawer lives here), §2.10's Paper Family (paper
accumulates on these desks), §4.7's The Office (this is its grown-up form).

### The Desk Grammar
The visual kit that makes the mezzanine cheap.

**How it looks:** Every business buildable = **surface + tray + prop + seat**. Surface says its tier
(folding table → laminate desk → oak). Tray says its workload (in-tray fill level, universally). Prop
says its function (one silhouette-distinct object). Seat says whether it's staffed, and by whom.
**Four slots, forty buildings.**

### The Truth/Face Pair Law
§8.4's "Racks, front and back" is the best single observation in the visual section. Generalize it.

**How it looks:** **Every** object has a Face (what it claims) and a Truth (what it is). A server's
face is a faceplate; its truth is the cabling and airflow behind it. A backup system's face is a green
check; its truth is the restore log. A status page's face is "all systems operational"; its truth is
the synthetic monitor. A staff member's face is their idle animation; their truth is the fatigue ring.
A business's face is the investor dashboard; its truth is the ledger. **A single flip verb — press F —
reveals the truth side of whatever you're looking at**, at every altitude, for every object class.
This turns §7.6's whole "everything is green" theme into a *gesture*.

### The Exposure Chevron Count
§4.1's port studs already carry an orange hazard chevron for internet-reachable ports. Make the count
mean something.

**How it looks:** The number of lit chevrons on an object *is* its attack-surface score, and the same
count appears on its Build Card's "Opens:" row and in the security overlay's brightness. Closing a
port visibly extinguishes a chevron with a small clunk. **Attack surface becomes a thing you can
count on the model**, which is P2 rendered as hardware.

### The Idle Animation Catalogue
§4.1 declares "if a buildable has no idle animation, it will feel like a spreadsheet row" and then
ships ~120 buildables without specifying one.

**How it looks:** Twelve reusable idles, assigned per family: **Breathe** (fan blur modulating with
load), **Chatter** (LED cadence at request rate), **Seek** (storage LED pattern), **Sweep** (a scanner
or dish rotating), **Meter** (a needle drifting), **Drip** (a valve or rate limiter clicking),
**Shuffle** (a queue advancing), **Tend** (a staffer performing micro-actions), **Settle** (cables
swaying fractionally), **Vent** (heat shimmer pulsing), **Tick** (a clock or counter), **Sleep** (an
unpowered object with one standby pip). **Twelve animations cover the whole catalogue**, and the
assignment is what makes families read.

### The Wear Channel Triad
§8.4's grime is one channel doing several jobs.

**How it looks:** Three separable wear channels on every object: **Dust** (maintenance debt — grey,
even, accumulates on horizontals), **Heat stain** (thermal debt — brown, directional, above vents),
**Hand wear** (change debt — polished edges, scuffed rails, peeling labels, accumulated *where hands
touch*). A machine can be dusty and cool, or spotless and heat-scarred, and those mean different
things. **Three sliders, one shader, three game systems made visible.**

### The Defense Off-State and Mis-Tune State
§8.7's defense verbs cover firing. Nothing covers a defense that is disabled or badly configured.

**How it looks:** A defense that is **off** has its mechanism physically parked (the turnstile arm
raised, the lattice dark, the scanner dish stowed) and a small dust film — it looks *out of service*,
not merely dim. A defense that is **mis-tuned** shows strain: the turnstile clicking too fast, the
lattice flickering, and — critically — **amber accumulating in its Mound of the Stopped**. A defense
with a rule that has never fired develops a distinctive cobweb decal (§2.9's "rule 47").

### The Facility Section Cut
Power and cooling are graphs drawn on a plan view, which is the wrong projection for them.

**How it looks:** A togglable **architectural section** — the building sliced vertically — showing
utility entry, transfer switch, UPS room, generator yard, busway overhead, CRAC loop, plenum, and the
raised floor. Power and cooling overlays render natively here instead of being flattened onto the
floor plan. **Electricity and air are vertical systems and deserve a vertical view.**
**Interacts with:** §8.4's power overlay and cooling, §2.8's power ladder, §4.7 in full.

### The Circuit Colour Band
Power feeds need identity, not just thickness.

**How it looks:** Each circuit gets a printed colour band at the PDU and a matching band on every
cord plugged into it. A dual-corded server with **two bands of the same colour** is visibly not
redundant. **§7.1's effective-vs-nominal redundancy becomes a thing you can spot with your eyes at Z2**
rather than a computed stat you have to go read.

### The Staff Silhouette Set
§4.8 says people are "the best animations" and describes eight roles by behaviour, not shape.

**How it looks:** Eight silhouettes distinguishable at 16px by **head shape + one carried object +
gait**: Junior (hoodie hood up, phone, fast), Sysadmin (lanyard, laptop, medium), Greybeard (mug,
nothing, slow), Network Eng (coil of cable, cable tester, purposeful), DBA (tablet, glasses, still),
Security (headset, dark jacket, stationary at the wall), Support (headset, paper slips, back and
forth), DC Tech (hard hat, cart, always pushing something). **Silhouette-only sign-off**: print them
black on white at 16px and if two are confusable, redesign.

### The Fatigue Posture Ladder
§4.8's fatigue ring is a number on a person. Posture is better and it's already suggested.

**How it looks:** Five authored postures: **Fresh** (upright, quick), **Working** (neutral),
**Tired** (shoulders down, slower walk cycle), **Burnt** (dragging, stops occasionally, a small error
pip), **Gone** (walks to the door and out, once, permanently). The ring remains as a numeric backup for
players who want it, but **the room's posture tells you the team's state from the establishing frame.**

### The Hands Dock
P4 calls attention "the scarcest resource in the game" and gives it "tokens at the bottom of the
screen." That's radically under-designed for the most important resource.

**How it looks:** A **peg rail** at the bottom-left, with one physical tag per hand, each bearing the
staff member's initials and role colour. Assigning a hand **lifts the tag off the rail and hangs it on
the object**, where it stays visible in the world for the action's duration with a small progress arc.
An empty rail is an empty rail — the most legible panic signal available. Overtime hands are drawn as
a tag hung *below* the rail, crooked. Automation removes the *need* for a tag and plays a small
animation of a tag being replaced by a printed card. **"I have money and no hands" becomes an image.**
**Interacts with:** P4, §7.5 in full, §4.8, §8.8's HUD skeleton.

### The Crash Cart as Console
§4.7 calls the crash cart "the most beloved object in any real datacenter and a perfect diegetic 'open
the console' UI" — build exactly that.

**How it looks:** Selecting a machine and pressing the console key **wheels a crash cart to it**: a
small CRT/LCD on a trolley with a keyboard tray. The in-game terminal (§7.6) renders on that screen,
in the world, at that machine, with the machine's own hostname in the prompt. **The terminal stops
being a UI panel and becomes a place you go.**

### The Spares Bin and the Dock Queue
Two inventory ideas that need to be visible objects.

**How it looks:** The **Spares Bin** is a wall of labelled parts drawers; each drawer front shows a
count, and an empty drawer is visibly open. The **Loading Dock** is a queue of crates with delivery
dates chalked on them; a crate cannot be racked until a hand moves it. **Lead time, stock level and
build queue all become one photograph** instead of three menus.

### The Air-Gap Class
§4.3's backup vault is "the one object in the game with no port studs." Promote to a visual class.

**How it looks:** Any air-gapped or offline object is rendered with a **physical gap** in the floor
around it — a painted break, a step, a literal absence of cable tray overhead — and it is the only
class that casts no connection shadow. When it is *mounted* (the ransomware mistake), a cable
appears across the gap and the gap's paint is covered by it. **You can see the mistake that makes
backups useless.**

### The Vendor House Styles
§5.4 mentions vendor art styles in passing; it deserves a real spec because it pays off everywhere.

**How it looks:** Four hardware dialects with distinct bezel geometry, LED arrangement, screw type,
label placement and material: **Institutional** (brushed metal, recessed handles, tasteful), **Budget**
(blue plastic, exposed screws, oversized sticker), **Enthusiast** (RGB, mesh, aggressive vents),
**Whitebox** (unbranded, blank bezel, hand-written label). The Junkyard acquisition level (§1.4) is
literally "four dialects in one rack," and the Acquisition Normalization Bar (§1) measures your
progress converting them. **Art direction as a game mechanic.**

### The Build Card Layout
§4.1 calls the Build Card "the most important UI element in the game" and doesn't lay it out.

**How it looks:** A 3:4 card. **Top third**: the object's front-panel illustration, rendered in the
vendor's dialect, on a neutral field. **Middle**: three columns matching the Three-Column Law —
*Gives / Costs / Opens* — with `Opens` in a boxed red row of threat glyphs, always the widest visual
element even when it's short, so the eye lands there. **Bottom strip**: six micro-stats as tiny
gauges rather than numbers — Cost, Upkeep, Power (W), Height (U), Latency (ms), Friction (%).
**Footer**: the one line "What does this let me charge for?" set in the Doc typeface as if
hand-annotated. **Interacts with:** P2, §4.1, §8.8's build catalogue.

### The Placement Refusal Icon Set
§7.3's "icon-not-text reasons" names four; there are at least eleven.

**How it looks:** ⚡ no power · 🌡 thermal · 📏 no U · 🔒 wrong zone/compliance · 🔌 no free port ·
⚖ floor load · 🚫 era-locked · 💧 leak zone · 🧯 suppression conflict · 📶 no path to the network ·
💰 can't afford. All one weight, all 20px, all drawn on the ghost itself at the point of conflict
(the icon appears **on the offending rack**, not on the cursor), so the refusal also tells you *where*.

### The Rack Elevation as a Buy Screen
A second purchase surface that costs nothing new.

**How it looks:** Open a rack's elevation (the flat front-on diagram); empty U slots are dark with
visible rails. **You can drag a build directly into a U slot from the elevation**, and the elevation
shows live amp and thermal budget bars down its side. This is how real capacity planning is done and
it makes §7.3's Rack U Tetris a real interface rather than an abstraction.

---

## 5. Unlocks and discovery

### The Codex Card, Specified
§5.4's bestiary is called "the single best art showcase in the game" with no card design.

**How it looks:** A specimen card in a consistent frame. **Five states, visibly different as
artifacts**: *Unseen* — a blacked-out silhouette on grey stock with `???` fields. *Seen* — the
silhouette filled but flat, one field filled (date first encountered). *Analyzed* — the specimen
rendered properly, pinned under glass like an entomology mount, behaviour fields filled, motion
described by a small looping animation in the corner. *Countered* — a green weak-point highlight is
drawn on the art, and a counter-item icon is clipped to the card. *Mastered* — the card gains a
letterpress-embossed border and the lifetime-cost figure is stamped across the bottom in red.
**The card becomes a better object as you learn**, so the Codex is a physical progress bar.

### Progressive Icon Disclosure
§8.8's Growing Tooltips are text. Do the same to the icons.

**How it looks:** A threat's board glyph gains detail with Codex level: at *Seen* it's an undifferentiated
violet blob; at *Analyzed* it's the family silhouette; at *Countered* it carries its class marking; at
*Mastered* it carries a small tag showing the counter that handles it. **Your literacy is visible in
the world, not just in a menu** — and a veteran's board genuinely looks different from a novice's.

### The Marker Colour Code
§5.8's whiteboard has three marker colours and no assignment.

**How it looks:** Black = things that exist. Blue = things you're planning. Red = things that hurt you
(the Scar nodes). Green = things that worked. A fourth, **faded blue**, is knowledge that decayed
(§5.7). The *hand* matters too: system-drawn nodes are neat; staff-drawn nodes (§5.4's hires who draw
their own) are in a visibly different handwriting, and when that person leaves their strokes fade to
40% but never erase.

### The Whiteboard at Scale
A 300-node tech tree does not fit on a whiteboard.

**How it looks:** The board **grows physically**: one board at Tier 1; a second board wheeled in
beside it at Tier 3; by Tier 5 it's a wall of four boards plus taped-on A3 printouts plus a
photographed section pinned over an erased area. Navigation is pan/zoom on the wall. Branches cluster
by marker colour. **The tree's unreadability is authored and characterful rather than accidental**,
and there's a "clean copy" button that redraws it as a neat blueprint — which costs a staff hand and
is itself a joke about documentation.

### The Scar Tree Ink
§5.1's "LEARNED THE HARD WAY" stamp deserves a spec because it's the document's most shareable idea.

**How it looks:** A rubber-stamp impression in dark red, slightly off-register, partially overlapping
the node's box, with the date hand-written into it in a different pen. It never lines up neatly. **The
imperfection is the emotional content.** Hovering it shows the one-line incident description in the
Doc typeface.

### The Confidence Stroke Law
§2.9's hollow-vs-solid checkmark is the cleverest single visual idea in the document. It should be a
universal law, not one backup widget.

**How it looks:** **Hollow stroke = asserted. Solid fill = verified.** A backup that has never been
restored is a hollow check. An untested failover path is a hollow arrow. A cert whose chain you haven't
validated is a hollow padlock. A redundancy you bought but never load-tested is a hollow N+1 badge. A
compliance control that has evidence is solid; one that has a policy document only is hollow. **One
stroke property carries the entire theme of the game**, and a board full of hollow glyphs is the most
honest picture of a company you can draw.
**Interacts with:** §2.9, §4.3's Restore Drill, §4.5's chaos/load testing, §5.7, §7.1's effective
redundancy, §9.2's Compliance Theater Meter.

### The Fog Grades
§7.6/§5.4's fog of instrumentation is binary. It has at least three states.

**How it looks:** **Unknown** — the object renders as an untextured grey mass with a `?` and no
readouts (you know something is there because a cable goes to it). **Stale** — the object renders
correctly but its readouts carry a small clock glyph and a `last seen 4m` watermark, and its numbers
are set in a lighter weight. **Live** — full fidelity. The stale state is the important new one,
because **"my monitoring is running but this agent stopped reporting" is a real and common failure**
and the game currently can't show it.

### The Research Bench
Intel is a currency with no place to spend it.

**How it looks:** A corner of the office: a bench with a captured specimen under a dome (§5.4's
reverse-engineering), a microscope, pinned printouts, and a rack of labelled sample jars — one per
threat you've dissected. Spending Intel plays a short assembly animation at the bench. **The lab
becomes a museum of things that tried to kill you** (the document's phrase) rather than a menu.

### The Pegboard, Specified
§5.8's pegboard is the best "what am I missing" UI available.

**How it looks:** A shadow board in the workshop. Unowned tools are **painted silhouettes**; owned
tools hang in their outlines; a tool currently in use is **missing from its outline** (a staff member
has it), which doubles as a hands readout. Tools you owned and lost (fired staff, divested lines) leave
their outline and a small dusty hook. **Absence rendered three different ways, all readable.**

### The Business Licence Wall
§5.8 has the placard; give it a wall and a lifecycle.

**How it looks:** A row of framed service-launch placards, one per hosting line, in launch order, each
with the line's accent colour and start date. Active lines are lit. **Divested lines are turned to face
the wall** (already noted — keep it). A line you lost badly gets its glass cracked. The wall is the
single image that answers "what kind of company is this."

### The Rot Materials
§5.7's deprecation is described in colour only (yellow → red), which is exactly what §8.2's own law
forbids.

**How it looks:** Four material states on the node **and** on the real object: **Current** (clean),
**Aging** (a small "EOL 20XX" sticker applied, corner peeling), **EOL** (the sticker is now a large
orange band across the faceplate, and the object's LEDs run at a slightly different colour temperature
from its neighbours), **Abandoned** (dust sheet, cordon post, one red standby pip). **Rot you can see
across the room without an overlay.**

### The Abandoned Wing, Specified
§5.7's melancholy idea deserves art direction.

**How it looks:** Dust sheets over racks, a cordon of retractable belt barriers, floor paint faded and
scuffed, the line's accent hue drained to 15% saturation, **one working light on a motion sensor that
turns on when your camera enters and off when it leaves.** No sound but the building's. It is the best
screenshot in the game and it costs almost nothing.

### The Unlock Ceremony Tiers
§5.8 lists eight unlock presentations with no rule for which to use.

**How it looks:** Four weights, assigned by cost: **Tier 0 (a tuning option)** — a soft chime and the
control appears, 0.2s. **Tier 1 (a small build)** — the Faceplate Reveal wipe, 1s, no camera move.
**Tier 2 (a major build or research node)** — The Delivery cutscene or Whiteboard Redraw, 6–10s,
skippable. **Tier 3 (a new hosting line, a tier-up, an era)** — full ceremony: title card, placard
mounting, floor-plan redraw, palette shift, 15–20s, skippable but nobody will. **A stated ceremony
budget is what stops unlock fatigue.**

---

## 6. Economy, money, and scoring

### The Three-Clock Cluster
§7.9's Three-Clock Rule is called "the document's single best pacing heuristic" and has **no UI at
all.** This is the largest unbuilt HUD element in the document.

**How it looks:** Three concentric dials in one corner instrument, sized small/medium/large and
sharing a face. **Inner (fast)** — the current wave or incident, a fast sweep hand, red when running.
**Middle (medium)** — the month, the maintenance window, the migration, drawn as a filling arc with
the invoice-calendar ticks on it. **Outer (slow)** — the contract, the audit, the era, drawn as a
barely-moving arc with one marker. Each hand has a tiny label. **If a fourth timed system is proposed
and there is no ring for it, it doesn't ship** — the instrument enforces the rule.
**Interacts with:** §7.9, §1.7, §6.4's invoice calendar, §8.8.

### The Ledger Drawer, Specified
§8.8 has the object; it needs a document design.

**How it looks:** A ring binder that slides out over the bottom third of the screen. Tabbed dividers in
five colours. Pages are **accounting stock** — pale green ruled paper, tabular figures in a
typewriter-adjacent face, hand-annotated totals in blue pen, a red pen circle around anything that's
bad. Cash-flow pages have a real column-and-rule layout. The P&L's "Technical Debt Service" line is
**printed in the same typeface as everything else**, which is what makes the joke land. Closing it is
a physical snap.

### The Gap Bar
§6.4's Cash-vs-Profit is the central financial mechanic and its visual is "two meters side by side."

**How it looks:** One shared vertical scale with **two markers** — a filled bar for Cash and a hollow
outline for Profit — and the **space between them is rendered as a hatched zone with a number in it.**
Growing widens the hatch; the hatch is the thing you watch. When Profit is above Cash the hatch is
amber and labelled `UNCOLLECTED`; when Cash is above Profit it's grey and labelled `DEFERRED`. **One
widget teaches the whole lesson.**

### The Drain Choir
§8.7's money-as-motion has coins arcing in and "thin falling streams" going out. Name and label them.

**How it looks:** Below the cash column, **five labelled streams** fall continuously at rates
proportional to spend: `POWER`, `PAYROLL`, `TRANSIT`, `LICENCES`, `DEBT`. Each has a slightly different
particle and a slightly different pitch in the audio bed. Hovering one freezes it and traces it to the
objects producing it (highlighting them in the world). **You can see and hear your burn rate broken
down**, and "which of these can I cut" becomes a click rather than a menu dive.

### The Invoice Calendar Strip
§6.4 says "play the calendar" and gives no calendar.

**How it looks:** A month strip along the bottom of the ledger drawer (and, collapsed, in the HUD):
31 cells, with icons on the days that matter — a printer on the 1st (billing run), small declining
card glyphs on 1–4, envelope glyphs on 5–20 (dunning), a payroll stamp on the 15th and the last, a
transit invoice mid-month. Today is a lit cell. **Cash becomes a timing puzzle you can see the shape
of**, exactly as the entry asks.

### The AR Aging Shelf
Receivables need a physical metaphor or they stay abstract.

**How it looks:** Four trays labelled 0–30 / 31–60 / 61–90 / 90+, each holding invoice slips. Slips
**physically slide right** as they age and yellow as they go. The 90+ tray has a collections stamp on
it. An invoice that clears flies out as a coin arc. **The shape of your receivables is the shape of
four trays**, which is precisely how it feels in a real back office.

### The Runway Tone Shift
§6.4 says "under 3 months, the UI changes tone" without saying how. This needs to be exact or an
artist will invent five versions.

**How it looks:** Three stages, applied to **chrome only** (never to the world, never to the alert
colours). **>6 months:** normal. **3–6 months:** the HUD's chrome desaturates ~30%, the money column's
frame gains a thin amber rule, and non-essential HUD elements (cosmetic counters, the achievement
toast) auto-hide. **<3 months:** the chrome goes to a colder grey, the runway number is promoted into
the top bar at double size with a weeks-remaining subline, the build catalogue's expensive entries dim,
and the Drain Choir's streams gain a visible width increase. **Nothing flashes, nothing pops. It just
gets quieter and colder, which is what being nearly broke actually feels like.**

### Money at Three Scales
§8.7's coin arcs are lovely at 40 customers and catastrophic at 40,000.

**How it looks:** Three LODs, automatic. **Discrete** (<~30 conversions/sec): individual coin motes,
individual ticks. **Drizzle** (30–500/sec): a continuous fine gold stream whose *density* is the rate
and whose audio becomes a texture, not individual ticks. **Sheen** (>500/sec): no particles at all —
the conversion node carries a steady gold rim-light whose intensity is the rate, and the counter
simply rolls. **The transition must be smooth and automatic**, or DNS and serverless levels will melt
the frame budget.

### The 95th-Percentile Graph, Specified
§6.3 calls this "the most teachable cost in hosting" and says the graph "explains itself." Draw it.

**How it looks:** A month-long traffic graph with the **top 5% of samples visibly lifted and greyed
out**, floating slightly above the plot as discarded confetti, and a heavy horizontal rule drawn at
what remains — labelled with the dollar figure, not the Mbps. Your commit level is a second, dashed
rule. **The picture says "these spikes are free and this line is the bill."**

### Money Left On The Table, as Negative Space
§6.9's counterfactual is a number. It should be a shape.

**How it looks:** On the score screen, the revenue bar is drawn at the height you *achieved*, with a
**ghosted outline extending above it** to the height you could have reached, and the gap filled with
the bounce-cause glyphs in proportion. **The missing money has a silhouette**, and its composition
tells you which system to fix.

### The Traffic Sankey, Specified
§6.9's Sankey is the only readout that shows false positives. Make it unmissable.

**How it looks:** One thick inbound ribbon splitting into five: `SERVED` (cyan, left, largest),
`QUEUED→SERVED` (cyan, thinner, with a clock glyph), `BOUNCED` (grey), `BLOCKED` (magenta),
`BLOCKED IN ERROR` (amber). The amber branch is drawn **last and on top**, crossing the others, so it
is always the branch your eye follows. Each branch is labelled with a count and a dollar figure.

### The Instrument Cluster
§6.9's per-line scorecard reweighting and §7.8's per-type meter swap both promise a different
headline gauge per hosting line. Without a shared industrial design they'll look like a flea market
(there are ~25 of them across §1.3 alone).

**How it looks:** **One bezel, many faces.** Every signature meter shares: a 44mm circular or 120×28
rectangular housing, the same bezel material, the same tick weight, the same needle/fill colour rules,
the same label plate at the bottom. What changes is only the *face*: a pendulum (tick rate), a
clamp-meter needle (amps), an hourglass (RTO), a candle (p99 steadiness), a postmark stamp (email
reputation), a fill gauge (durability), a dual-needle crossing gauge (crypto), a checklist plate
(compliance coverage), a closing wedge (satellite pass), a density comb (shared hosting). **Twenty-five
faces in one housing family reads as a designed instrument panel; twenty-five bespoke widgets reads as
chaos.**
**Interacts with:** §7.8, §6.9, §8.10's Five-Asset Skin Kit (this *is* asset #4, specified).

### The Grade Stamp
§6.9's letter grade and flavour title are the shareable moment.

**How it looks:** The grade is a **rubber stamp** slammed onto the postmortem document, off-register,
with the flavour title hand-written beneath in the Doc typeface. S-grade uses gold foil; F uses a
smudged, half-inked impression. The stamp animation is 0.4s with a physical thud. **The screenshot
people post is the stamp**, so it gets the animation budget.

### The Diligence Memo
§6.9's diligence report is "a far more interesting ending than a number." Make it a document.

**How it looks:** A three-page memo on letterhead from a fictional acquirer, in a serif face, with
**red flags literally flagged** — a red sticky tab on the page edge for each one, and the offending
sentence underlined in red pen with a margin note (`concentration?`, `no evidence of restore testing`).
You physically turn the pages. **Being judged in someone else's handwriting is devastating.**

### The Wall of Ghosts, Specified
§6.9's churned-customer wall should use the Customer Portrait System.

**How it looks:** Small greyscale portrait cards in a grid, each with the customer's name, tenure, and
their **exit-survey quote** printed beneath in their own voice. Cards are pinned, slightly crooked.
Hovering restores their colour for a moment. A card for a customer you *saved* and later lost anyway
has a small repaired tear. **Cruel and correct.**

### Per-Type Currency Glyphs
The unit of sale changes per line (§6.2) and the money iconography doesn't.

**How it looks:** The coin mote itself takes the line's unit: a coin (generic), a **U-bracket** (colo
space), a **plug** (kW), a **slot** (game), a **GB-month tile** (storage), a **minute** (VoIP), a
**GPU-hour chip** (AI), a **patch cable** (cross-connect, and it should be visibly the fattest, most
satisfying money glyph in the game because it's the highest-margin line). **The money you earn looks
like the thing you sell.**

---

## 7. Core gameplay mechanics

### The Pause Frostpane and the Intent Layer
§7.5's pause-with-orders is a core verb with no visual state, and ghost builds/queued orders/forecasts
currently have no shared treatment.

**How it looks:** Pausing applies a subtle cool frost to the Substrate and Flow layers — motion stops,
saturation drops ~15%, a faint blueprint grid fades up over the floor — while the **Annotation layer
brightens and expands**: labels that were culled reappear, every object shows its key stat, and
dependency lines become visible. Queued orders draw in the new **Intent layer**: white, dashed,
numbered in execution order, with a ghost of the result. Unpausing plays the frost retreating and the
intent lines converting to real actions one by one.
**Interacts with:** §7.5, §7.3's ghost build, §8.2 (Intent is the fourth layer — see §8 below).

### The Speed Cost, Rendered
§7.5's best mechanic — "at high speed you get less information" — is currently invisible, which means
players will never connect the mechanic to the consequence.

**How it looks:** As speed increases, the world **visibly loses annotation**: at 2× the log panel
switches from lines to a density bar; at 4× per-object stat plates disappear, small anomaly pips stop
being drawn, the Pulse Strip's resolution coarsens visibly, and a thin motion-blur streak appears on
the Flow layer. The speed control itself shows what you're giving up as a small crossed-out eye. **You
can see yourself choosing to look away.**

### The Selection Grammar
Three distinct states, currently undifferentiated.

**How it looks:** **Hover** — a thin white outline and a hover card, no world change. **Select** — a
white base ring on the floor beneath the object, the inspector opens, dependency ghosting fires
(§7.2). **Pin** — the object gets a physical clip/bookmark tag, stays highlighted when you select
something else, and a **tether line** runs from it to a docked mini-inspector at the screen edge. You
can pin up to four. **Pinning is how you watch the database while you fix the cache**, and no strategy
game does it well.

### The Mismatch Seam
§7.2 calls physical-vs-logical disagreement "the best idea in this section." It needs an image, because
the whole point is that you *don't* notice it.

**How it looks:** A **Compare** mode draws both graphs at once: logical links as clean orthogonal
routes above, physical cabling as sagging catenaries below, rendered in the same frame. Where they
agree, the two coincide and read as one thicker line. Where they disagree, they **separate visibly
into a lens-shaped gap** — the seam — which is hatched and carries a count. Your "redundant" pair with
one PDU shows a seam you can point at. **The bug is literally a shape.**

### The Policy Bead Set
§7.2's policy beads are a lovely idea with no inventory.

**How it looks:** Eight bead shapes threaded on the cable, readable at Z2: **padlock** (TLS),
**valve** (rate limit), **fuse** (circuit breaker), **hourglass** (timeout), **fan-out** (connection
pool, with a number), **loop-arrow** (retry policy), **gate** (firewall rule), **filter cone**
(egress). A bead that is *tripped* changes state visibly — the fuse blows, the valve closes, the gate
drops. **Configuration you can see from across the room, and failures that happen on the wire rather
than in a log.**

### The Drain Animation
§7.2's drain verb is "entirely about patience" and needs to be watchable or nobody will use it.

**How it looks:** Starting a drain plays a **dashed chevron pattern moving away from the node** along
the cable, plus a translucent barrier at the node's intake that new traffic bounces off. The node's
active-slot ring empties one segment at a time. A progress arc closes. When it hits zero the cable
goes dim and the disconnect becomes safe (the port stud turns from solid to hollow). **Yanking a live
cable instead plays FX_SnapThread with the in-flight motes visibly winking out** — the contrast between
the two is the lesson.

### The One-Way Door
§7.7 says this is "senior-engineer knowledge, taught by a symbol," and doesn't design the symbol.

**How it looks:** A **ratchet glyph** — a half-circle with a pawl — in amber, placed on the confirm
button and on the object itself for the duration. Irreversible actions also get a different
confirmation shape: not a dialog, but a **physical slider you must drag**, labelled with what you're
giving up. Reversible actions confirm with a normal button. **You learn the ratchet in ten hours and
then it does all the work.**

### The Partial Failure Set
§7.7 enumerates six partial-failure states and renders none of them.

**How it looks:** Six distinct object treatments. **Read-only** — the object's write-side port goes
hollow and a small padlock sits on the inbound arrow. **Stale** — the poisoned tint (§2 above) plus a
clock watermark on its readouts. **Degraded** — thermal warm shift plus a visibly slower idle
animation. **Flapping** — the object's LEDs and outline **desynchronize from the global heartbeat**
(§8.9), which is the single most noticeable thing you can do on a synchronized board. **Split** — the
object renders with a hairline vertical seam and its two halves have different tints. **Silent-wrong**
— **it looks perfect**, and the only tell is a discrepancy between its Face and its Truth (§4 above),
which is why the flip verb exists.

### The Cascade Fuse
§7.7 asks for "a burning-fuse animation" at a readable speed.

**How it looks:** The cascade travels along links at a fixed **1.5 seconds per hop regardless of
simulation speed** (it is drama, not simulation), as a bright travelling node with a trailing char
mark on the cable. A circuit breaker in its path **stops it visibly** — the travelling node hits the
fuse bead, the bead pops, and the cascade dies with a puff. **Watching a breaker you bought three
levels ago eat a cascade is the single best payoff animation available.**

### The Recovery Ladder
§7.7's recovery order "is a puzzle with a correct answer." Show the answer's shape.

**How it looks:** During a cold start, the dependency graph renders as a **vertical ladder** — storage
at the bottom, traffic at the top — with each tier a rung. Bringing a tier up lights that rung and
sends a satisfying illumination pulse upward to the next. Bringing one up **out of order** shows the
rung lighting and then failing back to dark with a thunk, and the rung below it flashes. `Black Start`
(§1.5) is this ladder with a flashlight.

### The Overlay Wheel, Specified
§7.6's overlay discipline is the answer to readability at scale and has no design.

**How it looks:** Hold `Tab` and ten wedges fan out around the cursor, each a **colour swatch plus one
icon**, arranged so opposites are opposite (Traffic ↔ Cost, Thermal ↔ Power, Security ↔ Capacity).
Releasing on a wedge applies it. The active overlay is announced by a **2px border tint around the
entire viewport** in that overlay's key colour, plus a small persistent chip naming it, plus — crucially
— **a legend card in the corner showing the scale**, because an unlabelled false-colour map is a lie.
Only one may be active; selecting a second swaps with a wipe.

### The Overlay Palette Table
Each overlay needs an *exclusive* palette so they can never be confused.

**How it looks:** Traffic = cyan mono. Latency = cyan→magenta divergent. Power = copper mono. Thermal =
iron (black→red→white). Security Surface = pure luminance on black. Cost = green mono. Capacity =
green→amber→red ramp. Maintenance Debt = sepia/grime. Blast Radius = a single flood fill, no ramp.
Redundancy = two-tone paired/unpaired only. **Ten overlays, ten unmistakable looks, none of which
reuse the alert triad.**

### The Blast Radius Bloom
§7.1's blast radius is a hover highlight. Make it spatial.

**How it looks:** Hovering an object floods everything that dies with it in a **single flat colour with
no gradient** — deliberately ugly, deliberately unambiguous — and draws a boundary line around the
flooded set. The count appears on the boundary. The flood ignores walls and racks, which is the point:
**blast radius is not geography.**

### The Broken-N+1 Badge
§7.1's effective-vs-nominal redundancy is a computed stat with no glyph.

**How it looks:** A small `N+1` badge on any object pair you bought redundantly. When the pair shares a
failure domain, **the badge's `+1` is struck through** and the shared domain is named beneath it in
6pt (`PDU-A3`, `sw-core-1`, `fw 4.2.1`). Hollow stroke if the failover has never been tested
(Confidence Stroke Law). **Three visual properties on a 16px badge encode the entire redundancy
question.**

### The Ugly Auto-Route
§7.2's auto-route "makes a working but suboptimal topology." Make the suboptimality visible.

**How it looks:** Auto-routed cables are drawn **without bundling, at slightly wrong lengths, in the
wrong colours, taking the long way around** — they look exactly like cabling done in a hurry, because
they were. They count against the cable-management score. Manually re-routing one plays a tidy-up
animation. **The accessibility option and the skill ceiling coexist because the game is honest about
which you used.**

### The Degraded-Mode Console
§7.5's pre-configured degradation ladder is the game's core reward loop (prep → payoff) and has no
object.

**How it looks:** A **physical switch panel** in the office: five labelled toggles in a row
(`RECOMMENDATIONS`, `SEARCH`, `UPLOADS`, `STALE CACHE OK`, `STATIC ONLY`), each with a threshold dial
beside it. In peacetime you set them. In crisis they throw themselves in sequence, **and you watch the
switches flip one by one** while the corresponding features grey out in the Site Preview Window.
**Preparation rendered as hardware you installed and then get to watch work.**

### The Big Red Button, Under Glass
§7.5 calls it "the most honest button in the game."

**How it looks:** A mushroom-head emergency stop under a hinged clear cover, mounted on the desk.
Opening the cover is a separate click and plays a latch sound. Pressing it requires a hold. Afterwards
the cover stays open and the button stays lit red until you reset it — **a visible reminder that you
did that**, which is exactly the shame it should carry.

### The Inbox Deck
§7.5's decisions-as-cards is the whole business tempo and has no card design.

**How it looks:** A small physical stack in the lower right, slightly fanned, with the top card's
sender visible. Cards are **different stocks by source**: customer (lined notepaper), vendor (glossy
sales sheet), legal (heavy cream), press (newsprint), internal (post-it). Choosing plays the card being
pulled and either filed, torn, or **pinned to the Obligation Rail** if it creates a future consequence.
A card you ignore slides to the bottom and yellows.

### The Terminal Window
§7.6's in-game terminal needs to not look like a UI panel.

**How it looks:** It renders on the crash cart's screen (above) at Z1, and as a **floating CRT window
with a slight barrel, a scanline shimmer, and a visible bezel** at other altitudes — deliberately the
only element in the game with curvature, so it reads as a different object class. Its typeface is the
era's terminal font. Output uses real column alignment. **The one place the CRT art style (§8.1's
option C) lives permanently.**

### The Log Anomaly Tick
§7.6 wants players to be rewarded for reading logs without requiring it.

**How it looks:** Anomalous lines in the scrolling log get a **1px left-edge tick** in violet
(unidentified) — not a highlight, not a colour change, just a tick. Clicking the line pins it and
begins an investigation. **Subtle enough that noticing it feels like a skill**, which is precisely the
brief for that mechanic.

---

## 8. Visuals and presentation

*These are the cross-cutting laws. The rest of the report depends on them.*

### The Fourth Layer: Intent
§8.2's Three-Layer Rendering Rule is excellent and incomplete — it has no home for things that do not
exist yet, which the game is full of (ghost builds, queued orders, forecasts, the 90-day lag's pending
consequences, staged rollouts, blueprint previews, the migration ghost).

**How it looks:** A fourth layer, **Intent**, sitting between Flow and Annotation. Its rules:
**white or near-white only; always dashed or half-toned; never lit; never occludes; always
perspective-correct** (unlike Annotation). Anything in the Intent layer is a *promise*, and when the
promise resolves it converts to Substrate or Flow with a one-second solidify. **One layer unifies eight
scattered "ghost" ideas across the document.**

### The Emissive Allowance
§8.2 says "Substrate never glows," and §8.4 makes blinkenlights the primary telemetry, §7.4 adds tier
rim-lights, §4.2 adds a lit power button. These are in direct contradiction and an engine rule needs
to resolve it.

**How it looks:** Substrate may emit only as **points and thin rims**, capped at ~2% of the object's
screen area, and only in the object's own state colours. Flow may emit as **volume** — ribbons, motes,
plumes, washes. Annotation and Intent never emit at all. **Stated as a budget rather than a
prohibition, the rule survives contact with the art the document already asks for.**

### The Diegetic Annotation Exception ("Objects of Record")
§8.2 says "annotation never has perspective," while §8.8's diegetic meters, the NOC wall, the
whiteboard tech tree, the Company Wall, the ledger binder and §9.4's diegetic settings menu are all
perspective-correct annotation. Resolve it explicitly rather than leaving it to be discovered.

**How it looks:** A named exception class, **Objects of Record**: information surfaces that exist in
the fiction. Their rules: they are Substrate geometry with Annotation content; **they may never be
load-bearing during an incident** (you must never have to read a wall-mounted gauge at an angle to
survive a sev-1); every Object of Record has a flat HUD equivalent one key away; and they are always
readable-or-ignorable, never half. **This lets the game be diegetic without being unplayable.**

### The Hue Ledger
§8.2's colour language assigns nine hues, but across the document several hues have picked up two or
three jobs. This table resolves them; the collisions are listed so the merge agent can see what moved.

| Hue | Sole meaning | Moved off it |
|---|---|---|
| **Cyan** | legitimate traffic and data in motion | blueprint linework → **Ink Blue** (a darker, desaturated blue used only for the Intent/blueprint register); data *ports* → keep cyan (same family, acceptable) |
| **Magenta** | hostile traffic, always | — |
| **Amber** | **your own defenses harming you** — false positives, over-tuning, self-inflicted friction | "degraded state" → **Warm Grey-Amber** at lower saturation, distinct enough not to be confused with a false-positive flash |
| **Gold** | money, only money | power feeds (§8.4) → **Copper**; whale/value glow → keep gold (it *is* money) |
| **Copper** | power, amps, electrical | (new) |
| **Orange** | heat, thermal, fire | (unchanged, but must be clearly separated from Copper in the palette — copper is darker and less saturated) |
| **Red** | failure, loss, down | — |
| **Green** | verified, healthy, restored | "organic cohort" → cohort **pattern**, not hue |
| **Violet** | unidentified / unclassified, only | trust-auth ports (§7.2) → **Teal-Violet** as a port colour only, never on a moving unit; affiliate cohort → pattern |
| **White** | player intent, selection, and the single Correlated-Failure line | — |
| **Grey** | inert, unpowered, stranded, abandoned | — |

**Why it matters:** the document's single strongest colour idea — *violet resolving into cyan and
magenta is the core loop rendered* — is destroyed if violet also means "auth port" and "affiliate
customer." **One hue, one job, no exceptions.**

### The Alert Triad Rule
§8.2's Readability Budget says "3 alert colours maximum," but the colour language contains five
alert-adjacent hues (amber, orange, red, magenta, violet) and every system wants one.

**How it looks:** At most three alert hues may be *simultaneously active as alerts* on screen, and they
are chosen by **severity**, not by system: the current worst severity gets red, the second gets its
native hue, and everything below third aggregates into a single neutral pip with a count. **Severity,
not subsystem, owns the alert palette** — which is also how a real NOC wall works.

### The Ring Taxonomy
Rings and halos are currently doing at least six jobs (patience, staff fatigue, client mood, squatter
tell, insider tell, selection, timers, RAID rebuild, load donut).

**How it looks:** Four distinct annular forms, never interchanged. **Ring** (thin, full circle,
depleting clockwise) = **time running out** — patience, timers, rebuild windows, cert seals. **Donut**
(thick, segmented) = **utilization** — the load donut, only. **Halo** (soft, offset above the unit) =
**mood/sentiment** — customers, staff. **Arc** (partial, below the unit, on the floor) = **player
state** — selection, assignment, targeting. Plus **Pips** (discrete dots, never rings) for counts and
skill levels. **Four forms, six systems, zero ambiguity.**

### Stroke Weight as Certainty
An unused visual axis that solves a recurring problem.

**How it looks:** Across every glyph, badge, line and check: **hairline = inferred, normal = measured,
heavy = verified/contractual.** A latency figure your monitoring estimates is hairline; one from real
user monitoring is normal; an SLA commitment is heavy. Combined with the Confidence Stroke Law (hollow
vs solid), the game gets a complete visual vocabulary for epistemics — **which is the actual subject of
§7.6.**

### The Silhouette Sheet (production gate)
**How it works:** Every unit, buildable, staff member and threat ships with a black-on-white silhouette
plate at 16px, 24px and 48px. Sign-off requires that no two units within one family are confusable at
24px and no two families are confusable at 48px. Shipped as a single poster in the art bible. **This
one artifact prevents the late-game mush that kills strategy-game readability**, and it is the concrete
mechanism behind §8.5's "identify a threat class from silhouette at Z3 with colour removed."

### The Motion Budget per Altitude
§8.2's Readability Budget caps FX types but not motion density, which is what actually breaks at scale.

**How it looks:** Z1 — unlimited (you're looking at one object). Z2 — max 3 continuous animations per
rack. Z3 — **no per-object animation at all except state changes and the global heartbeat**; all motion
is Flow. Z4 — motion only on arcs and weather. Enforced in engine by LOD, not by taste. **The Quiet
Frame Test (§8.9) is unpassable without this rule.**

### The Strobe Budget (photosensitivity)
The document currently specifies flashes, sparks, screen-shake, white-frame flashes (PSU pop), gas
floods, lightning yanks, and "everything flashing" events, with no safety spec at all.

**How it looks:** A hard engine rule: **no more than 3 luminance transitions per second across more
than 25% of the screen, ever**, and a **Reduced Flashing** accessibility mode that converts every flash
FX to a non-flashing equivalent from a published table (flash → a 0.3s fill; shake → a 4px settle;
gas flood → a wipe; strobe alarm → a steady bar). This is a legal/accessibility requirement in several
markets and it needs to be in the design document, not discovered in QA.

### Three Colour-Blind Palettes, Named
§8.2 promises colour-blind-first design and ships one undefined "high contrast mode."

**How it looks:** Three shipped palettes plus the default. **Deuteranopia/Protanopia set**: magenta →
deep orange-red, green → blue-white, amber → yellow-white, cyan unchanged; shape weight increases 25%.
**Tritanopia set**: cyan → light grey-blue, gold → pink-red, violet → dark teal. **Monochrome +
Shape-First**: all hue removed, all encoding carried by shape token, pattern fill, stroke weight and
motion; alert severity by luminance and by an added corner notch. **Shape-First should be playable and
somebody's preferred mode**, which is the real test of whether the Diamond/Circle/Triangle law was ever
honoured.

### The Hum Bar (audio telemetry, made visible)
§8.11 makes ambient audio a **primary telemetry channel** — "the player learns to hear a problem before
seeing it" — which means deaf and hard-of-hearing players lose a whole diagnostic system. §8.11's
"audio as visual redundancy" note acknowledges this and does not solve it.

**How it looks:** A thin horizontal **room-tone strip** along the bottom edge, ~6px tall. Its baseline
height is fan load; its texture is the sound's character. Events draw named marks on it: a rising
wedge (fan ramp), a hard notch (silence — power loss, or a mimic's telltale quiet), a comb (drive
click), a spike with a lightning glyph (breaker snap), a rhythmic dotted run (scanner ping sweep), a
jagged crystalline mark (ransomware). Hovering a mark names it. **It is also genuinely useful for
hearing players**, because it gives audio a scrubbable history — you can see the sound you just missed.
**Interacts with:** §8.11 in full, §2's Silent Threat Strip, §8.8's Pulse Strip (they stack).

### Diagnostic Audio Captions
The companion to the Hum Bar.

**How it looks:** An optional caption line for **diagnostic** sounds only (never for ambience), in the
style of well-done game subtitles: `[drive click — rack 4, bay 7]`, `[generator cranking]`,
`[breaker snap — circuit A3]`, with a directional arrow. Crucially it includes **location**, because
§9.2's Beeping Server minigame is otherwise unplayable without hearing. **Captions that carry position
are a genuine accessibility advance and cost almost nothing here** because the simulation already knows.

### The Type System
The document specifies typography only in passing ("Comic Sans warnings," "tabular figures," "crisp
modern sans").

**How it looks:** Three families, never mixed within a surface. **Signage** — a condensed industrial
sans used for everything that exists physically in the world: rack labels, asset tags, floor paint,
placards, port numbers. Must survive 8px and extreme perspective. **Chrome** — a neutral UI sans with
true tabular figures, used for the HUD, inspector and cards. **Doc** — a typewriter/serif pair used for
everything on paper: tickets, the ledger, postmortems, the diligence memo, the intern's log, and all
handwriting substitutes. Plus one **Marker** face for the whiteboard and sticky notes.
**Interacts with:** §8.10's era shifts (below), §9.4's procedural label text, §1.8's Tier-Up Title Card.

### The Number Law
Numbers are half this game's surface area and are unspecified.

**How it looks:** Tabular figures everywhere, always. Counters roll digit-by-digit, never snap
(§8.7 has this — make it universal). Units are always present and always in a lighter weight than the
value. **Money is never abbreviated below $10k** (the difference between $9,400 and $9,412 matters when
you're nearly broke). Percentages get one decimal only when below 10. Latency is always ms, never s.
**Nines are rendered as nines with the minutes beside them** (§6.9), always both.

### The Chrome Skin Token Set
§8.10's era shifts change "UI chrome, palette, typography, and material language," which if taken
literally means four full UI redesigns and a maintenance nightmare.

**How it looks:** Era changes exactly **four tokens** and nothing else: `typeface` (the Chrome face),
`corner-radius` (0px CRT → 2px → 6px glossy → 4px flat → 12px modern), `surface` (beige plastic →
brushed metal → glass gradient → flat → translucent dark), `accent` (the era's key hue). **Layout,
hierarchy, iconography and spacing never change.** Result: the eras look genuinely different and the
player never has to relearn where anything is.

### The Foreignness Budget
Three separate entries ask for art that deliberately breaks the house style — §1.3's colo tenant gear
"in a deliberately foreign art style," §1.2's Acquisition level "a completely different art skin,"
§5.4's vendor house styles. Unbounded, this destroys readability.

**How it looks:** Foreign art may differ only in **decal, bezel geometry, cable colour and label
font** — never in silhouette family, never in the status-LED language, never in the Load Donut, never
in the hue ledger. A tenant's rack can be lurid and stickered and still show a standard amber fault
LED. **The alien-ness is cosmetic and the telemetry is universal**, which is also true in real
datacenters and is what makes the colo fantasy work.

### The Two-Register Fold
§8.4's Room↔Board transition is "an animated fold rather than a cut" and is never specified. It's one
of the game's signature moves.

**How it looks:** 0.6 seconds. The camera lifts to orthographic while objects **flatten toward their
faceplate plane** and cables straighten from catenary to orthogonal routing in the same motion.
Lighting flattens out; materials lose specularity; the floor becomes a grid. Reversing restores in the
same time. **Objects keep their screen position throughout** so you never lose what you were looking at
— that continuity is the entire trick.

### The Camera Grammar
A named shot vocabulary so cinematic moments are consistent and cheap.

**How it looks:** **Establish** (the level's authored Establishing Frame). **Drop** (world → building →
aisle → rack, used by the Cold Open). **Snap** (a 0.25s move to an incident, triggered by clicking a
ticker line or an alert). **Orbit** (slow rotation around a selected object, for inspection and photo
mode). **Fold** (Room↔Board). **Rail** (the tour cam). **Pullback** (endings and tier-ups). **Hold**
(the quiet moment — the camera stops moving entirely for 2s after an incident resolves, which is the
thing §8.7's "quiet moment" actually needs). Seven shots, reused everywhere.

### The Bezel HUD
Screen real estate is fully committed in §8.8 (top bar, left palette, right inspector, bottom ticker +
alert stack + pulse strip) before the overlay legend, the three clocks, the hands dock, the hum bar and
the off-board register are added.

**How it looks:** Promote the viewport's **frame** to an information surface. A 10px inner border
carries: off-board threat state (§2), the active overlay's tint, the alert triad's worst-severity
colour as a thin top rule, and the pressure gradient's lip. It costs almost no area, it is never
occluded, and it is the only place that can carry "something is wrong that is not on this board."
**Interacts with:** §8.8's HUD skeleton, §2's Off-Board Register.

### The Screen Budget
A stated allocation, so systems can't quietly annex space.

**How it looks:** At 1920×1080, the world gets **≥66% of the screen at all times**. Top bar 48px. Left
palette 220px, collapsible to 56px icons. Right inspector 320px, closed by default. Bottom furniture
120px total, comprising the ticker (one line), the alert stack (max 4 visible, then `+N`), the pulse
strip and the hum bar. Everything else is a drawer, an overlay, a hover card, or the bezel. **At Steam
Deck resolution the palette auto-collapses and the inspector becomes a full-screen overlay**; at
ultrawide, the extra width goes to the world, never to more panels.

### The Zero-State Art
The game is full of empties — empty racks, empty lanes, empty desks, unsold floor, stranded capacity —
and "nothing" is usually the worst-looking thing in a strategy game.

**How it looks:** Empty is authored, not absent. Empty U slots show rails, threaded holes and a
cable-management arm stub, lit from above so they read as **invitation**. Unsold floor is clean
sealed concrete with row markings already painted and a faint grid — **the space is ready and you
haven't sold it**, which is exactly the emotional content of §6.6's occupancy. An empty desk has a
chair pushed in and a dark monitor. **The empty lane** (§8.7) gets the strongest treatment: full
lighting, perfect health, the hum at idle, and a completely still inbound edge with *one* piece of
litter blowing across it.

### The Loud Frame Test
The necessary companion to §8.9's Quiet Frame Test.

**How it works:** A screenshot at peak crisis must still let a stranger answer three questions in five
seconds: *what is broken*, *what is the worst thing*, *what can I do right now*. If it can't, the
crisis rendering is too dense. **Test both ends of the range or you only protect one.**

### The Chroma Meter (in-engine enforcement)
§8.2 says the Readability Budget "should be enforced in the engine, not by taste" and gives no
mechanism.

**How it looks:** A developer overlay showing live counts: distinct alert hues on screen, active FX
types, animated elements, labels drawn, and the percentage of screen pixels above a saturation
threshold. It goes red when the budget is exceeded, and **it ships as a player-visible accessibility
readout too**, because the players who need it will want to know.

### Per-Line Default Altitude
§8.10 notes that DNS and CDN are "almost entirely a world-map level," which conflicts with §8.3's
implication that all four altitudes matter everywhere.

**How it looks:** Each hosting line declares a **home altitude** and a **detail altitude**. Shared
hosting: home Z2, detail Z1. Colo: home Z3, detail Z2. CDN/DNS/anycast: home Z4, detail Z3. Tape vault:
home Z2, detail Z1. Edge/MEC: home Z4, detail Z1 (there is no Z2 or Z3 — the sites are too small, and
that jarring jump *is* the line's feel). Camera defaults and LOD budgets follow the declaration.
**One field in the Ruleset Card, and every line's camera behaves correctly.**

### The Handmade Layer
A material rule that carries enormous tone for free.

**How it looks:** Anything authored by a *person in the fiction* is rendered in a distinct handmade
material set — marker, label-maker tape, ballpoint, sticky note, printed-and-taped paper, Dymo — and
**the game itself never generates anything in those materials.** Runbooks, cable labels, the
whiteboard, the "DO NOT REMOVE — ASK DAVE" note, the Days Since Last Outage board, the cursed-machine
sticky note, your own asset tags. The result: **you can tell at a glance what a human decided and what
the system decided**, which is the emotional spine of §9.3's humour and §9.2's ghost-of-the-previous-admin.

### The Scar Map
§1.6's Scars are a stat. Make them a place.

**How it looks:** Every major incident leaves one small permanent physical trace at its location: a
scorch mark on a PDU, a patched floor tile where the leak was, a replacement panel in a slightly
different beige, a length of cable in the wrong colour, a fire-suppression nozzle with its seal
replaced. They never clean up automatically. **By Tier 5 your facility is a readable history of
everything that went wrong**, and the Tour Camera (§8.3) becomes a walk through your own record.

### The Player Company Mark Generator
§1.8's "The Logo Evolves" is a great idea that requires an actual mark system.

**How it looks:** A small generator at company creation: choose a **glyph** (from ~24 simple marks — a
node, a rack, a wave, an arrow, a shield, an animal), a **wordmark** (from the type system), and a
**colour** (constrained to a palette that will not collide with the hue ledger — muted, desaturated,
brand-ish). The mark then renders at five fidelity levels tied to Reputation: Comic-Sans-on-paper →
clip-art print → a real logotype → embossed on rack doors → etched aluminium and lit. It appears on
the truck, the badge lanyards, the placard wall, the screenshot watermark, the loading screen, and the
score stamp. **Player identity is free art for every one of those surfaces.**

### Photo Mode
§9.1's Photo Contest and §9.7's screensaver both need it and neither specifies it.

**How it looks:** Free camera with focal-length and depth-of-field controls, time-of-day slider, HUD
toggle, an overlay toggle (so you can shoot a thermal-view photo), a **grain/era filter** matching the
current era's chrome, and a title-block frame option that stamps the shot like a spec sheet with your
company mark, tier, uptime and date. **Every artifact the game asks for — the Signature Frame, the
Night Shot, the postcard, the contest entry — comes out of one tool.**

### The Incident Poster
An automatic artifact from an existing system.

**How it looks:** When a major incident closes, the game composes a poster: the Post-Mortem Polaroid
(§5.4) as the hero image, the Uptime Ribbon segment beneath it, the incident's start/end/duration set
in the Doc face, the root-cause line, and the cost. Printed-looking, slightly imperfect. It goes on the
scrapbook wall and is a one-click share. **It is the Timeline Ribbon, the polaroid and the postmortem
already built, arranged once.**

### Key Art Direction
Worth stating so marketing doesn't invent something the game can't deliver.

**How it looks:** The hero image is **not** an explosion. It is a low, warm shot down a cold aisle at
3am: one person in silhouette with a flashlight, one rack lit amber among a hundred green, cable
plumes overhead, and a very small figure. The game's title set in the Signage face. **The promise of
the image is competence under pressure, at night, alone**, which is the game.

---

## 9. Anything else

### The Museum Floorplan
§9.4's Company Museum is called "the single best reason to keep a long save" and has no layout.

**How it looks:** A wing of the facility laid out as a real small museum: a **timeline corridor** (one
plinth per era you lived through, with that era's hardware and UI chrome preserved); the **Trophy Rack**
(your first server, mounted, with a plaque); the **Placard Wall** (business lines); the **Scrapbook
Room** (post-mortem polaroids and incident posters); the **Wall of Ghosts** (churned customers,
deliberately in a dim side room); and the **Skin Preview Room** (§8.10) as a set of lit dioramas.
Walkable with the Tour camera. **Everything in it is an artifact the game already generates.**

### The Annual Report, Designed
§9.4's report is "highly shareable" and undesigned.

**How it looks:** A 6-page generated document with a real annual-report layout: a cover with the
Establishing Frame of your facility and your mark; a letter from the CEO (you) set in the Doc face
with your company's actual events written into it; a financial spread on ledger stock; an operations
spread with the Uptime Ribbon and the Nines; a customer spread with portrait cards for your best and
worst; and a closing page with one photograph. **Exports as a single tall image.**

### The Replay Overlay
§9.7's spectator/replay mode needs a viewing language distinct from play.

**How it looks:** A **letterboxed** frame (so you always know it's a replay), the Timeline Ribbon
promoted to a full-width scrubber with incident markers, an overlay switcher that persists while
scrubbing, a speed control that goes to 16×, and **causality mode**: hold a key and every event on the
timeline draws a thin Intent-layer line to the decision that caused it. **The Correlated-Failure white
line (§2), applied to an entire run.**

### The Stream Overlay
Cheap, and this game will be streamed.

**How it looks:** A toggle that reserves a clean corner, promotes the three-clock cluster and the money
column to double size, hides the build palette when idle, and draws every alert twice as large. Plus a
**spectator ticker** that narrates in plain language what the player just did. **Readability for someone
watching at 720p on a phone is a different design problem and it takes ten minutes to solve.**

### The Achievements as Asset Tags
§9.3's achievement list is one of the best bits of writing in the document. Give it an object.

**How it looks:** Each achievement is a **printed asset tag** — a small metallic sticker with a barcode,
a number and the achievement name in the Signage face — stuck to a board. Locked ones are blank tags.
Rare ones are a different colour stock. `Days Since Last Outage: 1` is deliberately a cheap paper one.
**They look like something you'd actually find in a datacenter, which is the whole joke.**

### The Intern's Log
§9.3 calls it "the best place to put the game's voice."

**How it looks:** A spiral notebook, one spread per level, hand-lettered in the Marker face, with
doodles: a sketch of the rack that caught fire, an arrow pointing at a cable, a drawing of the cat.
Entries get visibly more competent and more world-weary as the campaign proceeds, and the handwriting
gets faster. **The notebook fills up and that is the campaign's emotional progress bar.**

### The "Was That Real?" Tag
§9.5's authenticity marker, designed so it can live in the Codex without breaking immersion.

**How it looks:** A small stamp in the corner of a Codex or Field Notes card, in one of three states:
**REAL** (a plain rectangular stamp), **SIMPLIFIED** (the same stamp with a dashed edge), **LIBERTY**
(the stamp at a slight angle with a small asterisk). Never appears in the world, only on documents —
which is the mitigation §9.5 already asks for, made concrete.

### The Diegetic Settings, Per Era
§9.4's diegetic settings menu should change with the era, and the Chrome Skin Token Set makes it free.

**How it looks:** 1996 — a BIOS setup screen with blue background and F-key hints. 2005 — a chunky
tabbed control panel. 2016 — a flat settings drawer. 2025 — a dark telemetry console. **Same options,
same order, same labels**, so nobody ever has to hunt.

### The Skin Kit Editor
§9.4's "modding the skin kit" is the perfect community format and needs a face.

**How it looks:** A five-slot editor mirroring the Five-Asset Kit exactly: **Palette** (two swatches +
a material picker), **Hero Silhouette** (import or choose from a parts library), **Visitor Costume**
(the five costume slots from §3), **Signature Meter** (choose a gauge face from the Instrument Design
Language and bind it to a resource), **Ambient FX + Sound**. Plus the Ruleset Card as a simple form.
**A mod is five assets and one form, previewed live in the Skin Preview Room.**

### The Cursor
Unspecified and used constantly.

**How it looks:** Not an arrow. A small **crosshair-and-caret** in white (the player-intent hue), which
changes tool-state by *adding* a glyph rather than changing shape: a cable end when wiring, a wrench
when assigning a hand, a magnifier when inspecting, a flashlight cone during a black start (§1.5
already uses this — make it the system). **One base, many badges**, so the cursor never gets lost.

### Readout Mode
An accessibility option that should also be a default for many players.

**How it looks:** Every diegetic gauge, meter, dial, light and posture in the game gains a small
numeric or text readout beside it. The amp clamp gets `23.4A / 24A`. The fatigue posture gets `68%`.
The mood halo gets a word. The hum bar gets a dB figure. **It makes the game playable for anyone who
can't read analogue at a glance and it makes it better for min-maxers** — which is the usual outcome
when accessibility is treated as design rather than compliance.

### The Aquarium
§9.7's screensaver/idle view, treated as a feature.

**How it looks:** A slow randomized Orbit/Drop camera cycle through your own built facility with the
HUD hidden, the hum playing, LEDs blinking on the global heartbeat, staff sprites doing idles, the cat
walking through occasionally, and the Days Since Last Outage board visible. Optional real-clock mode
so the lighting matches your actual time of day. **Half this audience will leave it running**, and it
costs nothing beyond the camera grammar and the Zero-State art already specified.

### The Rack Elevation Poster Export
A small thing people will love.

**How it looks:** Export your final topology as a print-ready rack elevation — front and rear views,
a title block with your company mark and date, a legend, dimension lines, and a bill of materials
down the side, all in the Ink Blue blueprint register. **§8.8's diagram export, upgraded from a
screenshot into an artifact**, and a genuine word-of-mouth feature for this audience.

---
---

# PART B — IMPROVEMENTS AND EXPANSIONS

*Each entry names the existing `hosting_game.md` heading it applies to.*

---

## 1. Levels, scenarios, and progression

### → "Tier 0.5 — The Noisy Neighbor (the shared resource)"
The apartment-cutaway is the best tier image in §1.1 and it under-sells its own mechanic. **Expand:**
the 200 windows should be *individually lit at different brightnesses by their actual resource use*,
so the runaway-cron neighbour is visible as one window burning white before any alert fires. The
"cracks along the shared wall" should originate at that window and propagate along the floor slab, not
randomly. And the greyed-out build palette should show the padlocked items **at full colour behind
frosted glass**, not desaturated — you must want them.

### → "Tier 1 — One Box / root@localhost"
"The OOM killer walks on screen and executes your largest service" is a striking image with no spec.
**Propose:** the OOM killer is the game's only *anthropomorphic* system entity — a flat black
silhouette with no features, drawn in the Annotation layer (so it has no perspective and no lighting,
which makes it deeply wrong), which walks in a straight line across the board ignoring geometry,
touches the largest service, and that service's process glyph simply stops existing. No particle, no
sound but a single click. **Its wrongness is the point and it must never be used for anything else.**

### → "Tier 3 — The Stack / The Cage / prod"
This tier has *no* visual identity in §1.8's postcard set while every other tier does, and it's the
tier the game spends the most time in. **Propose:** Tier 3's identity is **flow legibility** — the
first tier where the Board register (§8.4) is as important as the Room. Its postcard is the
orthographic diagram with traffic ribbons, shot slightly from above, with the rack room visible and
out of focus behind it. Its signature image is **the first time a ribbon splits at a load balancer**.

### → "Tier 4 — Landlord / The Floor / Suite 200"
The signature moment ("a tenant gets DDoSed and the collateral takes out the row") needs a frame.
**Propose:** the row's tenant tint bands go out one by one along the row, left to right, in physical
order, while the designator (Part A §2) stays locked on the one tenant who was actually targeted.
**The innocent racks go dark and the targeted one stays lit**, which is the entire injustice of the
mechanic in one image.

### → "Tier 6 — Hyperscale / Region Build"
Currently one sentence of visuals for the endgame. See Part A's **Tier-6 Constellation Pullback**.
Additionally: Tier 6 should be the only place the game uses **true darkness** as its dominant value —
everything below Tier 6 is lit. The endgame looks like night from orbit.

### → "The Tenant / The Customer" (perspective level)
"who put the UPS there? …oh" is the payoff and needs staging. **Propose:** when you find the offending
object, the camera performs a slow Orbit and the object's **asset tag is legible**, and it carries
*your own company's* asset-tag format from the earlier level. Recognition through typography.

### → "Red Team Friday"
Has no visual treatment at all. **Propose:** the entire level renders in the **attacker's tooling**
aesthetic — your target is a scan result, a list of open ports with version strings, a network graph
built from inference, with big unknown regions. Successful reconnaissance *fills in the picture*, which
is the exact inverse of the fog-of-instrumentation you're used to. When you return to normal levels,
the knowledge is expressed as your own defenses showing what an attacker would see.

### → "The NOC Shift / On-Call Night"
No visuals. **Propose:** the Perspective Frame Device (Part A §1) — four monitor bezels — plus the
strongest use of the 4am Grade (Part A §2) in the game: the world is nearly monochrome and the six
alerts are the only saturated objects on screen. The room behind the monitors is visible in reflection
and it is dark. **The false-positive alert should be the *brightest* one**, which is the joke and the
lesson.

### → "The New Hire"
"Half the objects are fogged with ???" deserves better than a fog shader. **Propose:** unknown objects
render as **crated/shrink-wrapped forms** — the right silhouette family, wrapped in opaque plastic with
a shipping label you can't read. Investigating cuts the wrap open in one animation. The load-bearing
one nobody knows about should be the *least* interesting-looking wrap in the room.

### → "The Auditor / Audit Week"
The moving-spotlight mechanic is excellent. **Expand:** the auditor's pathline should be drawn on the
floor **ahead of him** as a dashed route with timestamps, so the player can plan; the compliance glow
should be a **hard-edged circle**, not a radius falloff, so its boundary is unambiguous; and items he
has already passed should get a small green chalk tick on the floor that persists, turning the level
into a visible sweep record.

### → "The Datacenter Tech"
No visuals. **Propose:** helmet-cam frame, a work-order PDA in the corner, and — critically — **the
camera is at 1.7m and cannot leave the floor.** No altitudes. The whole level is Z1. This makes it the
only level in the game with no zoom, which is exactly how the job feels, and it makes the Beeping
Server minigame (§9.2) natively playable here with the audio captions from Part A §8.

### → "The Migration Crew / The Migration"
Already the best-specified perspective level. **Two additions:** the patch-panel crossfade lever should
have **physical detents at 10% increments** with a click, because a migration is not a smooth dial; and
the old stack's desaturation should lag the traffic move by ~5 seconds, so there is always a visible
moment where **both stacks are real**, which is the dangerous part.

### → "The Abuse Desk"
No visuals. **Propose:** the Paper Family (Part A §2) at full strength — the level is entirely a desk,
a queue of envelopes with different letterheads, a stamp pad with `SUSPEND` / `WARN` / `DISMISS`, and
a **small monitor showing the customer's site** so you can see what you're about to take down. The
bad-faith competitor complaint should be visually identical to the real ones except for one detail in
the letterhead. **Reading paper closely is the level.**

### → "The Support Queue Level"
"You see only tickets, not the board" is a strong constraint that needs a strong image. **Propose:**
the board's area is not blank — it is a **frosted pane** with vague shapes moving behind it, so you can
almost see. At the end, the pane clears and your inferred model is overlaid on the real one in the
Intent layer (dashed white) so you can compare your guess to the truth. **Scoring becomes a picture.**

### → "The Acquisition (fogged inheritance)"
Already good. **Expand:** add the **Acquisition Normalization Bar** (Part A §1) as the objective
readout, and specify the inherited dialect precisely — theirs uses a different label font, a different
cable colour convention, a different rack numbering scheme *that runs the opposite direction*, and
their asset tags have a different prefix. The reverse rack numbering is the detail that will make
operators laugh.

### → "The Mass Host / Cabinet 14"
"The Density Gauge, drawn as how tightly the windows are packed" is clever but hard to read precisely.
**Propose:** keep it as the ambient read, and add the Instrument Design Language (Part A §6) face: a
**density comb** — a row of vertical bars whose spacing closes as oversell rises, with a red hatched
zone at the end. Ambient read plus precise read, same metaphor.

### → "Four Hundred Identical Sites / Managed Everything"
"Plugin Jenga" is a great meter and a physics simulation nobody needs. **Propose:** render it as a
**static stack with visible lean angle** rather than real physics — lean is computed from version
mismatch count. A stack past 12° gets a wobble animation. The topple is a canned 1-second animation.
**Cheap, controllable, and it reads better than physics would.**

### → "Root Is Theirs / The Stable"
"Fewer objects, more detail per object — this tier gets the loveliest hardware art" is a good instinct
that needs a rule. **Propose:** dedicated-server levels run at **Z1 as home altitude** (Part A §8's
per-line default), which is what actually delivers "more detail per object." Also: the customer name on
label tape should be **hand-written in the Handmade Layer**, which quietly says these machines were
set up by a person for a person.

### → "Amps and Aisles / Cage 7"
The strongest hosting-type visual in the document. **Two upgrades:** (1) tenant gear behind mesh should
be lit only by **its own LEDs plus spill from the aisle**, never by your room lighting — the darkness
is the epistemic position, not a filter. (2) The Cabinet Power Ledger should be a **clamp meter you
physically attach** — a click-to-inspect action with a 0.5s animation — rather than a permanent
readout, because metering a tenant is an act, not a given. That single interaction teaches the whole
colo relationship.

### → "Prime Time / Tick Rate"
"Hot magenta-and-lime, deliberately loud, RGB everything" collides head-on with the hue ledger —
magenta is reserved for hostile traffic, and a level where the *décor* is magenta makes threats
invisible. **Propose:** shift the Arena's palette to **hot pink-violet and lime with the magenta band
excluded**, and put the saturation in the *lighting* rather than the surfaces so the Flow layer still
wins. Also: the tick-rate pendulum should sit **on the node in world space and also in the HUD's
instrument cluster**, since it's the level's signature meter and you'll be watching it constantly.

### → "Trunk Group / The Switchboard"
"MOS score as the visible clarity/graininess of the cord's glow" is lovely but is a single continuous
channel with no threshold. **Propose:** three named cord states with hard boundaries — **Clear**
(smooth, bright), **Grainy** (visible noise in the glow, MOS 3.5–4.0), **Fraying** (the braid visibly
separates, below 3.5). Hard boundaries make it actionable; a smooth gradient just makes it pretty.

### → "Postmaster / Deliverability"
"The Reputation Postmark, a stamp that gets progressively smudged" is the best type-specific meter in
the document. **Expand:** the postmark should carry **which provider** — four small postmarks, one per
major mailbox provider, each independently smudging, because the real mechanic is that you can be fine
at one and blocked at another. The "silent deprioritization" threat then renders as a postmark that is
perfectly crisp and *stamped in slightly the wrong place*.

### → "Authoritative / NXDOMAIN"
"p99 as a flickering candle" is beautiful and needs one more beat. **Propose:** the candle is in a
**glass chimney** — steady flame at good p99, guttering at bad. Water-torture attacks are drawn as a
draught you can see disturbing it before the number moves. And the level's catastrophe (every other
business line loses its visitors) should be rendered by **all other district lights going out
simultaneously while your DNS racks stay perfectly lit** — the most damning image available.

### → "Eleven Nines / Bucket / The Honeycomb"
"Durability as a count of visible replica shadows" is excellent and under-used. **Expand:** make the
shadows *positional* — each replica shadow is offset in the direction of the node holding it, so a
correlated placement (all three replicas in one rack) is visible as **three shadows stacked on top of
each other** instead of fanned. That single rendering choice teaches erasure-coding placement better
than any tutorial.

### → "Restore Point / The Vault"
Strong already. **One addition:** the "last verified restore: 41 days ago" counter should be rendered
as a **paper tag hanging on the vault door**, hand-written, with the date crossed out and rewritten
each time — Handmade Layer. Watching the tag not get rewritten for forty days is more uncomfortable
than a number turning amber.

### → "Rack 4 Is 40 Kilowatts / The Furnace"
The most visually ambitious level and the biggest readability risk in the document: violet-white
plasma, everything glowing, enormous plumes, thick gold cables. Against the hue ledger, **gold cables
read as money** and **everything glowing** breaks the Emissive Allowance. **Propose:** power cabling
becomes **Copper** (Part A §8); the glow is confined to Flow and to the GPU dies themselves (points,
not volumes); and the room's overall brightness comes from *bounce* off white surfaces rather than from
emissive geometry. The furnace should feel hot because of **colour temperature and heat shimmer**, not
because every surface is a light source. This keeps the level spectacular and keeps a magenta triangle
visible inside it.

### → "Hashrate / The Boiler Room"
"Ruins as a game state" is the best single idea in §1.3 and gets one line. **Expand:** spec the ruin —
rigs still racked but dark, a layer of dust that is visibly *thicker on the fans*, extension cords
unplugged and coiled on the floor by someone in a hurry, one rig still running because nobody told it
to stop, and a stack of unpaid invoices on the cage door. **The level ends as an environment, and the
player should be able to walk the camera through it.**

### → "Cold Start / The Mayfly Field"
"The board sparkles with ephemeral life" is charming and a particle-budget disaster at serverless
volumes. **Propose:** apply the crowd-density LOD (§8.6) explicitly here — individual mayflies below
~200/s, a **shimmer field** above it, where cold starts render as visible *dark specks* in the shimmer
rather than as individual chrysalises. **Cold starts as holes in the sparkle** is both cheaper and more
legible.

### → "Anything Goes / The Back Alley"
"Revenue drawn in a different, slightly wrong gold" is a terrific idea that violates one-hue-one-job.
**Propose:** keep the *shape* wrong rather than the hue — bulletproof revenue is gold, but it arrives
as **crumpled notes rather than coins**, it doesn't arc cleanly, and it lands with a duller sound. Same
hue, wrong physics. Reads as wrongness without breaking the ledger.

### → "In Scope / The Clean Room"
The painted compliance line is the best buildable-as-image in the document. **Expand:** the line should
be **physically painted by a staff member over time** when you place it (a 10-second animation of
someone walking with a paint machine), and re-painting it when scope changes should be visibly a
*chore*. Anything crossing it without marking gets a red thread (already specified) — add that the
thread **persists as evidence** until remediated, and appears in the audit's findings list with a photo.

### → "Exchange Colo / The Microsecond Cathedral"
"Beautiful coiled excess fiber on every rack" is the best real-world detail in the document. **Expand:**
the coils should be **visibly identical in diameter across all tenants** — that identicality *is* the
fairness contract, and a tenant with a slightly smaller coil is the level's catastrophe, spottable by
eye before the number tells you. Make the coil diameter the meter.

### → "Busy Signal / Ring 0 / The Modem Wall"
Correctly identified as "the clearest capacity visual in the game." **Propose making the reuse explicit
as a design rule:** the **Busy Wall grammar** — a finite row of discrete slots, each lit when occupied,
with arrivals visibly bouncing off when full — should be the canonical rendering for *every* hard
concurrency limit in the game: SYN connection table, VoIP channels, game-server slots, worker pools,
GPU cards, colo cabinets, tape drives, modem lines. **One grammar, eight systems, learned once in the
tutorial level.** This is a bigger idea than the level it's currently trapped in.

### → "Pivot / The Pivot Level"
"Two palettes on screen, one fading and one growing" is right; add the mechanism. **Propose:** the
Re-Skin Wipe (Part A §1) — the change advances spatially row by row rather than fading globally, so at
any moment the facility is visibly half one business and half another, with a **visible boundary you
can stand on**. That boundary is where the level's conflicts happen.

### → "Launch Day / Hug of Death / The Slashdotting"
"Traffic ribbons swell until they're wider than the links carrying them, and overflow spills over the
edge" is the single best failure image in the document. **Expand:** the spill should **pool on the floor
beneath the cable and evaporate as grey**, so the amount you're losing has a visible volume. And in the
Slashdot variant, specify that the teleport happens **between two frames with no telegraph** — the one
place in the game where §2's telegraph law is deliberately broken, which is why it's memorable.

### → "Post-Breach / The Breach"
"The level literally colours itself back in as you progress" is outstanding. **One addition:** the
forensic overlay's scrub bar should show **confidence** as well as time — the portion of the timeline
you have logs for is solid, the portion you don't is hatched, and the moment of entry is a marker you
place yourself (and can place *wrong*). **The hatched region is the cost of not buying log retention**,
rendered in the exact place where it hurts.

### → "Power Event / Black Start"
The flashlight-cone cursor is one of the document's best ideas. **Expand:** the cone should reveal the
**Truth side** of objects (Part A §4) — at black start you are looking at cabling and power, not
faceplates. And the restoration should light racks in dependency order with the Recovery Ladder
(Part A §7) drawn faintly in the Intent layer, so the puzzle has a visible answer key you must still
execute in order.

### → "Cooling Failure / Heatwave"
"Thermal overlay forced on for the whole level" is correct and creates a problem: the overlay's
exclusive palette (iron) will fight every other alert colour for the whole level. **Propose:** when an
overlay is forced on, the alert triad drops to **two** hues and the third aggregates. State this as a
general rule for forced-overlay levels.

### → "The Influencer / The Demo"
The split-screen "presentation view" is a fantastic mechanic. **Expand:** the presentation view should
use **a different chart style** — smoothed, rounded, generously scaled, with the y-axis not starting at
zero — while the real view is angular and honest. The visual difference between the two charts *is* the
ethical content, and it's a lesson worth teaching.

### → "The Cheap Bid"
"Budget bar rendered as a physically shrinking ruler" is good. **Add:** the hardware's mismatched
beiges should be drawn from the **Vendor House Styles** (Part A §4) so the scruffiness is systematic
rather than noise, and each unit should carry **another company's asset tag** that you can read at Z1.
Someone else's asset tag is the cheapest possible storytelling.

### → "Hardware Refresh Weekend"
"The tension is literally watching a coloured rectangle close" — make it better. **Propose:** the window
band's **trailing edge should be a hard line that sweeps across the timeline**, and any operation still
in flight when it crosses gets visibly *clipped* — its progress arc turns red mid-sweep. You watch the
edge approach an unfinished job for ten seconds. That is real dread from one rectangle.

### → "The Density Ramp"
"The art must be authored at four LODs from day one" is correct and understated. **Expand:** state the
LOD targets concretely — LOD0 full detail (Z1), LOD1 faceplate + lights only (Z2), LOD2 silhouette +
one state colour + load donut (Z3), LOD3 the object does not exist and is represented by its parent's
aggregate glyph (Z4). **The LOD3 rule — objects stop existing rather than becoming tiny — is the
mechanism behind "aggregate, don't shrink" (§8.9)** and it needs to be said as a production
requirement, not a rendering preference.

### → "The Cable Entropy Curve"
Cable bundling as a purchasable visual relief is one of the best upgrade payoffs proposed anywhere.
**Expand:** the "×12" badge should sit **at the bundle's midpoint on the sheath**, and hovering the
bundle should fan it back out temporarily so you can still trace a single link. **Buying tidiness must
never cost you traceability**, or players will refuse the upgrade.

### → "Sky / Time-of-day Bands"
Good, with one conflict: §8.10's per-line palettes and §8.10's era grading also drive the scene's
colour. Three systems are fighting for the same grade. **Propose a stacking order:** era sets the
**base grade**; line sets the **accent and material**; time-of-day sets **light direction, intensity and
colour temperature only**. Time of day never changes hue assignments. Stated once, it prevents a mess.

### → "The Logo Evolves (reputation as typography)"
Needs the generator to exist — see Part A §8's **Player Company Mark Generator**. Also: the five
fidelity levels should be tied to **reputation bands, not tiers**, so a Tier-4 company with a wrecked
reputation still has the clip-art logo on its rack doors. That's funnier and truer.

---

## 2. Threats

### → "The threat visual contract" (§8.5)
Strong, and missing the most important clause. **Add a fifth channel: scale** — see Part A's **Threat
Scale Law** (size ∝ cost). Also make the contract testable: a threat design is not approved until it
passes the **Silhouette Sheet** at 24px against every other threat in its band.

### → "Motion as behaviour" (§8.5)
The best rule in §8.5. **Expand with a motion spec table** so it's authorable: volumetric = **advance**
(constant velocity, wide front, no deviation); slow-drip = **hold** (near-zero velocity, periodic
twitch); scanner = **sweep** (constant angular rate, regular intervals); swarm = **boil** (local random
walk within a drifting centroid); mimic = **match** (copies the visitor motion curve exactly, with a
cadence offset of zero — see the Cadence Tell); insider = **walk** (the only ground-based gait);
ransomware = **crystallize** (branching growth, no translation); siege = **no motion at all** (it acts
from off-board — see the Off-Board Register). **Seven motion primitives cover the entire bestiary.**

### → "The unidentified state" (§8.5) and "Purple means 'we don't know yet'" (§8.2)
These two are the strongest colour idea in the document and are currently undermined by violet also
being used for trust/auth ports (§7.2) and the affiliate cohort (§3.7). Fix per the **Hue Ledger**
(Part A §8). **Additionally:** the identification flash needs a spec — a 0.15s scale-up to 115% with a
hue snap and a single tick, and **the flash intensity should scale with how wrong you were** (a mimic
resolving to a threat flashes harder than a violet dot resolving to a page load). You want the
surprising resolutions to be the loud ones.

### → "Attack landing" (§8.5)
Three outcomes specified (blocked / damaged / breach); there is a fourth. **Add: the Miss** — a threat
that reaches its target and finds nothing (the scanner that finds no open port, the SQLi with no DB
behind it). It should play a small deflating *nothing* — the unit pauses, has no effect, and leaves.
**The absence of feedback is the feedback**, and it is the only way the player learns that reducing
surface works.

### → "Persistence and infestation" (§8.5)
"A dark vein pattern that spreads along trust links" is excellent. **Expand:** veins should follow the
**trust graph** specifically (§7.2's four topologies), not the data graph — which makes the trust
overlay suddenly the most valuable lens in the game and justifies its existence. And a vein should be
visible at Z3 as a thin dark line on the link, so infestation can't hide behind zoom.

### → "Telegraphs" (§8.5)
"The size of the telegraph is proportional to the threat" needs steps or it'll be inconsistent.
**Propose five telegraph grades:** (1) none — ambient weather, arrives unannounced; (2) a pip on the
radar, 3s; (3) a horizon glow + the hum dropping, 8s; (4) a camera pan to the edge + the composition
bar filling, 15s; (5) a full Wave Telegraph with a named antagonist portrait on the gantry, 30s+.
**Assign every threat in §2 a grade** — that assignment is the difficulty curve.

### → "Scanner Swarm / Masscan Gnats"
"A grey drizzle of dots" is right but grey is the hue ledger's *inert* colour, which makes the game's
most common threat read as dead infrastructure. **Propose:** scanners are **violet** — they are
literally unclassified, low-value, and constant, and rendering the ambient noise floor in the
unidentified hue is thematically perfect: **the background radiation of the internet is stuff you
haven't bothered to identify.** Their marker flares when one finds something should be the only
saturated thing they ever do.

### → "Slowloris / RUDY"
"The scariest visual in the game precisely because it's quiet" is a strong claim the entry doesn't
fully deliver. **Expand:** the threads holding the connection should be drawn **taut and unmoving**
while every other line on the board pulses — in a world where everything breathes on the global
heartbeat (§8.9), **stillness is the alarm**. And the bandwidth graph beside it should be visibly,
cheerfully green, in the same frame. The contradiction is the image.

### → "Layer-7 GET Flood on the Expensive Endpoint"
Two competing visuals are proposed (heavy sagging blobs vs. a focused beam). **Resolve:** keep the
**sag** — it's the more novel idea, it reuses FX_SagStrain, and it makes the *link* the victim, which
is mechanically accurate. Drop the beam. Add that the expensive endpoint itself should be visibly
marked on the board once discovered — a small cost tag on that path segment — so "the one endpoint that
hurts" becomes a place, not a statistic.

### → "Packet Swarm (generic volumetric)"
"They pile up in front of it, burying the machine's faceplate until its LEDs can't be seen" is the best
queue visualization in the document. **Promote it:** this should be the **universal rendering of a full
queue**, not a DDoS-specific effect — legitimate traffic piling up during a launch spike buries the
faceplate in cyan the same way. One mechanic, one image, two valences.

### → "SQL Injection Serpent"
"Rows stream out as scrolling glyph ribbons toward the map edge" is excellent. **Add the counter-image:**
with least-privilege configured, the serpent reaches the DB, the drawers open, and **the ribbons that
emerge are blank** — it stole nothing readable. Rendering a *successful defense that still let the
attack land* is rare and valuable, and it's exactly what read-only DB users actually do.

### → "Ransomware on the File Server / Ransomware Bloom"
"The direction of the heal shows you exactly how much of your topology the backup actually covers" is
the single cleverest visual idea in §2. **Protect it:** specify that the heal wave must be **slow enough
to watch** (2s per hop minimum, independent of sim speed) and that **it stops visibly at the edge of
coverage**, leaving frost on everything the backup didn't reach. The stopping point is the lesson.

### → "Cryptominer Squatter / Infestation"
"Its tell is thermal: its host is hotter than its neighbours" is a beautiful find-the-odd-one-out.
**Expand:** make the tell available in *three* overlays with increasing precision — thermal (a warm
anomaly), power (a draw anomaly), capacity (a utilization anomaly with no traffic) — so the player who
owns more instrumentation finds it faster. **A threat whose detectability scales with your monitoring
spend is the perfect §7.6 teaching object.**

### → "Certificate Expiry"
The wax-seal ring draining like a pie chart is great. **Expand:** at a facility with many certs, the
seals should aggregate into a **ring of seals** on the cert dashboard sorted by remaining life, so the
next expiry is always the leftmost. And the auto-renew's "self-refilling seal" should visibly refill
**30 days early**, which teaches the actual renewal window.

### → "Domain Expiry"
"Your buildings are fine and nobody can find them" — the best single sentence in §2.9. **Expand the
image:** the milling visitors at the entrance should slowly **thin out and stop arriving** over about
20 seconds rather than persisting, because that's what actually happens, and the empty entrance with a
blank sign is more devastating than a crowd.

### → "Bad Deploy"
The version flag on a flagpole is instantly readable. **Add:** during a canary, **two flags fly on the
same pole**, with the new one smaller and lower. Rolling back lowers it. Promoting raises it and lowers
the old. **The entire deploy strategy is legible as flag positions from across the room.**

### → "Config Drift"
"Machines slowly acquire tiny differences — a different faceplate sticker, a different LED pattern" is
lovely and nearly invisible without help. **Expand:** the fleet-diff overlay should render the *modal*
configuration as normal and every deviation with a **yellow dashed outline plus a one-word delta label**
(`kernel`, `sysctl`, `tls`, `hand-fixed`). And a machine that was hand-fixed during an incident should
carry a small Handmade Layer sticky note — **the physical trace of the fix that nobody re-templated.**

### → "The Ticket Avalanche"
"Paper slips rain in faster than staff can pull them and the tray overflows onto the floor" is perfect
and should be the anchor for the whole Paper Family (Part A §2). **Add:** slips on the floor are
**stepped on by passing staff**, which is a tiny detail that will make support people wince.

### → "Staff Burnout"
The fatigue ring is proposed; posture is proposed elsewhere. **Resolve per the Ring Taxonomy:** fatigue
is a **Halo**, not a Ring (rings mean time running out), and posture carries the primary read. See
Part A §4's Fatigue Posture Ladder.

### → "The Correlated Failure (meta-threat)"
Called "the game's signature learning moment" with no image. See Part A §2's **Correlated Failure
White Line**. This is the highest-value visual gap in §2 and it should be built first.

### → "The Review Bomb"
The billboard truck that blocks the visitor lane is the best business-threat image in the document.
**Expand:** the truck's billboard should show the **actual generated review text and star count**, and
visitors should perform the Glance Animation (Part A §3) at it before turning around. Removing it
(responding well, waiting it out) should show it **driving away slowly**, which is satisfying and
correct — you don't get to make it vanish.

### → "The Vendor Squeeze"
"A letter that lands with a THUD and a visible shockwave that ripples through every server, each ticking
up a small red cost number" is an outstanding image. **Generalize it:** this should be the **universal
rendering of a per-unit cost change** — licence repricing, power tariff, transit increase, tax nexus.
One FX, six events. Name it `FX_TariffWave`.

### → "The Competitor (the game's rival AI)"
"Their attacks are invisible on the infra board entirely" is a great design and a presentation problem —
an invisible antagonist is easy to forget. **Propose:** the rival storefront at the map edge should be
**always visible at Z3 and Z4**, with its own uptime board, its own price tag, and its own visitor
stream you can watch. When it grows, it grows *visibly*, in the same frame as your own building.
**Their success should be in your peripheral vision constantly.**

### → "Nation-State / APT"
"Its presence is shown by absence — telemetry going suspiciously quiet" is the most sophisticated
visual idea in §2.11. **Make it concrete:** the Hum Bar and the Pulse Strip should show a **flattening**
— variance dropping below the normal noise floor — which is visible as an unnaturally smooth stretch.
Real logs are noisy; too-clean is the tell. **Teaching players to be suspicious of tidiness is a real
security lesson and nobody has ever gamified it.**

### → "The Regulator"
"A slow, unstoppable figure with a clipboard who walks straight through your defenses" is perfect.
**Add:** they should be the only entity in the game that your defenses visibly **acknowledge and stand
down for** — the turnstile opens, the lattice switches off, the gate lifts. Watching your own security
politely let them past is much funnier and more pointed than having them ignore it.

### → "The Crawler Consortium (search engine bots)"
"Drawn in cyan-gold, a colour that is intentionally 'both'" fails the colour-blind requirement and
muddies two reserved hues. **Propose:** keep them cyan (they are legitimate traffic), and make the
ambiguity a **shape** — a circle with a *dashed* outline, where a Scraper Locust is a circle with a
*dotted* outline. Dashed vs dotted survives greyscale, survives 16px, and the "you must look closely"
tension is preserved.

### → "Colo: Tenant Gone Rogue"
"A technician walking over and unplugging someone else's fiber while their logo flashes" is superb.
**Add:** the walk should take **real time** — 20+ seconds across the floor — during which the attack
continues and you can cancel. **The distance is the drama**, and it's the truest thing about acting in
a physical building.

### → "Bulletproof: The Upstream Ultimatum"
Contains the Attribution Direction idea. **Promote it to a law** — see Part A §2.

### → "Dial-up: The Line Hog, The Telco Outage, The Modem Card Death, The War-Dialer"
"Finding one wrong-blinking LED in a wall of 96 is a Where's-Waldo minigame" — great, and it needs an
accessibility path. **Propose:** the wrong LED's blink is **off the global heartbeat**, so it can be
found by rhythm as well as by hue, and Readout Mode (Part A §9) surfaces a port list. Keep the hunt;
give it two solutions.

### → "Threat pathing telegraph" (§2.13)
"Dashed magenta trajectories visible a moment BEFORE they move" is a core fairness mechanic with a
readability risk at scale — hundreds of dashed magenta lines is noise. **Propose:** trajectories are
drawn only for units above a **cost threshold** (see the Threat Scale Law), and swarms show **one
trajectory for the swarm's centroid**, not per unit. Big things telegraph; drizzle doesn't need to.

---

## 3. Visitors, traffic, and clients

### → "The patience ring" (§8.6)
Called "the single most important visitor visual" and it's a thin ring on a small dot — at Z3 with
thousands of units it will be invisible. **Propose a three-stage LOD for the ring:** at Z1/Z2 the full
depleting ring; at Z3 the ring collapses to a **three-state colour+notch** on the unit's hull (full /
half / critical, each with a distinct notch position readable in greyscale); at crowd density the ring
vanishes entirely and patience is carried by the **stream's colour temperature and velocity**. Say this
explicitly or it will be built once and break.

### → "Segment-coded appearance" (§8.6)
"Costume/colour variations by segment" is under-specified for a game with 30+ archetypes across 25
lines. See Part A §3's **Costume Kit** for the slot spec, and Part A §3's **Value as Ornament** to
replace "value as size and glow."

### → "The conversion moment" (§8.6)
Correctly notes it "happens thousands of times, so it must be tiny, crisp, and never annoying" and then
doesn't bound it. **Propose a hard spec:** ≤0.4s, ≤12px of travel before it joins the money stream,
no screen-space scaling, no sound above a threshold rate (the audio LOD from Part A §6 handles this),
and **no confetti, ever**. The reward is the *rhythm*, not the individual event.

### → "The bounce" (§8.6)
The grey marks are great; add the **Bounce Cause Tag** (Part A §3) and the **decay/scorch** lifecycle.
Without a cause tag, the marks tell you where but not why, and "where" is the less useful half.

### → "The false-positive flash" (§8.6)
Called "the most important negative feedback in the document" — and it's a one-frame amber flash, which
at any real traffic volume you will simply never see. **Propose three reinforcements:** (1) the amber
accumulates in the **Mound of the Stopped** (Part A §2) under the offending defense, so the evidence
persists; (2) each defense carries a live **false-positive counter** on its faceplate; (3) the amber
gets its own audio cue that is deliberately slightly unpleasant, and the Hum Bar records it. **A
one-frame flash is not feedback; a growing amber pile is.**

### → "Crowd density as a particle field" (§8.6)
Correct and needs the transition specified or it will pop. **Propose four bands with hysteresis:**
discrete (<150 units), clustered (150–1,000, units merge into clumps of ~8 with one shared ring),
ribbon (1,000–20,000, continuous flow with density/velocity/colour carrying the information), and
aggregate (>20,000, a single labelled arc with a number). Hysteresis of ±15% at each boundary so it
doesn't oscillate.

### → "Session and duration classes" (§8.6)
"The shape of the visitor tells you the shape of the business" is one of the document's best lines.
**Formalize it against §8.2's shape tokens**, which currently disagree: §8.2 assigns circle=visitor,
square=job, diamond=high-value, teardrop=session. §8.6 then uses teardrop for players, square for
backup jobs, and "a dot that sits and glows" for inference. **Propose the final mapping:** shape encodes
**duration class only** — circle = instant, teardrop = session, square = batch/job, **hexagon = resident**
(a colo lease, a training run — currently unassigned and needed). Value moves to ornament; identity
moves to the Prop slot. **One property, one job**, consistent with the rest of the system.

### → "The Whale"
"Large, stately, gold-and-cyan with an entourage" — good, but gold is money and this is a unit.
**Propose:** the whale is cyan like all legitimate traffic, with **gold ornament** (the value ornaments
from Part A §3) and a gold *bounty tag*. The entourage stays. Its catastrophic bounce keeps the slow
desaturation flash, which is one of the few places a screen effect is earned.

### → "Googlebot / The Crawler (friendly bot)"
The "SEO coverage meter as a map-shaped completion grid" is a lovely idea buried in one clause.
**Expand:** the grid should literally be a **site map** — a grid of page tiles that fill in as crawled,
with stale tiles fading. A 503 served to the crawler **un-fills** tiles visibly. Watching your index
erode during an outage is the clearest possible rendering of §3.4's "search ranking decay," which is
otherwise invisible damage-to-the-future.

### → "The Advocate / Word-of-Mouth Visitor" and "Referral Program / Word-of-Mouth Footpaths"
Both propose glowing threads returning with friends; §3.6 adds "a glowing web of referral threads."
**Consolidate and give it decay:** threads persist ~3 minutes and fade; a happy customer refreshes
theirs; an unhappy one's thread **goes grey and stays**, visibly suppressing that spawn point. The web's
overall brightness is your word-of-mouth health, readable at Z3 without a number.

### → "The Migrating Customer / The Migration-In"
"A moving truck carrying their existing stack as visible crates" — excellent, and it deserves the
landing-zone failure state. **Add:** if no landing zone is prepared, the truck **circles the block
visibly** (a loop path at the map edge) for a while before leaving. The loop is your grace period and
you can see it ticking.

### → "The Reviewer"
"A floating star rating that fills or empties in real time" is strong. **Add:** the stars should be
**visible to other visitors** (Glance Animation), so a Reviewer having a bad time in public visibly
depresses nearby conversion in real time. That turns a single unit into a local hazard and makes the
escort tension spatial.

### → "Satisfaction as posture" (§3.7)
"Posture reads at 12px; numbers don't" is exactly right and is the strongest line in §3.7. **Extend it
to staff** (Part A §4's posture ladder) so the same visual grammar covers both populations — customers
and staff both slouch, and a room where everyone is slouching needs no HUD at all.

### → "Customers sit down in your building" (§3.7)
"Your office visibly fills up as MRR grows" is the best growth visualization proposed. **Add the
inverse and the failure state:** churning customers **stand up and leave** on the Churn Walk, and a
mass-churn cascade renders as a room emptying. Also specify the seat budget: one visible desk per
$X MRR, with whales at 4 desks, and beyond ~60 desks the room switches to a **mezzanine of floors**
rather than an infinite open plan.

### → "The Churn Walk (presentation)"
"They stop at the door to spray-paint a 1-star on your window, which other passing visitors then see"
is outstanding. **Add:** the paint should be **removable at a cost** (a staff hand + time, i.e. the
reputation-repair action), and multiple 1-stars should accumulate on the same window, progressively
obscuring it — at which point arriving visitors can't see in and bounce at the Doorstep. **A reputation
mechanic that becomes a literal occlusion is unusually good design.**

### → "Cohorts as colour" (§3.7)
Four hues assigned that all collide with the hue ledger. **Replace with the Cohort Pattern system**
(Part A §3): solid / hatch / dotted / cross-hatch on the livery band. Keep the *idea* — "you can see
the colour drain out of your office when the affiliate cohort churns" — but make it pattern draining,
not hue.

### → "The Grudge Meter"
Mood halo plus a floating cancel bubble. **Refine per the Ring Taxonomy:** mood is a **Halo**; the
cancel thought-bubble is fine but should only appear above a threshold, otherwise a room with 400
customers is a room with 400 thought bubbles. **Below the threshold, the halo alone carries it.**

### → "The Funnel Lane" (§3.7)
"Drawn as a literal narrowing chute" is right. **Add the drop-through grates:** each funnel stage has a
grate in the floor beneath it; visitors who drop out fall through *their stage's* grate, so the
drop-off distribution is visible as which grates are busy. **The funnel report becomes a thing you
watch instead of a chart you open.**

### → "Colo — a prospective tenant touring the facility" (§3.3)
Called "the best visitor idea in the brief." It needs the **Tour Rail** camera (Part A §3) to actually
be a level. Also add: the tour's verdict strip items should map **one-to-one onto things the player
built or skipped**, and the post-tour screen should show the strip beside a photograph of the exact
moment they saw the bad thing. That photograph is the feedback.

### → "Dial-up — a dialling subscriber" (§3.3)
"The clearest capacity visual ever invented — reuse its grammar conceptually at every tier" — agreed
and under-committed. See the **Busy Wall grammar** proposal under §1 above, which makes the reuse
literal rather than conceptual.

### → "The Price Tag (attraction by price)"
"Raising the price makes the tag heavier: fewer visitors approach, but each is worth more (drawn bigger
and gold-er)" — good, except "gold-er" is the money hue on a unit again. **Propose:** the tag itself is
gold (it's a price), and the visitors gain **ornament**, not gold. The tag's physical droop from weight
is the memorable part and should be exaggerated.

### → "The SEO Garden / Organic Search Road"
The garden is the most charming idea in §3.6. **Expand:** wilting should be **directional** — plants
nearest the path wilt first when you serve crawlers 503s, so damage spreads inward from the road, and
recovery visibly regrows outward. Also: the garden should be **visible from the Establishing Frame**,
so a neglected content strategy is part of your facility's portrait.

### → "The Ad Spend Dial / The Beacon"
"A lighthouse whose beam sweeps the map edge; where the beam touches, visitors spawn" is excellent.
**Add the cost rendering:** the beacon should have a visible **fuel draw** connected to the Drain Choir
(Part A §6), so turning it off is visibly a cash decision. And competitor bidding should render as
**other beacons on the horizon whose beams overlap yours**, dimming your effective reach — an auction
rendered as light interference.

### → "The Status Page (honesty as a resource)" / "Uptime Trophy Wall"
"Visitors look at it before entering with a little glance animation" — promote the glance to the shared
Glance Animation system (Part A §3). **Add:** the wall's 90 pips should be **physically printed and
updated daily by a staff sprite**, so a day you'd rather not publish is a moment where someone walks
over and pins up a red pip. Honesty as a visible act.

### → "Client Cards (the game's best recurring choice)"
No visual spec for a card the player will read hundreds of times. **Propose:** the Customer Portrait
(Part A §3) top-left; six stat rows as **micro-bars, not numbers** (MRR, appetite, traffic, threat
attraction, support burden, churn risk), each with a hairline/normal/heavy stroke indicating how
confident you are in that estimate (Stroke Weight as Certainty). **The Client Interview upgrade
converts hairline rows to heavy ones**, which makes buying information visibly worth it.

### → "The Sacrifice Decision"
"The UI should make it feel heavy: a confirmation, a name, a number." **Make it heavier:** it uses the
**One-Way Door ratchet** and the drag-to-confirm slider (Part A §7), the customer's portrait is shown
at full size, their tenure and lifetime revenue are printed, and after you do it their portrait goes
straight to the Wall of Ghosts with the reason line pre-filled as `dropped to save the floor`. **The
game should write it down in your handwriting.**

---

## 4. Buildables: services and infrastructure

### → "Universal visual grammar for buildables" (§4.1)
The five-element grammar (faceplate / load donut / port studs / heat plume / upgrade slots) is the
strongest production spec in the document. **Four refinements:** (1) the **Load Donut** needs stated
thresholds and tick marks (green to 70%, amber 70–85%, red above, with a tick at the queueing knee)
so it teaches §7.1's hockey stick every time you look at it; (2) **port studs** need a hollow/solid
distinction for drained-vs-live (Part A §7); (3) the **heat plume** needs three discrete grades rather
than a continuous value, so "this one is hotter than its neighbours" is a comparison you can make by
eye; (4) add a sixth element — the **Age Plate** (Part A §1's Legacy Age Ladder), because age is the
one state the grammar currently can't express.

### → "Every buildable is a toy first, a stat block second" (§4.1)
Correct and unenforced. **Add the production gate:** a buildable is not approved without (a) its
silhouette plate at three sizes, (b) its assigned idle from the twelve-idle catalogue (Part A §4),
(c) its placement animation, (d) its Build Card composed, and (e) its "Opens:" glyph row populated.
**Five artifacts, checklist-able.**

### → "Web Server (the 1U pizza box)"
"A ring of worker-slot segments fills up like a parking lot" is a great slot visualization and it
duplicates the Load Donut. **Resolve:** the donut is *utilization*; the slot ring is *concurrency*, and
they are different things the game cares about separately (§7.1 makes exactly this point). Render them
as **two concentric annuli** — outer donut for utilization, inner segmented ring for slots — so you can
see the case where slots are full and utilization is low (a slow dependency) which is the game's whole
diagnostic thesis. **This one widget teaches the most important idea in §7.1.**

### → "VPS / KVM Node (hypervisor)"
"Overcommit shown by mini-machines visibly overlapping and clipping through each other" is a brilliantly
gross idea. **Add a threshold:** clipping should only begin *above* 1:1, and the depth of intersection
should be proportional to the ratio, so the player can eyeball their oversell. Also: a noisy neighbour
should visibly **push** its cellmates rather than merely overlap them.

### → "Cache Layer (Redis / Memcached / Varnish)"
Already the best-specified buildable. **One addition:** the hit-rate thermometer should have a **second
marker showing the rate you'd need for your DB to survive a flush** — the cold-start test made visible
as a line on the gauge. Falling below it is the moment the cache stopped being an optimization and
became a dependency, and currently nothing shows that transition.

### → "Backup System / Backup Vault"
"The one object in the game with no port studs" is a perfect piece of visual design. **Promote to the
Air-Gap Class** (Part A §4) so that the *absence of cables* becomes a readable property of a whole
category, and so that mounting a backup share visibly violates it.

### → "Load Balancer (L4 and L7 as separate builds)"
"Weights are literal vane angles you can drag" is the single best config-as-object idea in §4.
**Expand:** a backend that is draining shows its vane **closing slowly**; one that is health-check
flapping shows its vane **oscillating**, which makes §2.7's flap cascade visible as mechanical
chattering before any graph moves. Also, uneven strand thickness should be readable at Z3, which means
the strands need a minimum width — specify it.

### → "Firewall"
"The picture of your firewall config is literally how many holes are in the wall" is the best teaching
image in §4.4. **Expand:** each hole should be **labelled with its port number in the Signage face**,
sized by traffic volume, and **lit from behind by whatever is on the other side** — so an internet-facing
hole glows and an internal one doesn't. A rule that never fires gets the cobweb decal. And when you
open a port, the punch animation should show **debris falling**, because opening a port is destructive.

### → "Switch (top-of-rack)"
"The most information-dense small object in the game" — agreed, and it needs a legibility floor.
**Propose:** the 24 port LEDs must remain distinguishable at Z2; below that, the switch collapses to a
**summary strip** (a single bar showing aggregate utilization and one red pip if any port has errors).
Do not render 24 sub-pixel LEDs — that's the mush §8.9 is trying to prevent.

### → "DDoS Scrubbing Service"
"The detour's added arc length *is* the latency" is one of the best tradeoff pictures in the document.
**Add:** the arc should be drawn **at all times, not only under attack**, so the always-on latency cost
is permanently visible. That is the entry's own mechanical point and the visual currently only appears
during incidents, which hides the cost.

### → "WAF (Web Application Firewall)"
"False positives are drawn as a cyan visitor dissolving too, with a small guilty red 'oops' pip." Two
fixes: the pip should be **amber** per the Hue Ledger (amber = your own defenses hurting you), not red;
and the dissolve needs the **Mound of the Stopped** so the evidence accumulates rather than flashing
past. Also, the aggression slider should sit **on the object's faceplate**, not in a panel, since §4.5
says a tower with a live dial is worth ten with a fixed stat.

### → "CAPTCHA Gate"
"Real visitors pause and some annoyed ones leave" is the truest image in the document. **Sharpen it:**
the ones who leave should **turn around at the arch and walk back out through the incoming stream**,
against the flow, which is visually disruptive on purpose. You should find it annoying to watch.

### → "IDS / IPS Sentry"
"The visual difference between an outline and a beam teaches detection vs prevention" is excellent.
**Add the fatigue rendering:** as alert volume rises, the sentry's outlines should get **thinner and
more numerous** until the board is covered in faint outlines — at which point a real one is genuinely
hard to spot. **Alert fatigue rendered as visual noise you caused by buying too much detection** is the
most honest possible version of that mechanic.

### → "Patch Cart / Patch Management"
"A fleet with all-green pips is a beautiful sight and a real goal." **Expand:** patch lag should be a
**pip colour ramp on every machine's faceplate at all times**, not only in an overlay, because §7.5
makes patch lag a constantly-worsening background stat. When a zero-day drops, the fleet's existing
pips *are* the triage order with no new UI.

### → "Monitoring Stack (purchased in layers)"
"Building it unlocks HUD features — buying UI as an in-world object" is the best diegetic-progression
idea in the document. **Expand:** each of the five layers should unlock a **specific, nameable HUD
element**, and the Monitoring Wall's screens should physically fill in one at a time as you buy them —
an empty wall of dark monitors at Tier 1, a full NOC wall at Tier 4. **The wall's fullness is your
observability score.**

### → "Status Page"
"A small separate building across the street, visibly not connected" is perfect. **Add:** if you host
it internally, its cable should be drawn **crossing your own perimeter**, which is a small visual
wrongness the attentive player will notice before the lesson arrives. And the honest-amber vs
dishonest-green choice should render **on the building's own sign**, so your lie is posted on a
billboard.

### → "Rack"
"Half of datacenter work happens at the back of the rack and no game has ever shown it" — the best
observation in §4.7. **Promote to the Truth/Face Pair Law** (Part A §4) so it becomes a universal verb
rather than a rack-only feature, and specify the flip as a 0.4s rotation that preserves the selected
object's screen position.

### → "PDU / Busway"
"Power drawn as a thick black spine with tap-off boxes" — change the cable hue to **Copper** per the
Hue Ledger so power and money stop sharing gold. **Add:** each tap-off box carries its **Circuit Colour
Band** (Part A §4), so dual-corded redundancy can be verified by eye.

### → "UPS"
"A runtime-remaining readout that only becomes important once, and then is the most important number on
screen" — **make the promotion literal:** when utility power fails, the UPS runtime number should
animate out of the object and into the top bar at 3× size, displacing whatever is there. The number
physically moving from the world into the HUD is a genuinely novel way to say "this is now the only
thing that matters."

### → "Generator + Fuel Contract"
"The room shifts to generator lighting — a distinct, slightly wrong colour" is superb. **Specify it:**
generator light is ~2700K with a faint 2Hz flicker and slightly uneven coverage (some corners stay
darker), against utility light at 4000K and perfectly even. **The unevenness is what makes it feel
wrong** and it should persist for the entire generator run, not just the transition.

### → "CRAC / CRAH Cooling Unit (N+1)"
"Blows visible cold mist with a drawn throw distance" — good. **Add:** the throw should be rendered as a
**hard-edged floor decal** (a cone with a definite end) rather than a soft falloff, so placement is
solvable rather than vibes-based, and racks outside it should carry a small "outside throw" icon.

### → "Hot/Cold Aisle Containment + Blanking Panels"
"Watching the overlay clean up is the reward" — exactly right. **Expand:** the before/after should be
**held side by side for 2 seconds** after installation, because the whole value of the purchase is the
comparison and the player will otherwise miss it.

### → "Cable Management / Cable Tray / Patch Panel"
"Buying legibility is a rare and lovely thing for a game to sell you." **Add the honest cost:** a
bundled run should be visibly **harder to trace** (hover fans it out — Part A §1), and a patch panel
adds a physical hop that appears in the Latency Ladder. Tidiness should cost something visible or it's
a pure upgrade, which §4.1 forbids.

### → "The Office"
"A whiteboard that shows your current architecture as a scribbled diagram auto-generated from your real
topology" is a lovely diegetic minimap. **Expand:** it should be **out of date** — generated from the
topology as of the last time someone updated it, with a date in the corner. Objects added since are
missing. Updating it costs a hand. **Documentation rot rendered as a minimap that lies**, which is the
single best joke available to this game.

### → "Senior SRE / Greybeard"
"A visible aura that reduces incident duration for nearby systems" — auras are hard to read and collide
with the Ring Taxonomy. **Propose instead:** the greybeard's effect renders as the **objects they're
near visibly stabilizing** — their LED cadence regularizing to the heartbeat, their load donuts
settling. The effect is on the world, not on the person. Keep the mug.

### → "Security Engineer / Security Analyst"
"Their presence makes stealth threats faintly visible — literally increasing the alpha on invisible
sprites. Staff as a rendering modifier." This is the best single idea in §4.8 and should be a named
pattern. **Generalize it:** **Staff as Rendering Modifiers** — the DBA makes query internals visible in
the DB's cutaway; the Network Engineer makes link error counters visible without an overlay; the
Support lead makes customer mood halos visible at Z3; the Greybeard makes the *cause* highlighted
rather than the symptom. **Hiring literally changes what you can see**, which is a far better
expression of expertise than a percentage buff.

### → "Morale / Burnout Meter"
"Fatigue as posture is much better than fatigue as a number" — agreed, and the entry proposes both a
ring and a posture. Resolve per the Ring Taxonomy and the Fatigue Posture Ladder (Part A §4).

### → "Datacenter Tech / Remote Hands"
"A differently-uniformed sprite who does exactly what the ticket said and no more, sometimes comically
literally" — excellent. **Add:** the ticket text should be **visible in a speech bubble as they execute
it**, word for word, so the gap between what you meant and what you wrote is on screen. That's the
whole mechanic and it's currently only in prose.

### → "Compliance Boundary Paint (regulated)"
"Buying a line on the floor as a game object is wonderfully odd and thematically perfect." **Expand per
Part A §1**, plus: in-scope objects should adopt a **uniform white faceplate skin** so the boundary is
readable from above even with the paint occluded, and the scope count should be printed on the boundary
itself (`47 ASSETS IN SCOPE`) like a real floor marking.

### → "Modem Bank / RAS / Terminal Server (dial-up)"
"The purest capacity object in the game" — see the **Busy Wall grammar** proposal (§1 above), which is
the biggest single leverage available from this entry.

### → "Provisioning Automation"
"Should be the most satisfying upgrade in the game" and has no animation. **Propose:** before — a staff
sprite walks to a machine, a two-minute progress bar, one customer live. After — a signup arrives and
the account **materializes in under a second** with a crisp assembly animation and a chime, with no
staff involvement, and you can watch twenty happen in a row. **The contrast is the payoff**, so the
game should replay the "before" once as a memory the first time you use the "after."

---

## 5. Unlocks and discovery

### → "The Scar Tree"
"Your tech tree becomes a personal narrative artifact, and an enormously shareable one" — then ship it
as a shareable artifact. **Add:** a one-key **export** that renders the whiteboard as a clean
photograph with your company mark, the run's date range, and the scar count. Also see Part A §5 for the
stamp spec and the marker colour code, and the **Whiteboard at Scale** proposal, without which a
300-node tree on a whiteboard is unreadable by Tier 4.

### → "The Threat Codex / Bestiary (fill-in-the-blank)"
Called "the single best art showcase in the game" with four progression states and no card design. See
Part A §5's **Codex Card, Specified** (five states as physically different artifacts) and **Progressive
Icon Disclosure**, which extends the same progression into the world rather than confining it to a
menu.

### → "Growing tooltips" (§8.8)
"The UI itself is a progression system" is a great idea that only affects text. Pair it with Progressive
Icon Disclosure so the *glyphs* grow too — otherwise the player's growing literacy is invisible at the
altitudes where they actually play.

### → "The Fog of Instrumentation"
"Fog of war over your own stuff is unique and thematically perfect" — and binary. See Part A §5's
**Fog Grades**, especially the *stale* state, which is the common real failure the current design
cannot render.

### → "X-Ray Inspector"
"A cutaway view revealing the plate-stack with vulnerabilities drawn as cracks in specific plates" is
excellent and needs a fixed stack order so it's learnable. **Propose five plates, always in this order,
bottom to top:** hardware/firmware, OS/kernel, runtime, framework/library, application. Cracks are
drawn on the plate that carries the CVE. Patch lag renders as **dust between the plates**. Once fixed,
this becomes a readable diagnostic image rather than an illustration.

### → "The Runbook Library" / "Runbook Library / Documentation" (§4.6)
"The shelf filling up is meta-progression you can see." **Add rot:** spines visibly **fade and warp**
with age (§5.7's knowledge decay); a runbook used recently is bright and slightly pulled out from the
shelf; one not exercised in months is flush, dull, and its label is unreadable at Z2. A staffer
grabbing a faded binder should be visibly a bad sign *before* the outcome is worse.

### → "Vendor Relationships"
"Unlocks that change your art palette make progression aesthetically felt" is a strong idea that needs
the **Vendor House Styles** spec (Part A §4) to be buildable at all. Also: the relationship bar should
be drawn on the vendor's **logo card in that vendor's own brand style**, so the four dialects are
visible in the menu before they arrive in your racks.

### → "Job Applicant Skills / Staff-Carried Knowledge"
"They walk in and draw new sections on your whiteboard themselves… if they burn out and leave, the
marker fades (but doesn't erase)" is the best knowledge-loss visual in the document. **Expand:** each
staff member gets a distinct **handwriting**, so the whiteboard becomes a record of who taught you
what, and a faded section is identifiably *theirs*. The Alumni Network (§9.4) can then re-darken a
section if you rehire them.

### → "Blueprint Fragments"
"Collect three fragments and they animate together into a complete schematic." **Add:** the torn edges
should **actually interlock** (authored as a matched set), and the assembly animation should end with
the seams visibly remaining — a repaired document, not a new one. Sourced fragments should carry
provenance marks: an incident fragment is scorched, an audit fragment is stamped, a poached-staff
fragment has another company's letterhead corner on it.

### → "The Whiteboard Tree" (§5.8)
"Marker strokes, smudges, coffee rings, a 'DO NOT ERASE' note" — right tone. **Two additions:** the
**Marker Colour Code** (Part A §5) so branch families are legible; and a **"clean copy" action** that
costs a staff hand and redraws the board as a neat blueprint for ten minutes before it starts getting
annotated again. Documentation as Sisyphus, rendered.

### → "Rack Elevation Catalog"
"Locked items are blacked out like a redacted document" is a great locked-state. **Add:** era-locked
items are not redacted but **absent, with the page numbering skipping** — a gap in the catalogue that
says "this does not exist yet," which is a different and better feeling than "you can't afford it."

### → "The Delivery"
"Ten seconds, skippable, and never gets old if the sound design is right." **Add per-vendor livery**
(Part A §4) on the truck, and a **crate-on-the-dock** intermediate state (Part A §4's Loading Dock), so
lead time is visible as a physical object sitting in a doorway rather than a timer.

### → "The Abandoned Wing"
See Part A §5 for the full art spec. It is called "melancholy and characterful" and it is one line long;
it deserves to be one of the game's best-looking spaces because it is the emotional counterweight to
everything else the player builds.

### → "The Post-Mortem Polaroid wall"
"One wall for what you won, one for what it cost" is a beautiful structure. **Add:** the polaroids
should be **real captured frames** with the game's UI hidden and the Camera Grammar's Snap shot applied,
so they look like photographs rather than screenshots. And they should be **physically pinned with the
date written on the white strip in the Handmade Layer**.

---

## 6. Economy, money, and scoring

### → "Money as motion" (§8.7)
The richest single entry in §8.7 and the one most likely to break at scale. **Three fixes:** (1) the
three-LOD system (Part A §6) so DNS and serverless levels don't melt; (2) the drain lines need
**labels** (Part A §6's Drain Choir) or they're decorative; (3) the "burn/earn balance scale" and the
"liquid column" are two different money metaphors in the same paragraph — **pick the column** (it reads
at a glance and supports the Gap Bar) and demote the scale to an optional ledger-drawer widget.

### → "The metrics HUD" (§6.8) — the entire section
Seven blocks and ~35 metrics with zero visual design, governed only by "nothing is on the HUD the
player cannot act on." **Propose a structure:** the HUD carries exactly **five live numbers** (Cash,
MRR, Reputation, the current worst SLA, and the active scarce resource for this line). Everything else
lives in the **Ledger Drawer** (Part A §6), organized as the seven blocks, each block a page. Any metric
that crosses a threshold **promotes itself into the HUD temporarily** with a small animation of it
sliding up from the drawer, and drops back when it recovers. **Threshold-driven promotion is how you
get thirty-five metrics into five slots**, and it also teaches which ones matter.

### → "The rule of the HUD" (§6.8)
Keep it, and add the corollary: **every HUD number must name its own action on hover.** `RUNWAY 2.1 MO`
hovers to `→ collect receivables · sell annual · delay hardware`. If a number can't name an action, it
belongs in the drawer. That's the enforceable version of the existing rule.

### → "Bandwidth: the 95th-percentile bill"
"Beautiful, and it explains itself" — see Part A §6 for the actual drawing (lifted, greyed, discarded
top 5% floating above the plot with the bill drawn as a rule). **Add:** the discarded samples should be
**countable** — 36 hours' worth as discrete confetti — so "you get to throw away 36 hours a month"
becomes a thing you can see rather than a fact you read.

### → "Cash vs Profit (the two ledgers)"
"Two meters side by side with a visible gap that widens as you grow" — build it as the **Gap Bar**
(Part A §6), where the gap is the widget rather than the byproduct of two widgets.

### → "Runway"
"Under 3 months, the UI changes tone" — see Part A §6 for the three-stage spec. Without it, five
different systems will each invent their own panic state.

### → "The Uptime Ribbon"
"One glance tells the whole story of the level and it's a perfect share image." **Add:** incident
markers should carry the **scenario icon family** (Part A §1) rather than generic pips, so the ribbon
reads as a narrative; and the ribbon should have a **second, thinner lane beneath it for business
events** (a whale signing, a price change, a launch), so cause and effect line up vertically.

### → "The Traffic Sankey"
"The false-positive stream is the one that hurts" — make it structurally unavoidable per Part A §6
(drawn last, on top, crossing the others). Also label each branch with the **Bounce Cause Tags**
(Part A §3), which gives the Sankey the same vocabulary as the world.

### → "The Attacker Ledger"
"Nothing is more chilling than a non-zero number in that row" — referring to threats that got through
unnoticed. **Render it properly:** that row should be **the last thing to appear on the score screen**,
after a beat, in a different treatment (a stamp, not a number), and the threats should be listed as
**Codex silhouettes you haven't unlocked** — you're being told something got in and you still don't know
what it was. That is a far better use of the unknown-state art than a count.

### → "The postmortem screen"
"Turns the score screen into the progression screen." **Add the causality drawing:** the Correlated
Failure White Line (Part A §2) and a **Retro-Thread** — when the screen shows a delayed consequence, it
animates a thin Intent-layer thread back along the Timeline Ribbon to the decision that caused it, 90
in-game days earlier. **P10 ("almost nothing you do has an immediate result") has no visual anywhere in
the document and this is where it belongs.**

### → "Star ratings as real reviews"
"The best reputation display in the document because it's specific." **Add the Customer Portrait**
(Part A §3) to each review card and the review's **date and tenure**, so a 1-star from a four-year
customer looks different from a 1-star from someone who signed up last week. Also: reviews should be
set in the **Doc** typeface on a review-site-looking card, not in UI chrome — they're somebody else's
publication.

### → "Four analog dials"
"Needle gauges that sweep up to their values with a physical wobble" is a good alternative presentation
and it currently competes with the four-axis scorecard and the letter grade for the same screen.
**Resolve:** the dials are the **score screen's hero image** (they animate, they're satisfying, they're
the thing you look at), the four-axis bars are the detail beneath them, and the letter-grade stamp lands
on top of both at the end. Three presentations, one sequence, in that order.

### → "The Concentration Donut"
"The whale is visible as a shape." **Extend it into the world:** tenant tint intensity on the board
should be proportional to revenue share, so the whale's racks are the most saturated things in the room
and you can feel the concentration without opening a chart. **The donut and the floor should agree.**

### → "The SLA Meter"
"Watching the credit number climb while you debug is the most motivating UI element in the game." Use
the **Taxi Meter** widget (Part A §2) so this shares an instrument with toll fraud, egress shock and
recursive invocation — one horrible clicking object, five systems, one sound the player will come to
dread.

### → "The Cohort Wall"
"A steep fade is instantly, viscerally wrong in a way a percentage never is." **Add:** cells should use
the **Cohort Patterns** (Part A §3) so you can see *which channel* is fading, and hovering a row should
highlight those customers on the board. The wall and the world must be the same data.

### → "The Obligation Rail"
"Turns the future into a visible object" — the right idea for P10. **Add:** items on the rail should be
**colour-neutral but shape-coded** (a payroll stamp, an invoice, an audit seal, a contract, a
consequence-thread marker), and the 90-day-lag consequences should be drawn in the **Intent layer**
(dashed white) to distinguish "things you owe" from "things you caused."

### → "The Ledger Drawer"
"Numbers in a game feel better when they live in an object." See Part A §6 for the paper stock,
typography and tab spec — without it this is a panel with a drawer animation.

### → "The letter grade and the flavour title"
"The title is the thing players screenshot." See Part A §6's **Grade Stamp** for the actual artifact,
and note that the flavour title should be set in the **Handmade Layer** (someone wrote it on your
report), which is what makes it feel like a verdict rather than a system message.

### → "Per-line scorecard reweighting"
"Same four axes underneath, different face. Cheap to build, enormously effective." **Make the 'different
face' literal** via the Instrument Design Language (Part A §6): the score screen's hero dial swaps its
*face* per line while keeping the bezel, which is exactly the five-asset economics §0.2 asks for.

---

## 7. Core gameplay mechanics

### → "Drag-a-cable (the recommended primary interaction)"
The best-specified interaction in the document (typed coloured ports, catenary sag, snap, click).
**Three additions:** (1) **port hue must follow the Hue Ledger** — data cyan, power **copper** (not
gold), control white, trust **teal-violet** (not violet); (2) the drag should show a **live preview of
the Latency Ladder delta** so you can see the hop you're about to add before you commit; (3) an
invalid target's refusal bounce should also show the **Placement Refusal Icon** (Part A §4) naming why.

### → "Link health rendering"
Six states specified, which is good, and two are colour-only (congested = amber, failed = dark grey).
**Add non-colour channels:** congested links **bunch** their pulses visibly (motion), failed links go
**dashed and slack** (shape/physics), encrypted links keep the braid (texture), draining links use the
chevron pattern (Part A §7). Then the whole cable language survives greyscale, which is the stated goal
of §8.2's motion rule.

### → "Physical vs logical views that can disagree"
"The best idea in this section" and it has no rendering. See Part A §7's **Mismatch Seam**. This is
the second-highest-value visual gap in the document after the Correlated Failure line.

### → "Connection contracts (the link carries the policy)" / "policy beads"
See Part A §7 for the eight-bead inventory and tripped states. Also: beads should be **countable at
Z2** and should **collapse into a single bead with a number at Z3**, following the aggregate-don't-shrink
rule.

### → "Cable management score"
"Rewards the thing real datacenter people are obsessive about, and it's photogenic." **Make the score
visible as the thing itself** rather than a number: a rack's tidiness is its own render, and the score
readout is just the same information counted. Also, the **Ugly Auto-Route** (Part A §7) is what makes
the score meaningful — if the game routes tidily for you, tidiness is not an achievement.

### → "Rack U Tetris" / "Ghost build with icon-not-text reasons" / "Heat and power preview while placing"
These three are one interaction and should be specified as one. **Propose the placement loop:** pick up
a build → the rack elevations of every valid rack **light their eligible U slots**; invalid racks show
their Refusal Icon on the rack, not the cursor; the hovered rack's **amp bar and thermal tint update
live**; releasing plays the two-stage rail click. One continuous read from pick-up to placement, no
tooltips.

### → "The overlay wheel" (§7.6)
"Disciplined overlays are the whole answer to readability at scale" — and there's no wheel design and
no palette assignment. See Part A §7 for both, plus the **legend card**, whose absence would make every
false-colour overlay a guess.

### → "Security-surface overlay as literal brightness"
"The most immediately intuitive overlay in the document" — agreed, and it needs one guard: on a
pure-luminance overlay, **the alert triad must be suppressed entirely** or a red alert on a black
luminance field will dominate and destroy the reading. State the rule: *luminance overlays suspend
colour alerts and substitute shape pips.*

### → "Maintenance debt overlay"
"A grime/rust layer that accumulates visually." **Split it per the Wear Channel Triad** (Part A §4) —
dust (maintenance), heat stain (thermal), hand wear (change debt) — so the overlay tells you *which*
debt, which determines which action to take. One grime channel can only say "something is wrong here."

### → "The log panel"
"A player who reads logs gets a genuine head start." See Part A §7's **Anomaly Tick** for the subtle
affordance, and add: the log's typeface is the **Terminal** face, its window is the only curved surface
in the UI (Part A §7), and it should be **scrubbable back in time**, because the whole value of logs is
history.

### → "Cascades with a visible fuse"
"A cascade you can't see is just a loss screen; a cascade with a fuse is drama." See Part A §7 for the
fixed 1.5s-per-hop timing rule — **decoupling the fuse from simulation speed is the load-bearing
detail**, because at 4× speed a cascade currently becomes an instant loss.

### → "Partial failure states"
Six states named, none rendered, and the entry itself identifies the silent one as "the worst."
See Part A §7's **Partial Failure Set**, and note that the silent-wrong state is only renderable if the
**Truth/Face Pair Law** (Part A §4) exists — the two proposals depend on each other.

### → "The technical debt meter"
"Rendered physically — cable spaghetti, sticky notes, dust, a growing pile in the corner." **Add the
payoff animation:** paying debt down should play a **cleanup pass** — a staff sprite walking the aisle
removing sticky notes, coiling cable, wiping dust — over 20–30 seconds, visible and slightly boring,
which is exactly what it is. Per §9.6, make the boring thing beautiful.

### → "Slow-mo incident cam"
"Makes the player see the causal chain instead of just the aftermath." **Add the constraint:** it fires
at most **once per incident**, on the *first* domino only, and never during a cascade the player has
already seen. Otherwise it becomes an interruption rather than a revelation.

### → "Pause with orders"
"Because diagnosis is the gameplay" — and pause currently has no visual state at all. See Part A §7's
**Pause Frostpane and Intent Layer**. This is a core verb with zero art direction and it should not
ship that way.

### → "Speed controls, with a catch"
"At high speed you get less information" is one of the best mechanics in §7 and is **entirely
invisible**, which means players will experience it as unfairness rather than as a choice. See
Part A §7's **Speed Cost, Rendered**.

### → "Hands as action slots" / "P4 — Attention is a Resource"
"Visible as tokens at the bottom of the screen" is four words for the most important resource in the
game. See Part A §4's **Hands Dock** (a peg rail whose tags hang on the objects being worked). The
image the document keeps describing — "seeing your last free hand get consumed while three alerts are
firing" — only exists if the rail is a real object you watch empty.

### → "Blast radius as a first-class concept"
"Turns architecture into a spatial puzzle you can see." See Part A §7's **Blast Radius Bloom** — flat
fill, hard boundary, count on the boundary, ignores geometry.

### → "Effective vs nominal redundancy"
"The board computes effective redundancy and displays it separately." See Part A §7's **Broken-N+1
Badge** and Part A §4's **Circuit Colour Band** — between them, the mistake becomes spottable by eye at
Z2 instead of requiring a stat lookup, which is what makes it a *lesson* rather than a *readout*.

### → "The queueing hockey-stick"
"The latency graph visibly bending upward as the utilization bar crosses the threshold" — **put the
knee on the Load Donut itself** (a tick mark at ~75%) so every object in the game teaches the curve
passively, not just the graph.

### → "Backpressure and the red tide"
"The best failure animation in the document." **One constraint:** the red tide and the cascade fuse are
two backward-travelling red animations and will be confused. **Differentiate:** the tide is a **wash
that fills the link's whole width and persists**; the fuse is a **travelling point with a char trail
that passes through**. Tide = saturation (recoverable, ongoing); fuse = cascade (a discrete event
propagating). Different physics, different read.

### → "Recovery order matters"
"Bringing a system back up is a puzzle with a correct answer" — see Part A §7's **Recovery Ladder**,
which gives the puzzle a board.

### → "Zones and blast domains" / "VLAN painting"
Two colouring systems on the same board (blast domains and VLANs) will collide. **Resolve:** VLAN
painting uses **hue on the ports and cables only**; blast/failure domains use **floor-level boundary
lines and hatching**, never object hue. One paints the wiring, one paints the ground.

### → "The Big Red Button" / "Degraded-mode toggles"
Both are emergency controls with no physical design. See Part A §7 for the flip-cover button and the
switch panel — and note that they belong **together on the same desk**, so the crisis toolkit is one
place you look, which is what a real runbook drawer is.

---

## 8. Visuals and presentation

*This is where the contradictions live. Listed most-load-bearing first.*

### → "The Three-Layer Rendering Rule" (§8.2) — contradicted in four places
The rule states: *substrate never glows; flow never has flat UI colour; annotation never has
perspective.* All three clauses are violated elsewhere in the document.
- **"Substrate never glows"** vs §8.4 *Blinkenlights as primary telemetry*, §7.4 *tier rim-lights*,
  §4.2's *cyan-lit power button*, §1.3's GPU level where "everything glows."
- **"Annotation never has perspective"** vs §8.8 *Diegetic meters*, *The minimap as whiteboard / NOC
  wall*, §5.8 *The Whiteboard Tree*, §4.7's whiteboard architecture diagram, §9.4 *The diegetic
  settings menu*, §1.8 *The Company Wall*.
- **Flow/annotation blend** vs §8.6's patience rings, which move with units (flow) but are flat UI
  colour (annotation).
**Resolution:** adopt Part A §8's **Emissive Allowance** (substrate may emit as points and thin rims,
≤2% of screen area), **Diegetic Annotation Exception / Objects of Record** (diegetic info surfaces are
allowed, are never load-bearing in an incident, and always have a flat equivalent one key away), and
add a fourth layer, **Intent**. Also classify unit-attached UI (rings, tags, halos) as a named
sub-layer — **Attachment** — with its own rule: *flat colour, no lighting, screen-space scale, always
occludes its own unit and nothing else.* Without that clause, patience rings are undefined.

### → "The colour language" (§8.2) — nine hues, roughly fifteen jobs
See Part A §8's **Hue Ledger** for the full reassignment table. The specific collisions to fix:
- **Gold** = money (§8.2) **and** power feeds (§8.4's power overlay) **and** whale glow (§8.6) **and**
  GPU power cabling (§1.3) **and** bulletproof revenue (§1.3). → power becomes **Copper**.
- **Amber** = warning/degraded (§8.2) **and** false positives (§8.6) **and** fault LEDs (§8.4) **and**
  congested links (§7.2) **and** derate-limit amp meters (§7.3) **and** capacity >80% (§7.6) **and**
  patch-lag pips (§4.5). → reserve amber for **self-inflicted harm**; degraded goes to a desaturated
  warm grey-amber; capacity uses the green→red ramp without amber's exact hue.
- **Violet** = unidentified (§8.2, the best idea in the section) **and** trust/auth ports (§7.2)
  **and** the affiliate cohort (§3.7) **and** the GPU level's dominant palette (§1.3). → violet is
  unidentified, **only**; ports become teal-violet, cohorts become patterns, the GPU level shifts its
  key hue off violet entirely (it already has orange/copper/white to work with).
- **Cyan** = legitimate traffic **and** blueprint linework (§1.8's Blueprint Rewind, §5.8's Floorplan
  Blueprint, §8.1's style B) → blueprint register becomes **Ink Blue**, a darker desaturated blue that
  will never be mistaken for a moving request.
- **Magenta** = hostile traffic **and** the Arena level's décor (§1.3 "hot magenta-and-lime") → the
  Arena's palette shifts to hot pink-violet.
**This single table is the most important change in this report.** The document's best visual idea
(violet resolving into cyan and magenta) does not survive without it.

### → "The Readability Budget" (§8.2) vs the rest of the document
"At most 3 alert colours, 1 overlay, 5 animated FX types, 1 modal" is the right instinct and is
contradicted by the sheer volume of simultaneous systems the design ships (the FX catalogue alone has
20 named effects, several of which co-occur). **Fixes:** adopt the **Alert Triad Rule** (severity owns
the palette, not subsystems), the **Motion Budget per Altitude**, and the **Chroma Meter** as in-engine
enforcement (all Part A §8). Also state that **forced overlays reduce the alert budget to two**
(see the Cooling Failure note in Part B §1).

### → "The Diamond/Circle/Triangle law" (§8.2)
The law is right; the name is wrong and misleads. It is a **redundant-encoding law**, not a law about
three shapes — and the shape-token table has eight shapes, not three. **Rename it "The Two-Channel
Law": no information is ever carried by colour alone.** Then add the enforcement the law currently
lacks: a **greyscale pass is a sign-off gate** for every unit, overlay and alert state, run in the
Contrast Audit Mode the document already proposes (§8.9). At least three existing entries fail this
law today — §2.4's Mimic Tell ("a fill colour a few degrees off"), §2.11's Crawler Consortium
("cyan-gold"), §2.2's AI Scraper Locusts ("cyan-tinted-magenta"). Fixes for all three are in Part B §2.

### → "Shape tokens" (§8.2) vs "Session and duration classes" (§8.6)
The two tables disagree (see Part B §3). **Final mapping:** shape = duration class
(circle/teardrop/square/hexagon), ornament = value, prop = archetype, livery = business line, ring =
patience. Five channels, no overlap, every one greyscale-safe.

### → "Motion language" (§8.2)
"You should be able to mute the colour and still diagnose the board from motion alone" is the most
ambitious claim in §8 and is currently eight words of vocabulary. Pair it with the **motion spec
table** in Part B §2 (seven threat primitives) and the **twelve-idle catalogue** (Part A §4). Together
those make the claim testable: run the board in greyscale with motion only and see whether a tester can
name the problem.

### → "A. Clean Isometric Diorama" / "The recommended shipping combination" (§8.1)
The five-styles-in-one-game combination is defensible but the document never bounds where each style is
allowed, which is how games end up incoherent. **Propose an explicit allocation table:**
| Style | Owns | Never appears in |
|---|---|---|
| A — Isometric diorama | the world at Z1–Z3, all Substrate | menus, documents |
| B — Blueprint (**Ink Blue**) | Wiring Mode, tech tree, floorplans, exports, the Intent layer | the Room register |
| C — CRT/terminal | the in-game terminal, the 1990s era, Minimalist Mode | modern-era chrome |
| D — Tilt-shift warmth | lighting philosophy everywhere; never geometry | the Board register (which is flat and cool by definition) |
| E — Industrial grit | materials and set dressing at Z1–Z2, and the Establishing Frame | Z3+, where it becomes noise |
**Stated as ownership rather than as a blend, the five styles become a system instead of a mood board.**
This also resolves the ⚔️ tension already flagged in that entry.

### → "The Four Altitudes" (§8.3) vs "Zoom tiers change the metaphor" (§8.9) vs §8.10's per-line notes
Three entries describe the same camera system with different assumptions — §8.3 says fixed altitudes
with a universal LOD promise, §8.9 says each altitude may have its own metaphor, and §8.10 says some
lines (DNS, CDN, edge) live almost entirely at one altitude. **Resolve with Part A §8's Per-Line Default
Altitude** (each Ruleset Card declares home and detail altitudes) and one added clause: **the metaphor
may change between altitudes, but the selected object's screen position may not.** Continuity of the
thing you were looking at is what makes a metaphor change feel like a zoom rather than a scene change.

### → "Iconographic LOD" / "Aggregate, don't shrink" (§8.3, §8.9)
Correct and unimplemented. See Part B §1's **Density Ramp** note for the concrete LOD0–LOD3 targets,
particularly **LOD3: the object ceases to exist and is represented by its parent's aggregate glyph.**
That is the actual mechanism and it should be stated as a production requirement.

### → "Depth fog and focus" (§8.3)
"Distant/irrelevant parts desaturate and haze" conflicts with the Hue Ledger's use of desaturation as a
**health** signal (§8.2: "desaturated and dark is dead"). A hazed healthy rack and a dying rack will
read the same. **Resolve:** focus/distance uses **contrast reduction and a slight value lift** (haze),
never saturation. Saturation is reserved for urgency, permanently.

### → "Blinkenlights as primary telemetry" (§8.4) vs "The Quiet Frame Test" (§8.9) vs "The Heartbeat
Sync" (§8.9) vs "The Noise Floor" (§1.8)
Four entries that want the room to be simultaneously constantly-blinking, calm when healthy,
synchronized, and full of uncontrolled ambient activity. **Resolve with a stated hierarchy:** the
global heartbeat sets a **base pulse at ~0.5Hz** that everything healthy shares (calm, synchronized);
activity LEDs modulate **brightness within the heartbeat**, not independent blink timing (so a busy
room is brighter, not busier); **only anomalies are allowed to be off-beat**; and the Noise Floor's
ambient activity (techs walking, a flickering tube) is restricted to the **background plane at reduced
contrast** and is never in the same depth layer as your own equipment. Result: a healthy room breathes
together and passes the Quiet Frame Test, and desynchronization becomes the alarm channel §8.9 wants.

### → "Cable colour coding" (§8.4)
"The player picks a convention (or inherits a mess)" is a great mechanic and a hue-budget problem —
player-chosen cable hues will collide with the Hue Ledger. **Resolve:** cable colour convention is
applied as a **sheath band near the connector only**, from a restricted palette of six desaturated
"cable" hues that are deliberately outside the semantic set. The cable's *body* still carries the Flow
language (brightness, pulse, sag). **Convention on the ends, telemetry on the middle.**

### → "The generator and the lighting shift" (§8.4)
One of the best-written entries in §8 and it needs the exact colour-temperature spec in Part B §4 so
that three different artists don't produce three "slightly wrong" lightings.

### → "The two registers: Room vs Board" (§8.4)
"The transition should be an animated fold rather than a cut" — see Part A §8's **Two-Register Fold**
for the 0.6s spec and the screen-position-continuity rule, which is the whole trick.

### → "Wear, grime, and dust" (§8.4)
One channel doing three jobs. See Part A §4's **Wear Channel Triad**.

### → "The threat visual contract" / "Telegraphs" / "The unidentified state" (§8.5)
Covered in Part B §2: add scale as a fifth channel, five telegraph grades, and the Hue Ledger fix that
protects the violet resolution.

### → "The patience ring" / "Segment-coded appearance" / "The conversion moment" / "The false-positive
flash" / "Crowd density as a particle field" (§8.6)
All covered in Part B §3. The two that will break in production if not addressed are the **patience
ring at Z3** (needs the three-stage LOD) and the **false-positive flash** (a one-frame amber flash is
not observable at volume and it is the document's stated most-important negative feedback).

### → "Traffic as light" (§8.7)
"Throughput is density and brightness; latency is speed; queueing is bunching; failure is motes winking
out" — a genuinely complete metaphor, and it needs one clause it's missing: **what does *correctness*
look like?** Add: wrong-but-serving data carries the **Poisoned Tint** (Part B §2), so the metaphor
covers all four failure axes (slow, dropped, queued, wrong) rather than three.

### → "Health as colour temperature" (§8.7) vs "Saturation = urgency, Value = health" (§8.2)
Two health encodings. **Resolve:** they're compatible if stated as one rule — *health is value and
colour temperature; urgency is saturation.* A stressed node warms **and** stays bright; a dying node
warms **and** darkens; a dead node goes grey **and** dark. Write it once in §8.2 and delete the
duplicate framing in §8.7.

### → "Defense firing" (§8.7)
"Never a generic projectile. The defense should look like what it does" is the right law and the entry
covers six defenses out of ~15. **Add the missing verbs:** fail2ban **yanks** (a hook pulls the unit
off-screen — already described in §2.2, promote it); IDS **outlines**; IPS **shoots**; the circuit
breaker **opens** (a physical gap); the bot fingerprinter **peels**; egress filtering **refuses** (a
one-way gate that visibly won't open outward); the connection pooler **queues**; CSP **snips** (the
scissors from §2.5). Also add the **off-state and mis-tune state** (Part A §4).

### → "Money number feel" (§8.7)
Good, and see Part A §8's **Number Law** for the rest of the numeric system, particularly *never
abbreviate money below $10k* — which matters precisely when the Runway tone shift is active.

### → "Alert escalation visuals" (§8.7)
Five steps is the right count. **Add the missing clause:** each step must also have a **non-colour
channel** — info (a dot), warning (a pip **with a notch**), minor (an outline **that is dashed**),
major (a rack tint **plus a corner flag**), critical (a card **plus the bezel rule**). Otherwise the
ladder is colour-only and fails the Two-Channel Law.

### → "The HUD skeleton" (§8.8)
Top bar, left palette, right inspector, bottom ticker and alert stack, plus a pulse strip, plus
(from elsewhere) the overlay legend, the hands dock, the three-clock cluster, the hum bar, the site
preview and the off-board register. **This does not fit.** See Part A §8's **Screen Budget** for a
stated allocation, Part A §8's **Bezel HUD** for where the off-board and overlay state go, and Part B
§6's **threshold-driven promotion** so the metrics HUD doesn't consume the rest.

### → "The Site Preview Window" (§8.8)
Called "the single best UI idea in the document" — agreed, and it needs a failure spec and a scale
answer. **Add:** it renders the *actual* degraded states (missing CSS, broken images, error page, queue
page, ransom note, spam-folder placement, a game client's connect timeout, a 502 from an API), it shows
**which customer** it is currently mirroring with a picker, and at scale it becomes the **Wall of
Mirrors** (Part A §3). Also: when your infrastructure is fully healthy it should show the site loading
**fast and unremarkably**, because the absence of drama is the reward.

### → "The Pulse Strip" (§8.8)
"Answers 'is this normal?', which is the actual first question of every incident." **Add the normal:**
the strip should carry a **faint band showing the same period yesterday/last week**, so "is this
normal" is answered by comparison rather than by memory. That one addition converts it from a sparkline
into a diagnostic.

### → "The Inspector Faceplate" (§8.8)
"One layout for every object in the game — learnable once, used forever." **Add the Truth tab** (Part A
§4): every inspector has Face and Truth, and the Truth tab is where the disagreements live (effective
vs nominal redundancy, last verified restore, actual patch level, real replication lag, the physical
cable path). **The most important panel in the game should have a page for what is actually true.**

### → "The Timeline Ribbon" (§8.8)
"Built once, used in three places" — make it four: it is also the **replay scrubber** (Part A §9) and
the surface the **Retro-Thread** (Part B §6) draws on. Add a second business-event lane (Part B §6).

### → "The minimap as whiteboard / NOC wall" (§8.8)
Diegetic and functional is the right ambition; it is also an Object of Record with perspective (see the
Three-Layer contradiction above) and therefore must have a **flat equivalent one key away**. State it:
the NOC wall is the pretty version; `M` opens the flat schematic minimap. Both, always.

### → "Notification discipline" (§8.8)
"Only a genuine sev-1 may take the screen" — correct, and it needs the **three-channel spec**: ticker
line (ambient), pip/badge (state), card in the alert stack (actionable), and modal (sev-1 only, max
one, auto-pause optional). Anything a system wants to tell you must declare its channel at design time.

### → "Tutorial-free onboarding" (§8.8)
"The first of anything shows a small animated demonstration on hover" — a lovely idea with no format.
**Propose:** a 2-second looping **micro-demo** in the hover card's top region, authored as a tiny
isometric vignette with no text, showing the mechanic in the abstract (a cable snapping in, a ring
depleting, a breaker opening). ~60 of them across the game, all 200×120px, all the same style. **A
consistent format is what makes them cheap.**

### → "Accessibility affordances" (§8.8)
The list is good and incomplete for a game whose primary telemetry channels include ambient audio,
colour and motion. **Add:** the **Hum Bar** and **diagnostic audio captions with location** (Part A §8)
— without them the Beeping Server, the drive click, the fan ramp and the mimic's silence are all
inaccessible; the **Strobe Budget and Reduced Flashing mode**; **three named colour-blind palettes plus
Shape-First**; **Readout Mode** (Part A §9) for every diegetic gauge; **UI scale to 200%** with the
Screen Budget's collapse behaviours; and a published **reduced-motion translation table** (every FX in
the §8.12 catalogue mapped to a static or slow equivalent) rather than the vague "animations become
state changes."

### → "Contrast audit mode" (§8.9)
Currently a nice-to-have. **Promote it to a sign-off gate** — it is the enforcement mechanism for the
Two-Channel Law, and it should be run on every unit, alert state and overlay before approval, not
shipped as an option and forgotten.

### → "The Quiet Frame Test" (§8.9)
"This single test protects the entire visual language." Agreed — and it only protects one end of the
range. Add the **Loud Frame Test** (Part A §8): a peak-crisis screenshot must answer *what is broken /
what is worst / what can I do* in five seconds.

### → "Tenant tinting" (§8.9)
A hue per customer, in a game with a nine-hue semantic palette and potentially dozens of tenants.
**Resolve:** tenant tint is a **low-saturation band on the cabinet frame only**, drawn from a
deliberately muted 12-hue set that is visually distinct from the semantic palette, and **beyond 12
tenants the game stops assigning hues and uses initial-lettered nameplates instead.** Attempting 200
distinguishable tenant colours is the failure mode to avoid.

### → "The Business-Line Skin System" / "The Five-Asset Skin Kit"
The single most practical idea in the visual half of the document, and asset #4 ("a signature meter")
is the one that will fragment without a shared language. See Part A §6's **Instrument Design Language**
— one bezel, many faces. Also add a **sixth implicit asset that costs nothing**: the line's **density
signature and arrival rhythm** (§8.10 already names both), which should be authored as two numbers in
the Ruleset Card rather than left to art direction.

### → "Per-line visual identities (the catalogue)" (§8.10)
Thirty lines, one or two lines of description each, ranging from fully-specified (GPU, tape, colo) to
a fragment (blockchain: "a chain visualization, sync-height counters"). **Propose a required five-field
format for every line**, so the catalogue is authorable: `palette (2 hex + material)` · `hero
silhouette` · `visitor costume (hull + prop)` · `signature meter (gauge face + bound resource)` ·
`ambient FX + sound`. Then fill the thin ones:
- **Blockchain** — hero: a storage tower that only grows, with a visible high-water mark ring; visitor:
  a block arriving on a metronome; meter: a **sync-height gap gauge** (two needles, yours and the
  network's); FX: the fork — the chain visibly branching and one branch going grey.
- **IoT** — hero: an ingest manifold with hundreds of tiny inlets; visitor: dust; meter: an
  **ingest-rate weir** (flow over a notch); FX: the reconnect storm as the weir overtopping.
- **Serverless** — hero: the Chrysalis Pool as a warmed tray; visitor: the mayfly; meter: a **cold-start
  stutter bar**; FX: the bloom.
- **Seedbox/file** — hero: a shelf of storage boxes with hand-written labels; visitor: a fat transfer
  ribbon; meter: an **abuse-queue depth** tray; FX: the null-route (a pipe visibly capped).
- **DBaaS** — hero: the card-catalogue drawer bank; visitor: a query slip; meter: a **replication-lag
  rubber band**; FX: the split-brain seam.
- **Edge/MEC** — hero: the street cabinet; visitor: a local request that never leaves its region;
  meter: a **site-reachability board** (80 pips); FX: the truck roll.

### → "Era presentation shifts" (§8.10)
"Re-skins the UI chrome, palette, typography and material language" — unbounded, this is four UI
redesigns. See Part A §8's **Chrome Skin Token Set** (four tokens, layout never changes). Also, the
"Comic Sans warnings" gag should be restricted to **in-world signage** (Handmade Layer), never to
chrome, or the 1996 levels become unplayable rather than funny.

### → "Material and lighting language per line" (§8.10)
"Material carries mood faster than any HUD element" — true, and it needs a constraint so it doesn't
fight the Flow layer. **Add:** per-line material may vary **albedo, roughness and one accent emissive**
only; it may never change the **status-LED language, the Load Donut, the port studs or the alert
palette.** That's the Foreignness Budget (Part A §8) applied to your own lines rather than to tenants.

### → "Cross-line collision control" (§8.10)
"Palettes are constrained to their dominant hue only" is the right instinct and needs one more clause:
in a multi-line facility, **the Flow layer stays globally neutral** — traffic is cyan/magenta/violet
everywhere regardless of which district it's in. Districts colour the *building*, never the *packets*.

### → "The datacenter hum" / "Audio as visual redundancy" (§8.11)
"Ambient audio as telemetry is the most underused idea in strategy games" — agreed, and as written it
makes a primary diagnostic channel inaccessible. §8.11's own redundancy clause ("every critical visual
alert has an audio counterpart and vice versa") does not cover *ambient* telemetry, which is
continuous rather than alert-shaped. See Part A §8's **Hum Bar** and **diagnostic audio captions with
location**, which close the gap without weakening the audio design.

### → "Per-line sound palettes" (§8.11)
"The fifth asset in the Five-Asset Skin Kit is a sound, and it does more than the other four" — likely
true. **Add the constraint that keeps it usable:** each line's ambient bed must leave the **same
frequency band free** for the alert tones, so pager severity is equally audible in a GPU hall's pump
noise and a tape vault's near-silence. A stated audio budget, like the colour budget.

### → "The FX catalogue" (§8.12)
Twenty named effects is an excellent production artifact. **Three additions and one gap:** add
`FX_TariffWave` (per-unit cost change rippling across the fleet — Part B §2), `FX_PoisonTint`
(wrong-but-serving), `FX_SolidifyIntent` (an Intent-layer promise becoming real). The gap: **the
catalogue has no entry for a threat being *blocked*** — the single most frequent effect in the game.
Add `FX_Deflect`. Also annotate each entry with its **reduced-motion equivalent**, which makes the
catalogue serve double duty as the accessibility translation table.

### → "Loading screens as rack diagrams" (§8.12)
Good; pair with Part A §1's **Loading Is Provisioning** so the load screen is a bring-up sequence rather
than a static diagram, and the tips land while something is happening.

### → "The Cold Open" (§8.12)
"Ten seconds, sets the scale, never gets old" — it will get old. **Add:** it plays in full on first
visit to a level type and is **abbreviated to 3 seconds thereafter**, with the full version always
available from the pause menu. And it must be skippable on the first frame, not after two.

### → "The 100% Uptime Stamp" (§8.12)
Use the same stamp instrument as the **Grade Stamp** (Part A §6) — one physical stamp animation, three
uses (grade, uptime, audit seal), which is exactly the asset-reuse discipline §9.6 asks for.

---

## 9. Anything else

### → "Sandbox / Architect / Lab / Zen" (§9.1)
"Never underestimate how many people will play only this" — then give it the art budget that implies.
**Add:** Sandbox should default to the **Aquarium** camera (Part A §9) when idle for 60 seconds, ship
with **Photo Mode** unlocked, allow **free palette selection** across all unlocked line skins (a
sandbox player wants to build a GPU hall in tape-vault lighting), and include a **blank-facility
preset** with the Zero-State art at its best. This mode is the game's screenshot engine and its
marketing department.

### → "Minimalist Mode" (§9.1)
"Costs almost nothing to build on top of the existing simulation." True only if the CRT style (§8.1's
option C) has a **complete glyph set** — which means authoring an ASCII/box-drawing equivalent for
every unit, state and alert. **State that as the actual cost**, and note the bonus: that glyph set *is*
the Shape-First accessibility mode (Part A §8) in another skin. **Build it once, ship it twice.**

### → "Photo Contest / Rack Gallery" (§9.1)
Needs Photo Mode (Part A §8) and a gallery UI. **Propose the gallery as a physical print wall** — a
grid of pinned photographs with the submitter's company mark and tier in the corner card, browsable
with the Orbit camera. Consistent with the house style of "nothing is a pop-up if it can be a thing."

### → "Blind Mode" (§9.1)
"A short, horrifying, extremely effective way to teach why observability exists." **Give it a look:**
the board renders as a **flat grey wireframe with no telemetry at all** — shapes and cables, no lights,
no donuts, no rings — and the only coloured objects on screen are incoming tickets. When the mode ends,
the telemetry **floods back in** in one animation. That flood is the lesson.

### → "Technical debt as visible substance" (§9.2)
"You can see how much debt you're carrying by looking at the room." **Split it per the Wear Channel
Triad** (Part A §4) so the room tells you *which kind* of debt, and add the **cleanup pass** animation
(Part B §7) so paying it down is a thing you watch.

### → "Reputation Has a Face" (§9.2)
"Far more affecting than a bar" — and it needs the **Customer Portrait System** (Part A §3) plus three
recurring NPC portraits (the trade journalist, the prominent customer, the forum regular). **Their
expressions should be the readout**: five authored expressions each, and the current worst one appears
next to the Reputation number in the HUD. A face is a legible stat.

### → "The Camera Is a Camera" (§9.2)
"Losing power or network to a site means losing the view of it" — the most elegant twist in §9.2 and it
needs a failure aesthetic. **Propose:** a lost site's viewport degrades in stages — first a **frame-rate
drop and compression artifacts** (network degraded), then a **freeze with a timestamp watermark**
(last known frame), then **static and a `NO SIGNAL` card** in the era's own style. You can still open
the site's tile; it just shows you the last thing you saw, which is worse than nothing.

### → "The Beeping Server" (§9.2)
"Absurd, delightful, and completely authentic" — and unplayable without hearing. **Add:** the audio
caption carries direction and approximate distance (`[beeping — ahead, 3 racks]`), and an unlockable
**acoustic overlay** shows a heat-map of sound intensity, which is both an accessibility path and a
funny purchase. Keep the stereo-pan version as the default.

### → "The office set dressing" (§9.3)
The warmest writing in the document. **Add the rule that makes it work:** every set-dressing object is
in the **Handmade Layer** (Part A §8) and **at least one of them is mechanically live** — the coffee
machine really is on a shared circuit, the cat really can cause an incident, the Days Since Last Outage
board really is the uptime streak. **Set dressing that is 90% flavour and 10% real is far better than
either extreme**, because the player can never be sure which is which.

### → "Server naming and the label maker" (§9.3)
"A running joke that becomes an operational problem." **Render it:** the naming scheme is a real
generator, names appear on real label tape in the Handmade Layer at Z1, and at Tier 4 the game should
show you a rack where **three schemes coexist** — the Greek gods from Tier 1, the functional names from
Tier 3, and the acquired company's names — which is the joke, the problem and the history in one
photograph.

### → "Achievements" (§9.3)
The best list in the document. See Part A §9's **asset-tag** treatment — barcodes, blank tags for
locked ones, cheap paper stock for `Days Since Last Outage: 1`.

### → "The Company Museum" (§9.4)
"The single best reason to keep a long save" and it has no layout. See Part A §9's **Museum Floorplan**,
which assembles six systems the game already generates into one walkable space.

### → "Screenshot watermark" (§9.4)
"A small tasteful corner card with your company name, tier, uptime and date." **Add:** it uses the
**Player Company Mark** (Part A §8) at its current fidelity level, so the watermark itself shows how
far you've come — a Tier-1 screenshot is watermarked in clip-art and a Tier-5 one in etched aluminium.
**Free storytelling on every shared image.**

### → "Modding the skin kit" (§9.4)
"The perfect community content format." It needs the **Skin Kit Editor** (Part A §9) and, critically,
the **Instrument Design Language** (Part A §6) — without a shared gauge-face system, community meters
will be the thing that makes modded lines look wrong.

### → "The Ending camera move" (§9.4)
"One shot, earned." **Specify the three variants** so the ending reads: **Acquisition** — the pullback
happens and the lights stay on, but your mark on the building **cross-fades to the acquirer's**.
**Institution** — the pullback, lights on, your mark intact, and the camera holds much longer than is
comfortable. **Collapse** — the pullback happens with the lights going out in dependency order beneath
it (reusing the Fail-Forward Fade), and the last light is the exit sign. Same shot, three meanings.

### → "Field Notes" (§9.5)
An in-game encyclopedia with no design. **Propose:** it is a **ring-bound field guide** in the Doc
typeface with hand-drawn diagrams (Handmade Layer), one spread per concept, unlocked entries
tabbed and un-unlocked ones showing only the tab. The "was that real?" tag (Part A §9) stamps the
bottom corner. **It is the one place in the game where a wall of text is correct**, so it should look
like a book worth reading.

### → "Import Your Own Topology" (§9.5)
"Every ops team will want to do this to their own stack, and the results will be shared widely." That
makes it a **rendering** feature as much as an import feature. **Add:** the import's output should be
presentable — it lands as a **Blueprint Card** and a rack elevation first (Part A §9's poster export),
*then* becomes a playable level. People will share the diagram whether or not they play the level.

### → "Make the boring thing beautiful" (§9.6)
The most important tonal rule in the document, and it needs an enforcement mechanism or it will lose
every budget argument to explosions. **Propose the rule as a budget line:** the unglamorous-correct
actions — restore drill, patch pass, blanking panels, dunning, cable management, documentation, load
bank test, scrub pass, tabletop exercise — get a **named FX in the catalogue, a bespoke sound, and a
minimum 2-second animation**, and no threat FX is approved until its corresponding *prevention* FX is.
**Pairing every monster with its chore, in the production schedule, is how this rule survives.**

### → "Asset reuse discipline" (§9.6)
"Any new content that requires more than five bespoke assets needs to justify itself." Correct, and it
should be extended to the FX catalogue and the instrument faces: **new content may add one FX and one
gauge face; anything more requires cutting something.** That is what keeps the Readability Budget
achievable at 30 hosting lines.

### → "Accessibility as a feature, not a setting" (§9.6)
The strongest version of this principle is to name the modes that are *good to play*, not merely
*possible* to play: **Shape-First** (the greyscale/pattern mode, which doubles as Minimalist Mode's
glyph set), **Readout Mode** (numbers on every diegetic gauge, which min-maxers will prefer), and
**Reduced Flashing** (which is simply more comfortable for long sessions). **If the accessibility modes
aren't ones a sighted, hearing player would sometimes choose, they aren't finished.**

### → "The screensaver / idle view" (§9.7)
"Half the audience would leave it running on a second monitor, and that is a feature worth shipping."
See Part A §9's **Aquarium** for the spec. Add: it should be reachable from the main menu without
loading a save, running a **generated** facility, so it works as a demo at a trade show and as a
storefront video.

### → "Real uptime leaderboard" / "Spectator and replay" (§9.7)
Both need the **Replay Overlay** and **Stream Overlay** (Part A §9). The uptime leaderboard in
particular should render a run as its **Uptime Ribbon** rather than a number — comparing two ribbons
side by side is instantly legible and a number is not.
