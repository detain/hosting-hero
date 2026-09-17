# Hosting Company Tower Defense — Idea Wave 2
## Lens: Graphics / Visual Designer

> Everything below is written from the art-and-UI chair. The governing question for every idea is
> **"what does the player actually SEE, and can they still read it when there are four hundred of them?"**
> Mechanics are described in terms of their visual expression: silhouette, color, motion, layering,
> camera, and HUD. Where a system is mostly numbers, I describe the *picture of the numbers*.

---

## 0. The three visual laws this document assumes

Stated once so every later idea can lean on them.

- **Law 1 — Three Layers.** The screen is always exactly three stacked layers: **World** (the
  physical, lit, isometric stuff — racks, rooms, buildings), **Signal** (semi-transparent overlays
  drawn *in world space* — cables, heat, packets, threat lanes, visitor ribbons), and **Chrome**
  (flat, crisp, screen-space UI that never rotates or scales with the camera). Never let a concept
  live in two layers at once; that is the single biggest readability killer in a game where the unit
  count grows 500×.
- **Law 2 — Semantic color lock.** A small set of hues are *reserved forever* and may never be used
  decoratively: **cyan/mint = visitors & revenue-bearing traffic**, **magenta/hot-red = threats**,
  **green/amber/red = health of a thing you own**, **gold = money**, **violet = compliance/legal**,
  **white-hot = emergency/fire/suppression**, **blue strobe = "locate/identify this unit"**.
  Everything else — the whole world — is built from desaturated concrete, steel, beige, and rust so
  those seven hues always pop.
- **Law 3 — One salient thing per container.** A rack, a row, a room, a building each get exactly
  one "loudest" visual at any moment. As you zoom out, children's alarms are *merged* into the
  parent's single salient signal rather than all drawn at once. This is what keeps a 12-datacenter
  endgame from looking like a Christmas tree falling down the stairs.

---

## 1. Levels, Scenarios, and Progression

### 1.1 The scale ladder, expressed as a camera ladder

1. **The Camera Ladder (six fixed tiers).** Progression is literally a zoom-out. Each tier is a
   separate art treatment with its own asset set, not just a scaled version of the last one.
   - **Tier 0 — Chassis View.** One box, cut open. You see DIMM slots, a CPU with a fan, drive bays,
     a single NIC. Individual LEDs are 4px. This is the tutorial and the "single site on a shared
     box" level.
   - **Tier 1 — Rack Elevation.** Straight-on 42U side view, like a real rack diagram. Servers are
     horizontal bars 1U tall; you read the whole stack like a barcode. This is the colo-a-few-boxes
     tier.
   - **Tier 2 — Room Isometric.** A suite/cage: a handful of racks in hot/cold aisles, a CRAC unit,
     a door. Racks are now ~80px tall objects, individual servers are 6px slivers.
   - **Tier 3 — Floor Plan.** A full datacenter hall, dozens of rows. Racks are 12px tiles. Servers
     are no longer drawn at all — the rack *is* the atom.
   - **Tier 4 — Campus.** Buildings, a yard, generators, fuel tanks, a substation, a meet-me room,
     a fence line. The hall is a footprint.
   - **Tier 5 — Globe / Region Ribbon.** A stylized world with your sites as glowing pins and your
     transit/peering as arcs. The building is a dot.
   **Hooks into:** every other category — threats, visitors and money all have a distinct "what does
   this look like at Tier N" definition (see §8.12, the LOD contract).
2. **The Elevator Transition.** Moving between tiers is never a hard cut. The camera pulls back,
   the current tier's detail *dissolves into* the parent's summary glyph with a 300ms cross-fade,
   and a thin white "you are here" frame shrinks to show what you just left. The player should be
   able to hold the zoom key and watch their whole company assemble/disassemble like a telescope.
3. **Zoom-as-Abstraction (the LOD swap).** Every entity declares four representations:
   **full sprite → icon → colored dot → contribution to a heat tile**. A failing drive is a clicking
   sprite at Tier 0, an amber bay icon at Tier 1, an amber pixel at Tier 2, and one degree of "this
   rack's tile is slightly amber" at Tier 3. Nothing ever *vanishes*; it gets folded upward.
4. **The Growth Scar.** When you graduate a level, the old setup is not deleted — it's *kept in the
   corner*, visibly obsolete. Your Tier-0 beige tower ends up as a dusty box in the corner of the
   Tier-2 suite with a "DO NOT DECOM — DNS STILL ON THIS" post-it. It's the single best readable
   signal of "look how far you came," and it doubles as a running joke and an actual liability node.
5. **The Office Wall (progression screen).** The campaign map is a corkboard in the company's
   office that visually accretes: pinned photos of racks, a rack-unit ruler, a growing pile of
   business cards, certification patches sewn onto a hanging jacket, dead drives on a shelf,
   whiteboard architecture sketches that get denser. No "world map of nodes with a path" — the
   physical office *is* the progress bar.

### 1.2 Level identity kits — one "visual chord" per hosting type

Each hosting business type ships as a **Visual Identity Kit**: a 5-color chord, a lighting rig, a
material set, a typeface, a particle palette, and a signature ambient motion. Swapping hosting type
between levels should feel like walking into a different building, not re-skinning a menu.

6. **Shared Hosting — "The Apartment Block."** Warm sodium-yellow lighting, beige/putty plastics,
   dense stacking. A single server is drawn cutaway as a *tenement*: dozens of tiny lit windows,
   each one a customer site, each flickering when that site gets traffic. Noisy-neighbor problems
   read as one window glowing too bright and dimming the rest of the floor.
   **Chord:** putty · sodium yellow · oxide red · dishwater grey · mint (traffic).
7. **VPS / Cloud — "The Egg Carton."** Cool grey-blue, precise grid, everything is a uniform cell.
   Hypervisors are drawn as trays; VMs are identical rounded tiles that can be picked up and moved
   between trays with a satisfying magnet snap (live migration!). The look is *interchangeable parts*.
   **Chord:** slate · ice blue · white · graphite · cyan.
8. **Dedicated / Bare Metal — "The Workshop."** Heavier, more individual. Each box has a visible
   asset tag, a distinct front bezel, a Dymo label with a hostname. You *own the metal* and the art
   says so: scratches, mismatched vendor colors, an ear that's been re-drilled.
   **Chord:** gunmetal · brushed aluminium · safety orange · oil-stain brown · green LED.
9. **Colocation — "The Landlord's Grid."** The defining visual gag: **you cannot see inside your
   customers' cages.** Tenant cages are drawn as frosted/mesh volumes with silhouettes only; you see
   power draw, heat, and door events but the gear inside is a blur with an occasional unreadable
   blinking shape. Your whole HUD shifts from "server health" to "power, cooling, access, floor."
   **Chord:** concrete grey · galvanized steel · caution yellow-black hatching · cage-mesh navy ·
   badge-reader green.
10. **Wholesale / Hyperscale Build-to-Suit — "The Shell."** Construction art language: unfinished
    slab, exposed rebar, plastic sheeting, survey stakes, a crane. Progress is literally building
    getting built — walls close, floor tiles go down, the room finishes. Your "units" are megawatts,
    not servers, so the HUD swaps server counters for a **power one-line diagram** as the main view.
    **Chord:** raw concrete · rebar rust · high-vis lime · tarp blue · substation arc-white.
11. **Game Server Hosting — "The Arena."** The loudest, most saturated kit. Neon, scoreboard
    typography, crowd-noise particles. The signature visual is the **tick metronome**: a horizontal
    pulse bar across the top of each game node that beats at server tick rate. When latency or CPU
    contention hits, the beat visibly *stutters and smears* — you feel lag as a broken rhythm before
    any number changes.
    **Chord:** black · hot magenta · acid green · electric blue · scoreboard amber.
12. **Voice / SIP — "The Switchboard."** Calls are *unbroken ribbons*, not packets. The visual rule:
    a ribbon that breaks anywhere is a dropped call, and a ribbon with a visible *notch* is jitter.
    The room is built around a wall of jack-field patch panels, and audio quality is drawn as ribbon
    smoothness. Nothing else in the game is this unforgiving-looking, and that's the point.
    **Chord:** bakelite black · brass · cream · signal red · ribbon teal.
13. **Email Hosting — "The Post Office."** Paper. Letters, sorting bins, franking stamps, mail sacks.
    Spam is *pulped grey mail*; a blocklisting is a giant red **RETURN TO SENDER** stamp descending
    on your whole outbound flow. Reputation is drawn as the cleanliness of your sorting hall.
    **Chord:** manila · postal blue · rubber-stamp red · twine brown · sorted-mail white.
14. **DNS / Anycast — "The Phone Book."** Near-abstract, map-dominant. Your nodes are tuning forks;
    queries are single-frame ping motes that arrive and leave in under half a second. The signature
    visual is the **anycast bloom** — a query hitting the map and getting answered by whichever node
    lights up first, drawn as competing ripples where the nearest ripple wins.
    **Chord:** ledger cream · ink navy · ripple cyan · index-tab red · bakelite grey.
15. **CDN / Edge — "The Constellation."** Map-first level type. Your PoPs are stars; cache state is
    star brightness (cold = dim, warm = bright). A cache miss is visually a *long thin thread* all
    the way back to origin that everyone can see; a cache hit is a short local flash. Players learn
    cache economics by watching thread length shorten as they warm the edge.
    **Chord:** deep space navy · star white · hit-mint · miss-amber · origin gold.
16. **Object Storage / S3-alike — "The Honeycomb."** Hexagonal tiling everywhere. Objects are
    pebbles that fall into cells; replication is drawn as the same pebble appearing in two other
    combs with a soft triple-flash. Durability is expressed as how *full and even* the comb looks.
    **Chord:** amber hex · dark comb-shadow · replication violet · sealed-wax green · gap black.
17. **Backup / Archival / DR — "The Vault."** Slow, cold, near-monochrome, very quiet. Blue-white
    task lighting, a lot of empty floor, and enormous inertia — the tape robot arm takes *real
    seconds* to travel and you watch it. The signature threat visual is **The Fade** (see §2.42):
    stored data literally loses pixels over years. Restores are the only fast, warm thing here and
    they're deliberately thrilling because everything else is glacial.
    **Chord:** vault blue-white · tape black · label yellow · rust (bit-rot) · restore gold.
18. **GPU / AI Compute — "The Furnace."** Heat is the primary art direction. The room is dark and
    the light comes *from the load*: idle GPUs are dim violet, saturated GPUs glow orange-white and
    push visible heat shimmer into the aisle. Immersion tanks are a gorgeous liquid shader with
    rising bubbles. You read utilization purely as brightness.
    **Chord:** near-black · violet idle · furnace orange · coolant aqua · white-hot throttle.
19. **HPC / Render Farm — "The Loom."** Jobs are drawn as long horizontal weft threads crossing a
    warp of nodes; a completed frame is a tile that clicks into a growing mosaic image. The whole
    level is watching a picture assemble. Job preemption visibly *unweaves*.
    **Chord:** loom wood · thread white · frame-complete teal · preempt grey · queue ochre.
20. **Crypto Mining Hosting — "The Barn."** Deliberately janky and hilarious: corrugated metal,
    zip-ties, box fans, extension cords, a plywood shelf of ASICs, dust everywhere. Everything is
    visibly *temporary*. Heat haze and a permanent layer of grime. Power theft events are drawn as
    a suspicious cable disappearing through a wall.
    **Chord:** corrugated silver · dust beige · extension-cord orange · coin gold · haze.
21. **Container / K8s Platform — "The Swarm Board."** Pods are little pill-shaped sprites that are
    *constantly being born and killed*; the visual signature is churn as ambient motion. Nodes are
    trays; a deployment rollout is drawn as a color wave washing left-to-right across pods, and a
    rollback is the wave visibly reversing.
    **Chord:** helm blue · pod teal · rollout wave green · evicted grey · crash-loop red flicker.
22. **Serverless / FaaS — "The Popcorn Pan."** Functions don't exist until invoked, then pop into
    being for a fraction of a second and vanish. A cold start is a visibly *slower, duller* pop with
    a little puff of frost. The level's rhythm is entirely popping.
    **Chord:** pan black · pop yellow · frost blue (cold start) · concurrency lime · timeout red.
23. **Database-as-a-Service — "The Cellar."** Heavy, stacked, liquid metaphors: databases are casks
    and drums; replication lag is drawn as a visible *level difference* between two casks; a long
    transaction is a clamp on the tap. WAL is a literal scroll spooling onto the floor.
    **Chord:** cask oak · brass fitting · liquid indigo · lag amber · lock red.
24. **Bulletproof / Anything-Goes — "The Backroom."** Heavily desaturated, red practical lighting,
    unbranded gear, no windows. Customer nameplates are **redacted with black censor bars** you
    can't peel off. Money comes in gorgeous stacks and the sky above your building (§3.28, the
    reputation weather) is permanently the color of a nosebleed. A visual bargain the player feels.
    **Chord:** black · safe-light red · bleached grey · cash green · censor-bar matte.
25. **Regulated (HIPAA / PCI / FedRAMP) — "The Clean Room."** Everything gains a **compliance chip**:
    a small violet tag on every object that is either sealed (✔), pending (…), or broken (✖). There's
    an **Audit Overlay** camera mode where the whole world renders as a documentation diagram with
    evidence callouts. Uncontrolled objects are literally drawn as *dirty* — smudged, fingerprinted.
    **Chord:** clinical white · violet seal · evidence-tag blue · smudge grey · fail crimson.
26. **Financial Exchange Colo — "The Meter Stick."** The art is dominated by **cable length equality**.
    Every tenant's fiber run to the matching engine is drawn to scale and coiled so all runs are
    identical; the level's central tension is visible as a room where all cables are the same length
    on purpose, and any cable you shorten glows as a fairness violation. Microseconds are drawn as
    physical distance.
    **Chord:** trading-floor teal · fiber aqua · brass meter · latency scarlet · equality white.
27. **Dial-up ISP (1996) — "The Switchroom."** Period kit: CGA-ish dithered palette, phosphor bloom,
    beige everything, a wall of modem banks whose LEDs chatter in handshake rhythm. Visitors are
    *individual people* dialing in, drawn as a little handset icon riding a copper line. Busy signal
    is a real, visible failure state — a red bar across a modem bank.
    **Chord:** beige · phosphor green · CGA cyan · warning magenta · dial-tone grey.
28. **BBS / Shell Accounts — "The Terminal."** The entire game renders inside a text-mode frame:
    box-drawing characters, 80×25 grid, a blinking block cursor. Threats are ASCII. This is a full
    diegetic-UI level and should be an unlockable *style*, not just one stage (see §9.6).
29. **Usenet / Web Rings — "The Paper Mill."** Enormous, ever-growing paper stacks; the visual joke
    is that storage grows faster than you can build for it and the room slowly fills with newsprint
    until you can't see the floor.
30. **Satellite Ground Station — "The Dish Field."** Outdoor level. Big sky, weather, a field of
    dishes that physically slew to track passes. The signature visual is the **pass window**: a
    lighted arc across the sky HUD that opens and closes, and everything you need to do must happen
    inside the lit arc. Rain fade is drawn as the arc going grainy.
    **Chord:** sky gradient · dish white · horizon amber · fade static · lock-on green.
31. **Edge / 5G MEC — "The Street Cabinet."** Tiny footprints scattered across a city map: kerbside
    cabinets, rooftop shelters, a base of a tower. Visually about *many tiny sites*, each with 2-4U
    of gear and a padlock that people keep cutting.
32. **IoT Backend — "The Hive Hum."** Millions of tiny, extremely low-value visitors: a constant
    grain of dust motes rather than individual sprites. The art problem — and the level's mechanic —
    is that you can only ever see aggregate texture, never an individual device.
33. **Blockchain Node Hosting — "The Clock Tower."** Everything paced to block time; a giant visible
    clock/heartbeat drives the level and falling out of sync is drawn as your tower's hands drifting
    away from the reference clock overhead.

### 1.3 Era treatments (an orthogonal axis to hosting type)

34. **The Era Shader Stack.** Era is a full-screen post chain plus a UI skin swap, applied on top of
    whatever hosting-type kit is active. Five presets:
    **1994 Phosphor** (scanlines, bloom, 16-color dithered, chunky bitmap type) ·
    **2001 Beige & Bevel** (Win95/98 chrome, gray 3D bevels, Tahoma, dithered gradients) ·
    **2008 Gloss** (glassy buttons, reflections, drop shadows, Lucida) ·
    **2016 Flat** (pure flat vector, generous whitespace, geometric sans) ·
    **2030 Volumetric** (dark-mode, translucent panels, subtle depth blur, variable-weight type).
    **Hooks into:** campaign framing — a level set in 1996 is *visibly* 1996 before a word of text.
35. **The Time-Lapse Wipe.** Level transitions that jump eras play a 3-second continuous shot of the
    same room aging: gear swaps out, cable colors change, the CRT on the desk becomes an LCD becomes
    three LCDs, coffee cups accumulate, the wall gets repainted. Best single storytelling device in
    the whole game and it costs one animated set piece per era boundary.
36. **Era-Correct Failure Aesthetics.** A 1996 crash is a blue screen with a beep; a 2008 crash is a
    glossy modal with a red X; a 2030 crash is a silent panel that just goes translucent and stops
    updating. Same mechanic, three different feelings of dread.
37. **The Anachronism Flag.** If the player somehow keeps a piece of gear across an era boundary, it
    renders in its *original* era's art style — a beige box sitting in a modern black room, visibly
    from the past. Free comedy, free legacy-debt storytelling.

### 1.4 Scenario visual framing

38. **The Deal Sheet (level intro card).** Every level opens with a physical artifact, not a text
    box: a faxed RFP, a scribbled napkin diagram, a colo quote with handwriting on it, a pager
    message, a Slack screenshot printed out. It states the goal *in the fiction's own voice* and its
    art tells you the era and hosting type before you read it.
39. **The Blueprint Wipe.** Level start draws the facility in as a cyanotype blueprint — lines
    sketching in over 1.5s — then the blueprint "develops" into the full-color world. Also reused as
    the pause/plan mode look (§7.14), so the player immediately reads "this is the planning state."
40. **Survive the Launch Spike — "The Wave Wall."** A visible wall of visitor light approaching from
    the map edge, with a height that tells you the magnitude. You can see it coming for 20 seconds.
    The win image is the wall *passing through* your infrastructure and coming out the other side
    still cyan (served) rather than greying out (bounced).
41. **Migrate Without Downtime — "The Ghost Twin."** The destination environment is rendered as a
    translucent white ghost overlaid in a second area. As you cut over, color drains from the old and
    fills the new, service by service. A mistimed cutover shows a service that is *half-colored in
    both places* — instantly legible as split-brain.
42. **Recover From a Breach — "Forensic Mode."** The whole world renders desaturated and lit by
    flashlight. Compromised objects glow with a **red taint trail** that shows the attacker's path
    backward in time; you scrub a timeline to watch the taint spread and find patient zero. The
    level's art direction is "crime scene," complete with evidence tags on quarantined gear.
43. **Pass the Audit — "The Clipboard."** An auditor NPC physically walks your floor on a visible
    path. Anything in their cone of attention gets a spotlight and a violet magnifier; you have a
    finite time to fix what they're about to look at. Enormously legible tension from one walking
    sprite and a flashlight cone.
44. **Absorb the Acquisition — "The Junk Drawer."** You inherit a pile of mismatched, dented gear
    with stickers from dead brands, un-labeled cables, and racks wired by somebody who hated you.
    Art direction: every inherited object is drawn in a *slightly wrong* palette so it reads as
    foreign. The cleanup is visually satisfying because you can literally see the palette normalize.
45. **The Hurricane Level — "The Front."** A weather band sweeps across the region map with a visible
    leading edge and an ETA. Utility power flickers ahead of it, then goes, then the generator smoke
    plume is the only thing moving on your campus. Fuel level becomes the whole HUD.
46. **The Peak Day — "Black Friday / Patch Tuesday / Launch Night."** A level whose visual identity
    is a countdown clock rendered *in the world* (a big scoreboard hung over the NOC) plus a
    pre-announced traffic curve drawn as a ghost graph you're racing against in real time.
47. **The Cage Tour — "White Glove."** A colo scenario where a prospective tenant NPC walks your
    facility with you and the camera follows them at eye height, not isometric. Everything ugly you
    left lying around is suddenly on camera. Art direction: switch from god-view to a handheld
    walkthrough for 90 seconds.
48. **The Decom — "Lights Out."** A melancholy end-of-era level: you shut a facility down. Racks go
    dark row by row, cables get cut and coiled, the floor tiles come up, and the last shot is an
    empty white room. Visual payoff for the Growth Scar (§1.4).
49. **Difficulty Expressed as Chrome.** Higher difficulty adds *instrumentation*, not just numbers:
    the HUD bezel gains more gauges, more warning lamps, more tiny readouts. A veteran level should
    look like an aircraft cockpit next to the tutorial's single dial.
50. **The Nines Ceiling.** Every level displays its uptime target as a physical notch on the wall
    (like a height chart). Your current rolling uptime is a rising/falling water line against it.
    It's always in the background and always readable at a glance.

---

## 2. Threats — What Each One Looks Like Coming At You

### 2.0 The threat design language

51. **The Silhouette Rule.** Every threat must be identifiable **as a black silhouette at 24×24px**.
    Test every threat asset by rendering it solid black at 24px on white; if you can't name it,
    redesign it. This is the single hard constraint that keeps the endgame readable.
52. **The Wind-Up Frame.** Every threat that does damage has a 3-frame telegraph: gather (it shrinks
    and darkens) → strike (it stretches toward the target) → recover. Damage never happens without a
    visible wind-up, which is what makes reactive play fair.
53. **Approach Lanes.** Threats travel along **hot lanes** — magenta channels drawn on the Signal
    layer from the map edge to your surface. Lane *thickness* = volume, lane *saturation* = severity,
    lane *texture* (dotted / solid / braided) = type. At Tier 4-5 you often only see lanes, never
    individual threats, and that's still enough to play.
54. **The Threat Mass Bar.** In the top chrome, a horizontal bar shows aggregate inbound bad traffic
    split by type as stacked colored segments. It's the one place where a 40 Gbps flood and a single
    SQL injection can be compared, and it's the "is this bad?" glance target.
55. **Damage States, Three Stages.** Everything you own has a clean / scuffed / broken art state, plus
    a fourth "smoking" state for catastrophic. You should be able to walk a row and read its history.
56. **The Bestiary Card.** Every threat you encounter gets a collectible card with hand-drawn
    "field guide" art, its silhouette, its lane texture, its counters, and a scribbled note from your
    staff. This is both the tutorialization and a cosmetic collection (§9.14).

### 2.1 Volumetric / network attacks

57. **Scanner Gnats (port scanning).** Tiny 2px specks that drift along your edge in a slow left-right
    sweep, pinging each port. Harmless alone, but they *mark* discovered services with a small red
    pin that other threats home in on. Visual: a cloud of dust that leaves pins behind.
58. **The Murmuration (botnet DDoS).** Thousands of individual dots that move as one flocking shape,
    like starlings. Its silhouette changes as it reorganizes — a rope, a fist, a fan. Terrifying
    because it's *beautiful* and enormous, and because you can watch it choose a target by the flock
    leaning. **Counter visual:** your scrubbing center is a comb the flock has to pass through, and
    you can watch it thin out.
59. **SYN Flood — "The Half-Handshake Pile."** Drawn as a stream of *half-drawn handshake glyphs*
    (one hand, no partner) that stack up in a visible pile on your listener. When the pile reaches
    the top of the server's faceplate, the server stops accepting. SYN cookies are visually a little
    stamp that lets the half-handshakes pass through without stacking.
60. **UDP Reflection — "The Echo Horn."** A gramophone-horn sprite off-map that fires at a *third
    party* which then bounces amplified traffic at you. The visual point is that the attacker sprite
    is never on the attack lane — the lane comes from somewhere innocent, which teaches the concept.
61. **DNS Amplification — "The Shout Back."** Tiny query going out, enormous fat answer coming back.
    Drawn literally with a size mismatch: a 4px mote out, a 40px slab returning. Unmistakable.
62. **NTP / memcached Reflection — "The Loudhailers."** Same family, different silhouettes (a clock
    face, a dial pad) so an experienced player can read the amplifier type from lane texture alone.
63. **Slowloris — "The Molasses Sloth."** A slow, heavy sprite that grabs a connection slot and just…
    hangs there. Visually it *occupies* a socket and refuses to let go; you see your available socket
    pips being held by sloth hands. Countered by a connection-reaper broom sprite.
64. **Layer-7 Refresh Rats.** A skittering pack of small rodent sprites that each hit an expensive
    endpoint (search, cart, login). Cheap-looking individually, murderous in numbers. They visibly
    prefer whichever endpoint is most expensive, which teaches endpoint cost.
65. **The Booter Cannon (game hosting).** A cartoonish artillery piece on the map edge that
    *visibly aims at a specific player's lobby* before firing — so you know which customer is about
    to eat it and can shield them. The most satisfying "block it in time" moment in the game.
66. **BGP Hijack — "The Rerouting Hand."** A giant ghostly hand reaches onto the map and physically
    drags your route ribbon to a different destination. Enormous, slow, terrifying, and completely
    self-explanatory without a word of text.
67. **Route Leak — "The Spill."** Your announcement bleeds outward across the globe view like ink in
    water, reaching places it should never reach, and traffic starts arriving from absurd directions.
68. **Cable Cut — "The Backhoe."** An off-map backhoe sprite with a comedy bucket. You never see it
    coming; a fiber ribbon on the region map just goes *snap* with a whip animation and the recoil
    is visible for a few seconds. Redundant paths light up automatically if you built them.
69. **Upstream Carrier Outage — "The Grey Ribbon."** Your transit ribbon loses saturation from the
    far end inward, like a fuse burning toward you. A visible countdown of "how much of my capacity
    is left" without a single number.
70. **The Transit Congestion Notch.** Peering trouble shows as a ribbon with a visible pinch/waist
    in it; packets bunch up before the waist. Player learns "add an IX peer" from the picture.

### 2.2 Application / data attacks

71. **The Ink Worm (SQL injection).** A worm that only ever appears **on the cable between web and
    DB** — you add a DB, you get worms. It crawls along the wire leaving black ink; if it reaches the
    DB it starts pulling out *readable-looking data cards* and carrying them off-map. Countered by a
    WAF sieve on the wire (a visible mesh the worm splatters against) or parameterized-query armor
    (the cable gains a braided sheath).
72. **The Mirror Moth (XSS).** A moth that lands on a page, lays a *reflected copy of your own UI*,
    and then visitors that touch the copy turn magenta and become threats. The visual horror of
    **your own visitors converting into attackers** is the whole lesson.
73. **Keyring Hail (credential stuffing).** Thousands of tiny key sprites rain onto your login door.
    Most shatter. The ones that fit turn the door handle green for a beat — a pin-drop moment. Rate
    limiting is drawn as an awning over the door that most keys bounce off.
74. **The Padlock Bloom (ransomware).** A crystalline growth that spreads across a file volume,
    turning healthy data tiles into faceted padlock crystals cell-by-cell. Watching the bloom crawl
    toward the tile that holds your backups is the best tension in the game. Immutable/air-gapped
    backups are drawn as tiles behind a physical shutter the bloom can't cross.
75. **The Tick (cryptojacking).** A small parasite that attaches to a CPU and swells. You spot it not
    by the sprite (it's hidden behind the chassis) but by the *heat plume and the fan blur rate* —
    visual detection of an invisible threat via a secondary signal.
76. **The Tainted Crate (supply chain).** A delivery crate on the loading dock that looks identical
    to a good one except for one wrong stencil character. If you install it, it quietly spawns a
    backdoor sprite three minutes later. Countered by the inspection bench animation (a tech prying
    the lid and shining a light in).
77. **The Blank Card (zero-day).** A threat with **no icon at all** — a silhouette-shaped hole in
    the world, like a sticker peeled off. You can see something is there but not what. Your IDS
    radar draws a dotted guess-outline around it. Terrific, cheap, memorable art trick.
78. **The Quiet Ones (nation-state).** Nearly transparent. They don't damage anything; they *sit* on
    your network and slowly copy data out at 1 card per minute. You only ever see them as a **shadow
    on the floor** with no object above it — a visual impossibility that reads as "something is here
    that you can't see."
79. **The Friendly Face (social engineering).** A visitor sprite in a *staff-colored* uniform that
    walks past your badge reader behind a real employee. Same silhouette as your own people; the
    only tell is the badge chip is the wrong shade of green. Trains the player's eye to check
    details, and reuses your own art as a threat.
80. **The Insider — "The Flickering Badge."** A staff NPC you already own whose badge indicator
    starts flickering between your green and threat magenta. Gut-punch reveal; the art does all the
    narrative work.
81. **The Competitor Saboteur.** Palette-swapped versions of your own threat set in the *competitor's*
    brand color, so you can tell "this is targeted, not ambient." Their attacks are always aimed at
    whatever customer you most recently won.
82. **Cache Poisoning — "Bad Milk."** A single cache cell turns a sour yellow-green, and every visitor
    served from it comes out tinted the same sour color and immediately bounces. Spreads to
    downstream caches. Purging is drawn as a bleach wave washing across the comb.
83. **Session Hijack — "The Coat Thief."** A threat that steals a visitor's *coat* (their session
    ribbon), puts it on, and walks in wearing it. Your visitor, now coatless, bounces confused.
84. **API Abuse — "The Vending Machine Shaker."** A sprite that grabs your API endpoint and rattles
    it for freebies. Rate limits drawn as a turnstile with a visible counter.
85. **Scraper Locusts.** They don't break anything; they *eat your bandwidth and your content*. You
    see them strip color off your pages leaf-by-leaf and the pages regrow slowly. Purely economic
    damage, visually expressed as defoliation.

### 2.3 Abuse, legal, and reputational threats

86. **The Envelope Rain (DMCA).** Legal envelopes fall from the top of the screen onto specific
    customer objects. Each one sticks and adds weight; too many and the customer object *sinks*
    (suspended). Your abuse desk staff sprite picks them up one at a time — a visible queue.
87. **The Stamp of Spamhaus.** A giant rubber stamp descends from off-screen onto your outbound mail
    flow with a satisfying/horrifying THUNK and leaves a red block mark across the lane. Undoing it
    is a slow scrub animation with a brush.
88. **The Evidence Tag (law enforcement seizure).** A yellow-and-black tag zip-tied onto a rack, and
    the rack becomes untouchable — greyed, with a drawn police-line hatch across it. In bulletproof
    levels these accumulate as a visible cost of doing business.
89. **The Gavel (license audit).** A slow, unstoppable walker that examines each software aura and
    stamps any unlicensed one with a violet fine glyph. Cannot be attacked, only prepared for.
90. **The Clipboard (regulator).** See §1.43 — a walker with a spotlight cone. Deliberately shares a
    silhouette family with The Gavel and the auditor, so "authority figures" read as one visual class.
91. **The Ticket Hydra (angry customers).** A stack of support tickets that grows a new head every
    time one is answered badly. Visually the stack gets *taller and more crooked*; when it topples,
    you get a churn event. Good support staff cut heads off cleanly; bad ones split them.
92. **The Twitter Storm — "The Flock of Blue Birds."** Reputation attack rendered as a swarm over
    your building that darkens the sky (§3.28) and reduces visitor inflow until it disperses. You
    can't shoot it; you can only respond with a status-page beacon that calms it.
93. **The Chargeback Crow.** A bird that lands on a paid invoice, pecks the gold off it, and flies
    away. Fraud screening is drawn as a scarecrow.
94. **The Review Bomb.** Your star rating object (physically hanging over the front door) loses
    points with a visible *snap* of a star falling off and shattering.

### 2.4 Hardware, power, cooling, physical

95. **Click Death (failing drive).** A drive bay whose LED goes from green to a stuttering amber, and
    a tiny **audio-visual click ripple** emanates from it every second or so. At Tier 2+ it's a single
    amber pixel that pulses at the same rhythm — the rhythm is the identifier, not the shape.
96. **The SMART Ghost.** Predictive failure shows as a translucent duplicate of the drive slowly
    separating from the real one. "This drive is leaving." Gorgeous, immediately understood.
97. **The Pop (PSU failure).** One frame of white flash, a puff of magic smoke, and the unit's second
    PSU LED goes solo. If there was no second PSU, the whole unit goes dark. The single best argument
    for redundancy the game can make, and it takes 6 frames.
98. **The Wobble (fan failure).** Fan blur rate drops and the sprite acquires a tiny 1px vertical
    jitter, plus a heat plume starts rising. You detect it peripherally from motion, not from an
    alert — which is exactly right.
99. **Static Fleck (bad RAM).** Random 1px noise pixels appear in that server's rendered output and
    in anything it serves. Visitors served by it come out with the same noise on them. Corruption
    made literal.
100. **The Dust Mote (dirty optic / bad SFP).** A speck that sits in a port. That link's packet beads
     become intermittent — every few beads just don't appear. Cleaning is a cotton-swab animation.
101. **The Knot (bad cable / crosstalk).** A cable with a visible kink; beads slow down as they pass
     through it. Re-terminating is a satisfying cut-crimp-test animation with a tester that goes green.
102. **The Rat's Nest (cable debt).** Not an event — a *condition*. Sloppy building accumulates
     visible cable spaghetti in the back of the rack, and every repair in that rack takes longer
     (the tech visibly fumbles). Cable management upgrades literally comb it straight, which is one
     of the most satisfying visual rewards available.
103. **The Brownout Dim.** Global lighting desaturates and drops 20%; every LED dims slightly. A
     level-wide mood change with zero UI. If you have a UPS, the room *stays lit* and only the UPS
     bar starts draining — which makes the UPS feel amazing.
104. **The UPS Drain.** A vertical battery ziggurat that visibly empties cell by cell, with a runtime
     readout in minutes. The clock everyone watches.
105. **The Generator Cough.** Generator start is a 3-second animation: crank, cough, black smoke
     puff, then a steady exhaust plume and the room lights coming back warm. A failed start is the
     cough with **no plume** — and total silence.
106. **The Flicker (ATS transfer).** Every light in the facility blinks once, hard. If anything was
     single-corded, it dies right then. One frame that teaches dual-power forever.
107. **Fuel Gauge as Set Dressing.** The diesel tank has a physical float gauge on its side that you
     can see from the campus view. Fuel truck arrival is a whole vehicle animation with a hose.
108. **Heat Bloom.** Thermal problems render as a false-color bloom on the Signal layer that creeps
     out from the source. At Tier 3 the floor plan becomes a thermal map. Hot aisle containment is
     drawn as glass panels that *visibly hold the bloom in*.
109. **The Mirage (hot aisle shimmer).** Ambient heat distortion shader in hot aisles. Beautiful, and
     it doubles as a passive readout: the more shimmer, the closer to trouble.
110. **CRAC Hiccup.** The unit's fan stutters and its cold-air plume gutters like a candle. The cold
     aisle's blue tint starts receding toward the unit.
111. **Puddle Creep (water leak).** A slow-spreading reflective puddle on the floor tiles. It's
     *beautiful* — it reflects the rack LEDs — and it's death if it reaches a power whip. Leak
     detection rope is a visible bright cord along the floor that flashes where it's wet.
112. **The Ember (fire precursor).** VESDA detection is drawn as tiny sniffer motes circulating the
     room; when they find something, they converge and glow. You get a 20-second warning window drawn
     as a tightening circle.
113. **The White Out (gas suppression).** Clean-agent discharge fills the room with white in 1.5
     seconds and everything in it is silhouettes. Then a slow settle. Enormously dramatic, once per
     campaign if you do it right, and a total-loss-avoided moment you'll remember.
114. **The Tremor (seismic).** Screen shake with rack-top objects tipping; unanchored racks visibly
     walk across the floor. Seismic bracing is a visible cross-brace that stops it.
115. **The Grime Layer (contamination).** In dirty facilities, a slowly accumulating dust overlay on
     all gear that increases failure rates and, crucially, **makes everything harder to read** —
     the art itself degrades, which is a brilliantly direct expression of the mechanic.
116. **The Arm Jam (tape library).** The robot arm sticks mid-travel with a cartridge in its grip.
     Everything queued behind it stacks visibly. A tech has to walk in and open the library door.
117. **The Fade (bit rot).** Archived data tiles **lose actual pixels** over in-game years, dithering
     away to nothing. Scrubbing/verify passes are a scan line that restores pixels. The clearest
     visual metaphor in the whole design and it's basically free.
118. **The Sag (GPU thermal throttle).** The GPU's orange glow dims and its output beam visibly
     droops/shortens. Performance loss drawn as a physical sagging.
119. **The Elbow (noisy neighbor).** On a shared box, one tenant's window swells and *physically
     shoves* the neighboring windows smaller. cgroups/limits are drawn as visible partitions.
120. **The Stale Seal (cert expiry).** Every TLS-terminating object wears a wax seal. It develops
     visible cracks at 30 days, crumbles at 7, and falls off at 0 — at which point visitors approaching
     it stop, see a big scary interstitial, and bounce en masse. Renewal is a satisfying re-stamp.
121. **The Tumbleweed (domain expiry).** Nothing dramatic: the object just gets a tumbleweed rolling
     past and all its traffic stops arriving. Silent comedy horror.
122. **The Wrong Commit (bad deploy).** Deploys are drawn as colored crates carried to nodes. A bad
     deploy is a crate whose color doesn't match the others; as it rolls out, the wave of wrong color
     spreads and error particles start fountaining from each converted node. Rollback is the wave
     visibly reversing, which is deeply satisfying.
123. **The Config Drift Freckle.** Nodes that have drifted from the golden image develop small
     off-palette speckles. A fleet with drift looks measurably *mangier*.
124. **The Split Brain.** Two cluster halves each draw a full-strength "I am primary" crown. Two
     crowns on screen = the one visual the player learns to fear instantly.
125. **The Thundering Herd.** After an outage, all the queued visitors arrive **at once** as a
     compressed slug of light that's visibly denser than a normal wave. Watching your own recovery
     kill you again is a great teaching image.
126. **Glitch Player (game cheater).** A player pawn whose sprite animates on the *wrong frames* —
     it teleports a few pixels, clips through a wall, moves at the wrong cadence. Everyone can spot
     it; other player pawns visibly turn to look at it and then start leaving the lobby.
127. **The Stretch (latency creep).** Visitor sprites elongate as their round-trip grows, like a
     smear. A fully stretched visitor snaps and becomes a bounce. Latency readable without numbers.

---

## 3. Visitors, Traffic, and Clients — Drawing the Thing You Want

### 3.0 The visitor design language

128. **Visitors Are Light; Threats Are Mass.** Hard rule. Everything good that approaches you is
     luminous, cool-colored, weightless, and moves in smooth arcs. Everything bad is opaque, warm,
     heavy, and moves in straight lines or jitters. A player should be able to mute the color channel
     entirely and still tell them apart by *motion quality*.
129. **The Patience Meter Is Saturation.** A visitor starts fully saturated cyan. Every second of
     delay, queueing, or error drains saturation toward grey. At full grey they bounce. No bars, no
     numbers — the crowd's overall color tells you your service quality at a glance, and a greying
     crowd is an alarm you feel before you read.
130. **The Trail = Latency.** Each visitor drags a motion trail whose *length* equals its
     accumulated round-trip. A healthy platform looks like short sharp sparks; a struggling one looks
     like long smeared comets. Zoomed out, the whole traffic field's "smear" is your latency graph.
131. **The Bounce.** A universal 6-frame animation: the mote goes grey, stops dead, rotates 180°,
     accelerates away, and pops into three fragments at the map edge with a small negative-gold
     puff. You *see* money leaving. Identical everywhere, so it's instantly recognized in any level.
132. **The Convert.** A visitor that reaches a healthy service and is served flashes white for one
     frame, drops a gold coin/spark into the revenue gutter, and exits *forward* through the building
     rather than turning back. Forward exit = good; backward exit = bad. Direction alone encodes it.
133. **The Happiness Halo.** Served visitors leave with a small ring. Rings accumulate on the service
     that served them as a faint glow — your "well-loved services" are visibly brighter over time,
     which makes reputation spatial.
134. **The Path Preview Ribbon.** Hold a key and the game draws the route a visitor *would* take
     through your infrastructure right now, as a glowing dotted ribbon with per-hop time chips. It's
     a traceroute you can see. Dead ends glow red at the break point.

### 3.1 Visitor forms per hosting type

135. **Page Loads — "Sparks."** Tiny fast cyan darts, high count, low individual value. They arrive
     in bursty clumps. Great for making a shared-hosting level feel like rain on a window.
136. **API Calls — "Needles."** Thin, straight, extremely fast, arriving in metronomic streams
     rather than clumps. A well-behaved API client looks like a sewing machine; a runaway one looks
     like a firehose and you can tell the difference instantly.
137. **Game Players — "Pawns."** Named, persistent, chunky sprites with a little nameplate and a
     ping chip. They *sit down* in a lobby and stay. Unlike sparks, losing one is personal — you see
     the pawn stand up, shake its head, and walk out, and the other pawns react.
138. **Streaming Viewers — "Beams."** A viewer is not an event, it's a *sustained connection*: a
     continuous beam from them to your edge that must not break. Buffering is drawn as the beam
     going dotted; a rebuffer is a visible stutter in the beam and the viewer's icon spinning.
139. **SIP Calls — "Ribbons."** A two-way ribbon that must stay unbroken and smooth. Jitter = a
     visible sawtooth edge on the ribbon. Packet loss = holes you can see through. The most
     *physically legible* quality metric in the game.
140. **Backup Jobs — "Freight."** Big slow crates on a conveyor. They have a size, a window (a lit
     time band on the HUD), and they must all fit in the window. Watching a crate still on the belt
     as the window closes is pure dread. Success is the crate dropping into the vault with a clunk.
141. **Restore Requests — "The Ambulance."** Rare, urgent, and visually loud: a single crate with a
     flashing light, coming *out* of the vault. Everything else in the level yields to it. The whole
     archival level exists to make this one animation feel earned.
142. **Inference Requests — "Prisms."** They enter clear, pass through a GPU, and leave *refracted
     into color*. The GPU visibly does work on them (the prism spins, the beam splits). Batch
     inference is drawn as prisms being gathered into a rack and processed as a group, which makes
     batching legible as a visual efficiency.
143. **Training Jobs — "The Long Haul."** Not a visitor so much as an occupation: a giant slab that
     parks on your GPU cluster for a long time, consuming everything, with a visible progress band.
     Preemption drops the slab and it *cracks*.
144. **DNS Queries — "Ping Motes."** Sub-second life span; they arrive, a node blinks, they're gone.
     The whole level is a shimmer of them. Individual motes are never important; the shimmer's
     *evenness* is what you watch.
145. **Email — "Letters."** They fly in, get sorted, and land in bins. Spam is grey pulp; legitimate
     mail is crisp white. Your sorting hall's ratio of white to grey is your reputation, visible
     from across the room.
146. **Object PUTs/GETs — "Pebbles."** PUTs fall in, GETs pop out. The comb (§1.16) is the level.
147. **Dial-up Users — "Handsets."** In the 1996 level, a visitor is an individual person: a handset
     icon with a little person, riding a copper line into a modem bank port. If all ports are full,
     they get a red busy-signal glyph and hang up. One customer, one port, one line — the most
     concrete visitor in the game.
148. **Shell Users — "Cursors."** A BBS/shell visitor is a blinking cursor that occupies a pty slot
     and *types*. You can see what the load is by how many cursors are blinking at once.
149. **Seedbox / Storage Users — "The Hoarders."** Visitors that arrive once and then just *grow* —
     a slowly inflating blob attached to your storage. Not traffic, occupancy. Visually teaches the
     difference between bandwidth customers and capacity customers.
150. **Colo Tenant — "The Suit."** Not a mote at all: a walking NPC in a suit, with a briefcase, who
     arrives by *car* at your loading dock, is escorted through a mantrap, tours the floor, and either
     signs (a contract card animation, a handshake, a confetti-free but weighty stamp) or leaves. One
     tenant is worth ten thousand sparks and the art must make that *feel* true — slow, deliberate,
     high-ceremony.
151. **The Tenant's Own Traffic.** Once signed, a colo tenant's traffic is drawn as an **opaque
     bundle** — you see volume and direction but not content, reinforcing that you don't control it.
152. **IoT Devices — "Grain."** Rendered only as a granular texture with a density. Individual
     devices are never drawn above Tier 1. A fleet going haywire is visible as the grain becoming
     *coarser* and taking on a magenta cast.
153. **Crawlers & Good Bots — "The Surveyors."** Same silhouette family as scrapers but in a neutral
     tan, carrying a clipboard. Teaches the "some bots are good" nuance by making the player squint at
     something that looks *almost* like a threat.
154. **The Lookalike Test.** Deliberately, some visitors and some threats share silhouettes and
     differ only in a small tell (badge color, shimmer direction, gait). This is a designed
     perception skill: veteran players read the tell, new players use tooling (your IDS draws an
     outline around confirmed-bad). The player's *eye* upgrades alongside their tech tree.

### 3.2 Attracting and keeping them, visually

155. **The Front Door.** Every level has a literal front door / storefront object where new customers
     arrive. Its condition is your sales funnel: a bright, clean, well-lit door with a good sign pulls
     more; a dark door with a cracked sign pulls fewer.
156. **The Sign / Marquee.** Your company sign is a real object you customize (font, glow, logo). It
     also serves as the visible unlock indicator for new business lines — take on game hosting and a
     new neon sub-sign bolts on with an animation. Your building's signage *is* your product line-up.
157. **The Billboard.** Marketing spend is an object: a billboard at the edge of the map. Bigger
     spend = bigger, better-lit billboard, and the visitor inflow lane visibly widens from its base.
     Cut the spend and the billboard fades and peels in real time.
158. **The Banner Ad Kite.** Cheap/spammy marketing is drawn as a tacky animated banner kite that
     brings a *wider but greyer* stream of visitors — high volume, low patience, high bounce. You can
     see the quality of your acquisition channel in the color of the crowd it brings.
159. **The Front-Page Geyser.** A viral hit (HN/Reddit/tournament) is a vertical geyser of visitors
     erupting from a single point on the map with a visible height curve that decays over minutes.
     You can see the peak coming down before the numbers say so.
160. **Word of Mouth — "The Dandelion."** Every extremely happy visitor has a chance to puff into
     seeds that drift off-map and return later as new visitors. Referral programs make the puffs
     bigger and more frequent. Retention's payoff is visible as *drifting seeds*.
161. **The Review Wall.** Near the front door, a wall of small star cards that flip in as reviews
     land — gold for five stars, ash grey for one. It's a physical readout of sentiment you walk past.
162. **The Status Page Beacon.** A lamp on the front of your building. Green (all good), amber
     (degraded, with a scrolling note), red (down). Lighting it honestly during an incident visibly
     *calms* the Twitter flock (§2.92) and slows churn — transparency drawn as a light that soothes.
163. **The Waiting Room.** Queued visitors accumulate in a visible antechamber with chairs. Comfortable
     queueing (a good queue/backpressure design) means they sit and read a magazine; bad queueing means
     they stand, pace, and leave. You can literally see your p99 as body language.
164. **The Turnstile.** Rate limits and admission control are turnstiles at the door with a visible
     counter. Watching a turnstile keep the good crowd flowing while a herd backs up behind it is the
     clearest possible picture of load shedding.
165. **The Concierge (support).** Support staff sprites physically intercept unhappy visitors before
     they reach the exit, walk them back in, and restore some saturation. You can watch a great
     support rep *save* a customer in real time.
166. **The Onboarding Ramp.** New customers arrive as a pale outline and fill in with color over
     their first days as they deploy. A customer who never fills in is one who never onboarded, and
     you can see that churn coming a week away.
167. **The Contract Card.** Every paying client is a physical card in a card file on the HUD's right
     edge. The card shows their logo (auto-generated, §8.44), their MRR, their SLA tier as a colored
     stripe, and their health as an edge glow. Churn = the card curling and burning at one corner.
     Renewal = the card getting a fresh date stamp with a nice thunk.
168. **The Whale.** Large customers are drawn physically bigger — a bigger card, a bigger sprite, a
     footfall that shakes the camera slightly when their tenant NPC walks the floor. Losing one should
     visibly *dent* the card file.
169. **The Logo Wall.** Marquee customers get their logo mounted in your lobby. The lobby wall filling
     up is a long-arc progress display. Losing a logo customer leaves a visible clean rectangle where
     the sign used to be — a brutal, silent, perfect churn signal.
170. **The SLA Credit Coin.** When you miss an SLA, a gold coin flies *out* of your revenue gutter
     and back to the customer's card. Money moving backward is always drawn as reverse motion.
171. **The Churn Ledger Draft.** When a customer leaves, their traffic lane doesn't stop instantly —
     it thins over several seconds like a tap closing. The gradual fade is more legible (and sadder)
     than a hard stop.
172. **Reputation Weather.** Your overall reputation is the **sky above your facility**: clear blue,
     overcast, smog, storm. It is always in frame at Tier 2+, it needs no legend, and it affects the
     *color temperature of the whole scene*, so a bad reputation literally makes your company look worse.
173. **The Sales Pipeline Rail.** Prospects ride a visible rail on the HUD from "lead" to "quote" to
     "signed," each stage a station. You watch deals move. A stalled deal sits at a station and starts
     to dim. It's a Kanban board that lives in the world, not a menu.
174. **The RFP Fax.** Enterprise leads arrive as a fax printing out in real time, line by line, which
     is a fantastic 4-second attention grab and a period-appropriate joke in older eras.
175. **The Tour Camera.** Any prospective large customer triggers the eye-height walkthrough camera
     (§1.47). It's a free, recurring reason to make your facility look good — and it converts
     "aesthetics" into a mechanic.

---

## 4. Buildables — Services & Infrastructure as Objects

### 4.0 The buildable design language

176. **The Faceplate Contract.** Every buildable, at every zoom, presents the same four readable
     zones on its front: **identity strip** (name/label, Dymo-tape aesthetic), **health LED cluster**,
     **capacity bar**, and **port row**. Learn it once, read anything forever. At small zooms the
     zones collapse in a fixed priority: LED > capacity > ports > label.
177. **U-Height Silhouettes.** Physical form factor is meaningful and visible: 1U pizza box, 2U with
     visible drive bays, 4U storage with a full face of caddies, blade chassis with vertical slots,
     a tower on the floor for the early levels. You can estimate a fleet's character from its
     silhouette skyline alone.
178. **LED Grammar.** Fixed, never violated: **slow green breath** = healthy, **fast green** = busy,
     **amber steady** = warning, **amber blink** = predicted failure, **red steady** = fault,
     **red blink** = in-progress failure, **blue** = locate/identify (player-triggered), **off** = no
     power. Color plus *rhythm* gives ~8 states in a 2px dot, which is what makes Tier 3 possible.
179. **The Locate Beacon.** Clicking any object in a list makes its physical blue LED strobe and
     pushes a thin vertical light column above it that's visible from any zoom. Directly lifted from
     real datacenter practice and it's the single best "where the hell is it" UI in the game.
180. **Cable Color Code.** **Amber** = copper ethernet, **aqua** = fiber, **black/red** = power A/B
     feeds, **grey** = out-of-band management, **violet** = crossconnect to a tenant, **white** =
     temporary/"we'll fix it later" (and it *stays* white to shame you). Never used for anything else.
181. **Cable Physics.** Cables sag under their own weight, bundle when parallel, and get visibly
     tensioned when you drag a device. Pulling a device out of a rack with cables still attached
     shows the cables going taut and then a warning. Small, cheap, enormously grounding.
182. **The Exposure Ring.** Every buildable draws a dotted ring on the floor (Signal layer) whose
     radius/thickness = the attack surface it adds. Placing a DB makes a ring; exposing it publicly
     makes the ring thicker and turns it magenta-tinted. **Build more, see more magenta** — the
     core tradeoff of the whole game, rendered as one ring.
183. **The Attack Surface Rose.** In the inspector, each object shows a small radial "petal" diagram —
     one petal per threat class it is vulnerable to, petal length = severity. Stacking a WAF in front
     visibly *clips the petals*. It's a before/after picture of hardening.
184. **The Upkeep Drip.** Every object has a small gold droplet that falls off it at its upkeep
     cadence into the money gutter. A facility full of gear *drips constantly*, so you feel opex as
     ambient motion, not as a line item.
185. **Build Ghost.** Placement preview is a translucent cyan hologram with a footprint shadow,
     power draw and heat output numbers floating beside it, and red hatching where it won't fit or
     would exceed a circuit. Rotate with a key; the ghost's cables preview to the nearest valid ports.
186. **Construction Animation.** Building isn't instant: crate arrives at the dock → forklift/hand
     truck → unbox (packing foam particles) → rails go in → chassis slides in with a clunk → cabling
     → power-on POST (a beep and an LED sweep). Roughly 4-8 seconds of pure gratification, skippable,
     and it makes the build queue a visible conveyor of things being born.
187. **Decommission Animation.** Reverse: unplug, slide out, and the unit goes on a pallet by the
     door. If you never haul the pallet away, it piles up — a visible, comedic e-waste debt.
188. **The Golden Image Tint.** Nodes built from your current standard image share an exact palette;
     any node that drifts or was built ad-hoc renders a half-step off. A homogeneous fleet is
     *visibly* homogeneous, which makes standardization feel good.

### 4.1 Compute & service objects

189. **Web Node.** 1U, blue-green activity LEDs that flicker with request rate. At the app layer it
     projects a small floating "page" glyph you can see being handed to visitors.
190. **Application / Worker Node.** Same chassis, different faceplate badge (a gear). Its queue depth
     is drawn as a stack of little job tokens piled on top of the unit — visible backlog.
191. **Database Node — "The Drum."** Deliberately a different silhouette: a heavy cylindrical drum
     shape or a chassis with a drum badge. It *hums*. Adding one draws a new cable to your web tier
     and immediately spawns the Ink Worm lane (§2.71) — the canonical "capability = surface" trade,
     shown as one new cable and one new magenta lane.
192. **Read Replica.** A translucent copy of the drum with a visible **lag ribbon** connecting it to
     the primary; the ribbon's slack = replication lag. You can see lag as physical slack in a rope.
193. **Cache Node — "The Coil."** A glowing coil that gets brighter as it warms. Cold cache = dark
     coil = long threads back to origin (§1.15). Cache eviction is visible as sparks falling off.
194. **Load Balancer — "The Prism."** A wedge that takes one incoming beam and splits it into N.
     Weighting is the visible angle/brightness of each output. Health checks are little pulses it
     sends down each leg with a returning tick or a cross.
195. **Reverse Proxy — "The Mirror."** A flat mirror panel; visitors hit it and their reflection goes
     onward, so the origin never sees them directly. Shows exactly what a proxy is in one image.
196. **Firewall — "The Portcullis."** A physical gate with bars. Rules are visible slots in the gate;
     a blocked packet splats against it with a small burst. Overly permissive rules are drawn as
     *missing bars*, which makes a bad ruleset visible at a glance.
197. **WAF — "The Sieve."** A fine mesh in front of an app. Things it catches stick to it and
     accumulate as gunk that must be cleaned (tuning), and a clogged sieve slows good traffic — a
     visual model of false positives and overhead.
198. **IDS/IPS — "The Radar Dish."** A rotating dish with a sweep line across the Signal layer. Its
     sweep reveals hidden threats (§2.77/2.78) inside its arc. Upgrading widens the arc and speeds
     the sweep. Watching a sweep pass over a Quiet One and outline it is a great moment.
199. **Rate Limiter — "The Turnstile."** See §3.164.
200. **DDoS Scrubbing Center — "The Comb."** An off-site object on the region map that inbound lanes
     pass through; you literally watch the lane get thinner on the far side, with magenta gunk
     collecting in the comb. Its cost per scrubbed gigabit drips gold the whole time it's engaged.
201. **CDN Edge PoP — "The Star."** Map-layer object; see §1.15.
202. **Anycast Node — "The Tuning Fork."** Identical siblings in many places that all answer to the
     same address; drawn as forks that ring in sympathy when any one is queried.
203. **DNS Resolver / Authoritative — "The Index Card Cabinet."** A card cabinet whose drawers open
     and a card flicks out per query. Zone transfers are a drawer being copied.
204. **Mail Transfer Agent — "The Sorting Table."** Conveyors, bins, franking. Queue depth is a
     visible pile of undelivered mail.
205. **Object Store Node — "The Comb Cell Block."** See §1.16. Erasure coding is drawn as a pebble
     being split into shards that scatter into different combs, with a visible "any 6 of 9 rebuilds
     it" indicator.
206. **Tape Library — "The Vault Wall + Arm."** A wall of cartridge slots and a gantry arm with real
     travel time. The arm's motion is the level's clock.
207. **GPU Node — "The Furnace Rack."** Visible GPU cards with individual glow; NVLink drawn as
     bright internal bridges. Power draw is so high it gets its own visible feeder cable, thicker
     than anything else in the game.
208. **Immersion Tank.** A gorgeous liquid-shader bath with boards suspended in it and slow bubbles.
     Genuinely the most beautiful object in the game; unlocking it should feel like a reward in itself.
209. **Hypervisor Host — "The Tray."** A chassis drawn as a tray with VM tiles you can pick up and
     drag to another tray. Live migration is a tile that ghosts across and solidifies; a failed
     migration drops it with a crack.
210. **Container Node — "The Pegboard."** Pods pin and unpin constantly (§1.21).
211. **Serverless Runtime — "The Pan."** See §1.22.
212. **Message Queue — "The Pipe & Gauge."** A physical pipe with a pressure gauge; backlog is
     pressure. A blocked consumer makes the pipe bulge. Dead-letter queue is a visible overflow bucket.
213. **Search Cluster — "The Card Index Whirl."** Shards drawn as spinning card wheels; a red shard
     is an unassigned one and the wheel visibly has a gap.
214. **Log/Metrics Pipeline — "The Rain Gutter."** All objects shed log droplets into gutters that
     run to a collector. If the collector backs up, the gutters overflow and your floor gets wet —
     a delightful literalization of "logging filled the disk."
215. **Monitoring — "The Watchtower."** A tower object with a light that sweeps your facility; it's
     what *reveals* problem indicators. Without it, failures are drawn but with no alert glyphs, so
     you must notice them yourself. Monitoring literally lights up your world.
216. **Backup Agent — "The Little Robot."** A tiny sprite that visits each object at schedule and
     carries a copy out. If it can't reach one, it stands next to it and shrugs — a visible
     "unbacked-up thing," which is the scariest object in the game once you know what it means.
217. **Config Management — "The Stencil."** Applying it visibly re-stencils drifted nodes back to the
     golden palette (§4.188) in a wave.
218. **Secrets Vault — "The Safe."** A physical safe object; services that use it draw a short chain
     to it. Hardcoded credentials are drawn as a key taped to the front of a server, visible to
     anyone — and to the Friendly Face.
219. **Bastion / Jump Host — "The Gatehouse."** The only door into your management network; management
     cables all route through it visibly. Its exposure ring is huge and permanently magenta-edged.
220. **Out-of-Band / IPMI — "The Grey Shadow Network."** A whole parallel cable plant in grey that
     you can toggle on as an overlay. Its existence lets techs fix things without walking; its
     exposure is that it's a second front door.

### 4.2 Network

221. **Top-of-Rack Switch — "The Comb."** Always at the top of the rack, always with a row of port
     LEDs that are the rack's most-watched pixel row. Oversubscription is drawn as its uplink being
     visibly thinner than the sum of its downlinks.
222. **Aggregation / Core Switch — "The Junction."** Bigger, chassis-based, with visible line cards
     you add one at a time. Each new card is a physical growth step you can see.
223. **Router — "The Roundabout."** A circular object where route ribbons enter and leave; routing
     table size is drawn as the number of visible lane markings.
224. **BGP Edge — "The Lighthouse."** Announces your presence; its beam sweeps out to the region map.
     Sessions are visible ropes to peers that can go slack (down) or taut (up).
225. **Transit Uplink — "The Big Ribbon."** Thick, expensive, drawn with a running gold-drip because
     it bills by the 95th percentile (§6.14). Visibly the most costly thing on your map.
226. **IX Peering Port — "The Handshake Bridge."** A short bridge to a peering fabric. Traffic moved
     here visibly *stops dripping gold*, which is the clearest possible lesson in peering economics.
227. **Cross-Connect — "The Violet Run."** In colo levels, the thing you sell: a violet cable from a
     tenant cage to the meet-me room. Each one is a recurring gold drip *toward* you. A wall of
     violet is a wall of money.
228. **Meet-Me Room — "The Cathedral."** A visually distinct, higher-ceilinged room with ordered
     racks of patch panels and carrier equipment. The one place in the facility that looks *sacred*.
229. **Patch Panel — "The Jack Field."** A grid widget you can click into; the game's canonical
     "wiring" UI element (§7.6). Real satisfaction in filling one neatly.
230. **Structured Cabling Tray.** Overhead ladder racks and baskets that cables must route through
     if you want the neat look; routing outside them creates the Rat's Nest (§2.102).
231. **Tap / Port Mirror — "The Periscope."** A small object that lets your IDS see traffic it
     otherwise couldn't. Placement puzzle: you can see exactly which lanes it covers as a highlighted
     subset.
232. **VLAN / Segmentation — "The Colored Floor Paint."** Network segments are drawn as colored zones
     painted on the floor; a flat network is one giant beige floor, and segmenting visibly *carves it
     up*. Lateral movement by an attacker is drawn as it walking across floor paint — and stopping
     dead at a boundary. The best security-concept visualization in the document.
233. **Microsegmentation — "The Grid Lines."** The floor paint subdivides into a fine grid, and each
     cell has its own tiny gate. Expensive, beautiful, and visibly a maintenance burden.
234. **VPN Concentrator — "The Tunnel Mouth."** A literal tunnel entrance on the map edge with
     encrypted traffic drawn as opaque capsules. It's a hole in your wall that you built on purpose.

### 4.3 Facility: power, cooling, fire, security

235. **Rack / Cabinet.** The core container. Doors open/close (perforated vs solid is visible and
     matters for airflow), side panels, blanking plates (visible gaps without them, and you can see
     hot air recirculating through the gaps), a PDU spine on each side, and a label at the top.
236. **Blanking Panels.** The cheapest upgrade in the game and one of the most visually satisfying:
     you watch the recirculation streamers stop as you fill the holes.
237. **PDU — "The Spine."** A vertical strip of outlets with per-outlet LEDs and a total-load meter at
     top. Overloading it makes the meter go red and the breaker visibly trip with a physical flip.
238. **The Breaker Panel.** A wall object with rows of physical breakers you can see tripped or set.
     Tripping one is a *click* and a row of your racks going dark — the most brutally simple failure
     visualization available.
239. **A/B Power Feeds.** Two visibly different cable colors going to two different PDUs from two
     different paths. Single-corded devices are drawn with an obvious missing second cable and a small
     warning pip; when the ATS flickers (§2.106) they are the only ones that die.
240. **UPS — "The Battery Ziggurat."** Stacked cells that discharge visibly, plus a bypass switch.
     End-of-life batteries bulge (a real, horrible, very drawable thing).
241. **Flywheel UPS — "The Spinner."** Alternative UPS with a visible spinning mass and a much
     shorter but very legible runtime. Great for showing a design tradeoff as a picture.
242. **Generator — "The Barn."** Outdoor object with a radiator, exhaust stack, and a control panel.
     Monthly load-bank test is an animation you should run — and skipping tests shows as rust creep on
     the object, which is a beautiful "maintenance debt" visual.
243. **Diesel Tank + Fuel Contract.** A tank with a float gauge, plus a delivery truck that arrives on
     contract. During a long outage, the truck arriving is a *cheer* moment.
244. **ATS / Static Transfer Switch — "The Big Lever."** A visibly mechanical thing that throws with a
     satisfying clack. Testing it is scary because testing it causes The Flicker.
245. **Substation / Utility Feed — "The Yard."** Campus-level object with buzzing insulators and a
     visible one-line diagram overlay. Dual utility feeds from different substations are drawn as two
     genuinely different routes across the map, which makes redundancy geographic and legible.
246. **CRAC / CRAH — "The Cold Breath."** A unit that emits a visible cold blue plume across the floor
     and under the raised floor. You can see your cooling coverage as plume reach, and find hot spots
     as places the blue doesn't reach.
247. **Chiller Plant + Cooling Tower.** Campus objects with visible water vapor. On hot days the
     plume is bigger and the efficiency readout worsens — weather visibly costs money.
248. **In-Row Cooling — "The Slot Unit."** A cooling unit that takes a rack slot in the row, visually
     trading floor space for targeted cold. The tradeoff is literally spatial.
249. **Rear-Door Heat Exchanger.** A door you bolt on; the rack's heat plume visibly stops leaving it.
250. **Hot/Cold Aisle Containment — "The Glass Roof."** Clear panels over the aisle. The visual before/
     after is dramatic: mixed warm haze becomes a crisp blue aisle and a crisp red aisle. One of the
     best upgrade payoffs to animate.
251. **Raised Floor + Tile Puller.** Perforated tiles you place individually to direct airflow; a
     visible micro-optimization puzzle. Also: you can lift tiles and see the cable/pipe underworld,
     which is a whole second layer of the level.
252. **Airflow Streamers.** Little ribbons tied to grilles (as in real DCs) that show direction and
     speed. Free, charming, and a continuous readout with no HUD cost.
253. **VESDA / Smoke Detection — "The Sniffers."** See §2.112.
254. **Pre-Action Sprinkler — "The Dry Pipe."** Overhead pipes that are visibly *empty* until armed;
     the charge animation (water filling the pipe) is a dread machine.
255. **Clean Agent Cylinders — "The Red Bottles."** A row of tanks with pressure gauges. After a
     discharge they're visibly empty and must be refilled at cost — consequences you can see.
256. **Fence, Bollards, Gate.** Perimeter objects. Bollards exist entirely so you can see them stop a
     vehicle once, and it will be worth it.
257. **Mantrap — "The Airlock."** Two doors that cannot both be open. Watching a tailgater get caught
     between them is the reward for building it.
258. **Badge Reader.** A small object with a green/red blip on each access event. Access logs are
     drawn as a visible trail of footsteps on the floor for the last N minutes — which is how you
     catch the Friendly Face (§2.79).
259. **Camera — "The Cone."** Cameras project visible coverage cones on the floor. Blind spots are
     literally dark wedges, and you place cameras to eliminate them. A classic, perfect, spatial
     security puzzle.
260. **Guard / Security Desk NPC.** A stationary sprite with a patrol route option. Visible patrol
     path lines. Also the one who escorts tenants.
261. **Loading Dock.** Where crates arrive and pallets leave. A busy company has a busy dock; a
     hoarding company has a blocked one.
262. **The Crash Cart.** A rolling monitor+keyboard cart a tech pushes to a dead server. Its travel
     time is visible, which makes out-of-band management feel valuable when you finally buy it.
263. **Spares Shelf.** A visible shelf of spare drives, PSUs, optics, and cables. Repairs pull from it
     visibly; an empty shelf means the repair has to wait for shipping, drawn as a truck ETA.

### 4.4 Staff as visual objects

264. **Staff Are Walkers.** All staff are NPC sprites with real pathing and real travel time. You can
     see who's busy, who's idle, and who's stuck on the far side of the campus.
265. **Role Silhouettes.** Distinct at 24px: **NOC tech** (headset + tablet), **hands-and-eyes tech**
     (tool belt + crash cart), **network engineer** (fiber tester, kneeling at patch panels),
     **DBA** (coffee, permanently at a desk), **security analyst** (hoodie + three monitors),
     **support rep** (headset + ticket stack), **sales** (suit + coffee for a customer),
     **compliance officer** (violet lanyard + clipboard), **facilities/electrician** (hard hat +
     arc-flash suit), **cable monkey** (spool on a shoulder).
266. **The Fatigue Tint.** Staff desaturate over a shift and during incidents. An all-grey ops team
     works slower and makes mistakes (a small chance of a visibly wrong action). Hiring/rest visibly
     restores color. Burnout as a color ramp.
267. **The Pager.** Off-shift staff appear as a phone icon; paging them shows a phone buzzing, then a
     car arriving, then them walking in — a visible 3-minute response time.
268. **The Follow-the-Sun Band.** In multi-region levels, a lit band across the globe view shows which
     team is awake. Handoffs are drawn as a baton pass animation between two NOC desks.
269. **Skill Pips.** Each staffer has 1-5 pips per skill shown as small chevrons on their badge. Pips
     fill through incidents they've handled — visible growth.
270. **The Runbook Binder.** Staff carry binders; a documented procedure is a tabbed binder they can
     flip open (fast, correct action). Undocumented = they improvise (slow, chance of error, visible
     head-scratch animation). Documentation as an object you can literally see them holding.
271. **The Bus-Factor Halo.** A staffer who is the *only* one who knows a system gets a thin, ominous
     halo and every system only they know draws a faint tether to them. When they quit, you watch the
     tethers snap.
272. **The Contractor.** Visually distinct (different uniform color, a visitor badge), works fast,
     leaves. Doesn't gain pips, doesn't write runbooks. The art tells you the tradeoff.

---

## 5. Unlocks and Discovery — Making Progress Visible

273. **The Tech Wall (main unlock UI).** Not a node graph floating in space — a **whiteboard/corkboard
     in your office** with printed spec sheets, torn catalog pages, Polaroids, and string connecting
     them. Locked items are face-down or censored; hovering flips them. It's diegetic, it's charming,
     and it scales because you can pan a physical board.
274. **The Blueprint Tube.** Major unlocks arrive as a rolled blueprint in a cardboard tube you
     physically unroll (a drag gesture). The reveal is worth the two seconds.
275. **Discovery by Incident — "The Polaroid."** When a threat hits you for the first time, a Polaroid
     of the moment develops (that lovely chemical fade-in) and pins itself to the wall with a scrawled
     note. It unlocks the counter's research. Failure literally becomes wall art.
276. **The Runbook Binder Tabs.** Each solved incident class adds a labeled tab to the binder. A thick,
     tabbed binder is a visible measure of institutional knowledge and is the game's most satisfying
     "number goes up" without a number.
277. **Rack Mail — "The Catalog."** A glossy vendor catalog arrives periodically; you flip pages with
     a page-turn animation. New gear appears here before it's affordable, so you *window shop*. Era
     shading applies: a 1998 catalog is newsprint, a 2024 one is a web configurator.
278. **The Trade Show Floor.** An unlockable hub screen: a convention hall with vendor booths you walk
     between, each booth demoing one buildable with a little looping animation. Talking to a vendor
     unlocks a trial. It's a *place*, which makes browsing tech feel like an event.
279. **The Lab Bench.** A physical R&D area in your facility with a workbench, an oscilloscope, and a
     test rig. Research in progress is visible as a half-assembled thing on the bench with a progress
     scrub. You can see what you're working on from across the room.
280. **The Sticker Progression.** Certifications, vendor partnerships, and completed audits become
     stickers on your gear, your laptop lid, and your office door. A veteran company is *covered* in
     stickers. Pure, cheap, endlessly readable progression texture.
281. **The Patch Jacket.** Personal-scale progression: a hanging jacket in the office that accumulates
     embroidered patches for milestones (first DDoS survived, first PB stored, first 100k concurrent).
     Zoom in for a beautifully rendered close-up. Screenshot bait.
282. **The Business Line Sign-Bolt.** Unlocking a new *hosting type* physically bolts a new sign onto
     your building with a small crane animation, and the facility gains that type's Visual Identity
     Kit in one wing. Running three lines of business means your building is visibly a chimera — the
     colo wing looks like concrete, the GPU wing glows orange, the mail wing is beige — and that is
     the single best image for "diversified hosting company" in the entire design.
283. **The Wing Build-Out.** New business lines start as a *taped outline on the floor*, then studs,
     then walls, then finished. You can see your pivot under construction.
284. **The PCB Trace Tree (alternate unlock skin).** For players who want a conventional tech tree: a
     green PCB where unlocked nodes are solder pads that light and traces that carry a visible current
     to the next node. Locked branches are unpopulated footprints with silkscreen outlines only —
     you can see the *shape* of what's missing, which is a great teaser mechanic.
285. **Censored Silhouettes.** Undiscovered items render as black silhouettes with the name redacted.
     You can see the shape of the future. A rack-shaped hole, a dish-shaped hole, a tank-shaped hole.
286. **The Conference Talk.** Publish a postmortem → a slide-deck animation plays → your reputation
     sky clears a shade and a talk unlocks a hiring bonus. Turning your worst day into a visible asset.
287. **The Hiring Board.** A corkboard of resume cards with photo, role silhouette, skill pips, and a
     salary tag. Better reputation = better cards appear. You can *see* your employer brand.
288. **The Vendor Relationship Meter — "The Rolodex."** Each vendor is a card with a relationship
     edge-glow; good standing unlocks better lead times (visibly shorter truck ETAs) and advance
     access in the catalog.
289. **The Certification Seal Wall.** SOC 2, PCI, HIPAA, ISO — each is a wax/foil seal mounted in the
     lobby. They visibly *expire* (tarnish) and need re-audit, so the wall is also a to-do list.
290. **Zoom Tier as an Unlock.** You earn the Campus and Globe cameras. The first time the camera
     pulls back to a view you've never had is a genuine "oh" moment and costs nothing but a gate.
291. **The Dead Drive Shelf (prestige).** Every drive that has ever died in your company is kept on a
     shelf with a handwritten date. Hundreds of them by endgame. Morbid, funny, and a perfect
     long-arc progress display.
292. **The Overlay Unlocks.** Each new *lens* (heat map, power map, blast radius, cost-per-U, latency
     field) is itself an unlock, announced with a short animation of the world being re-rendered in
     that lens. Giving the player new *ways to see* is as good a reward as new things to build.
293. **The Rumor Board.** Upcoming threats hinted before they arrive: a pinned news clipping, a
     mailing-list printout, a CVE advisory with the details blurred. You can prepare for a shape you
     can only half-see.
294. **The Acquisition Folder.** Buying a competitor unlocks a manila folder of their gear photos —
     you browse their junk before you inherit it and decide what to keep. Visual due diligence.
295. **Blueprint Export as a Reward.** High-scoring level completions unlock a printable-looking
     one-page schematic of your final build, rendered in cyanotype. It's an unlock whose reward is
     *a picture of what you did*.

---

## 6. Economy, Money, and Scoring — Drawing the Money

### 6.0 The money design language

296. **Gold Is Reserved.** Nothing in the world is gold except money. When gold appears, it's cash.
     This single rule makes money legible in the busiest frame.
297. **Money Always Moves.** Revenue and cost are never *only* numbers; they are always also motion.
     Money in flies toward the gutter; money out drips away; money reversed flies backward. The
     player should be able to tell if they're winning with the sound off and the numbers hidden.
298. **The Revenue Gutter.** A horizontal channel along the bottom of the world view where earned
     coins collect and flow left into the treasury. A healthy company has a visible *current* in the
     gutter. A struggling one has a trickle. It's a cash-flow meter made of particles.
299. **The Ledger Tape.** A receipt printer in the bottom-right of the chrome that prints one line per
     financial event in real time, in monospace, and spools a little paper tail. You can scrub it. It's
     the game's financial log, the transaction feed, and a lovely period-appropriate texture all at once.
300. **The Burn Candle.** Your net burn is a candle in the HUD: tall and steady when profitable
     (actually a candle *growing*), shrinking with a visible wick length when burning cash. Runway in
     days = candle length. Nobody needs the word "runway" explained after seeing this once.
301. **The Two-Pan Scale.** An optional HUD widget: a physical balance with revenue on one pan, costs
     on the other, tilting in real time. Great for streams, great for glances, terrible for precision —
     which is why it sits *next to* the exact numbers, not instead of them.
302. **Capex vs Opex Split Bar.** A single bar in two materials: capex rendered as solid metal blocks
     (things you bought), opex as a flowing liquid (things that drain). The material difference makes
     an accounting concept intuitive.

### 6.1 Revenue, drawn

303. **The Per-Visitor Coin.** Every converted visitor drops a coin sized by its value. A page load
     drops a fleck; a colo contract drops an ingot the size of a rack. Value is *physical size*, so
     the relative worth of business lines is visible in a single frame.
304. **The MRR Spine.** A vertical stack of contract cards on the right edge whose total height is
     your MRR. New customers slot in with a click; churned ones fall out and the stack settles. The
     stack's *height* is the number you care about most and it's ambient, not a readout.
305. **The Recurring Pulse.** On the monthly boundary, every contract card flashes gold in sequence
     (a wave down the spine) and a large amount lands in the gutter. Payday should be an *event* you
     look forward to and can hear.
306. **The Invoice Bird.** Invoices fly out to customers and return as either a gold coin (paid), a
     grey envelope (late), or a red RETURN stamp (failed card). Your AR aging is a flock you can see.
307. **The Dunning Ladder.** Late invoices climb a visible ladder of escalation: reminder → warning →
     suspension (customer's window goes dark) → termination (card burns). Watching a customer climb
     the ladder gives you time to intervene.
308. **Overage Meter.** Metered usage (bandwidth, storage, GPU-hours) is drawn as a tank filling past
     a marked line; beyond the line the coin flow changes color to a brighter, greedier gold. Players
     learn instantly which customers are profitable overage users vs. flat-rate loss leaders.
309. **The 95th Percentile Window.** Transit billing drawn as a month-long graph strip with the top
     5% of samples visibly *greyed out* and a bright band at the 95th line. You can watch a spike get
     discarded and feel clever. Best financial-mechanic visualization in the doc.
310. **The Cross-Connect Faucet.** In colo, every cross-connect you sell adds a visible small faucet
     dripping gold. A meet-me room full of faucets is a picture of an extremely good business.
311. **Power Resale Meter.** Colo/wholesale revenue is a spinning utility meter dial mounted on each
     cage. You literally sell the spinning of a dial. Delightful.
312. **Setup Fee Confetti.** One-time fees drop as a small burst distinguishable from recurring gold
     by being *brighter and once*. Teaches the difference between one-time and MRR without a word.
313. **The Upsell Handshake.** When support or sales successfully upsells, the customer's card gains
     a new colored stripe and the card grows taller with a satisfying push. Growth within an account
     is visibly different from a new account.
314. **The Marketplace Shelf.** Add-ons (backups, managed DB, DDoS protection, monitoring) are drawn
     as products on a shelf in your storefront. Attach rate = how many customers are carrying your
     shopping bag. Very readable, very retail.
315. **Reserved / Committed Contracts — "The Anchor."** Long-term commitments are drawn as an anchor
     chain on the customer card: stable, heavy, hard to lose, but it also visibly *pins your pricing*
     so you can't raise it. Commitment drawn as weight.
316. **Spot / Preemptible — "The Kite."** Cheap, opportunistic revenue drawn as a kite on a thin
     string that can be cut at any moment. Perfect visual for GPU spot markets.

### 6.2 Costs, drawn

317. **The Upkeep Drip** (see §4.184) — the constant ambient cost.
318. **The Power Bill Dial.** A utility meter on the wall of your facility whose dial speed is your
     live power draw. Turning on a GPU row makes the dial visibly *whirl*. At the end of the month it
     stops, the number is read, and a very large coin leaves the treasury. Cause and effect, drawn.
319. **PUE as a Leak.** Your Power Usage Effectiveness is drawn as the proportion of incoming power
     ribbon that *doesn't* reach the racks — it visibly leaks out sideways into cooling and losses.
     Improving PUE narrows the leak. An abstract efficiency metric becomes a picture of waste.
320. **Payroll Pulse.** A biweekly red pulse across the staff roster and a chunk leaving the treasury.
     Staff cost is rhythmic, unavoidable, and visible.
321. **The Lease Stamp.** Facility/colo rent is a big rubber stamp on the ledger tape each month.
     Bigger facility = bigger stamp = bigger noise.
322. **The Depreciation Fade.** Owned gear's card value visibly fades over time; end-of-life gear is
     nearly transparent on the balance sheet widget while still being fully solid in the world. The
     gap between "book value" and "still working" is drawn, which is a genuinely educational image.
323. **Shipping & Lead Time.** Ordered gear shows as a truck/plane icon crossing the region map with
     an ETA. Expedited shipping is a visibly faster, gold-tinted vehicle. You pay for speed and you
     watch it arrive early.
324. **The Remote Hands Clock.** In colo-tenant levels, every minute a datacenter tech works for you
     is a visibly ticking meter, like a taxi. You will *hurry*.
325. **The Incident Cost Meter.** During an outage, a red counter accumulates in the top bar: lost
     revenue + SLA credits + staff overtime, all ticking upward. It's a stopwatch that costs money
     and it's the most motivating object in the game.
326. **The Technical Debt Ledger.** Deferred maintenance is drawn as literal IOU slips pinned to the
     affected objects. They accumulate. Each one raises failure probability. Paying it down removes
     slips with a satisfying tear-off.

### 6.3 Pricing and business decisions, drawn

327. **The Price Dial + Demand Ghost.** Pricing UI is a physical dial; as you turn it, a **ghost
     preview** of the resulting visitor stream renders live next to the real one — thinner and richer
     as you raise price, fatter and poorer as you lower it. You *see* elasticity before you commit.
328. **The Competitor Price Tag.** Rivals' prices are drawn as tags hanging at the edge of your
     market view. Undercutting is visible as your tag being lower and their visitor lane bending
     toward you. Price wars are a tug-of-war you can watch.
329. **The Margin Tint.** Every service and every customer card carries a subtle background tint from
     green (high margin) to rust (losing money). Scanning your customer file for rust tells you who to
     fire, which is a real hosting decision and a great visual moment.
330. **The Oversubscription Slider.** A slider with a visible "safe" green zone, a yellow zone, and a
     red zone where your tenement windows start flickering. Greed and risk in one control.
331. **The SLA Tier Stripe.** Bronze/Silver/Gold/Platinum are literal stripes on the contract card and
     on the corresponding infrastructure. High-tier customers' gear glows slightly, so you know which
     rack you absolutely cannot take down. Spatial risk awareness from a stripe.
332. **The Contract Term Ribbon.** Contract length drawn as a ribbon with visible remaining length.
     Short ribbons are churn risk; a wall of short ribbons is a visible business-model problem.

### 6.4 Scoring and end-of-level

333. **The Report Card.** End of level is a single physical sheet with embossed stamps: uptime grade,
     margin grade, growth grade, security grade, customer-sat grade. Each stamp thunks down in
     sequence with a sound. No spreadsheet, one page, heavy paper texture.
334. **The Nines Meter.** Uptime scored as physical nines carved into a post: 99 / 99.9 / 99.99. Your
     result is a line painted on the post. Simple, iconic, instantly comparable across levels.
335. **The Incident Timeline Strip.** A horizontal film strip of the level's incidents as small
     thumbnails: you can scrub it after the fact and watch your worst moments. Also the raw material
     for the auto-generated comic (§9.22).
336. **The Sankey Payoff.** A one-screen Sankey diagram at level end: visitors in → served / bounced,
     revenue → costs → profit, drawn in the reserved palette. Beautiful, dense, and the one place a
     chart is more satisfying than a metaphor.
337. **The Trophy Shelf.** Level awards are physical objects on a shelf in your office that persist:
     a bent drive mounted on a plaque, a first-dollar bill in a frame, a melted optic, a signed
     tournament jersey from the game-hosting level. Your office becomes a museum of your campaign.
338. **The Dust Sheet Ending.** On failure, the camera pulls back and dust sheets fall over the racks,
     row by row, and the lights go out from the far wall toward you. No text needed.
339. **Bankruptcy Cascade.** Financial failure is drawn as progressive shutdown: first the ambient
     lighting, then the non-critical racks, then cooling, then the sign outside goes dark. It should
     take 15 seconds and hurt the whole time.
340. **The Acquisition Ending (good).** Success can end with a competitor's logo appearing next to
     yours on the sign, or your logo going up on *their* building. Endings expressed as signage.
341. **The Grade Curve Portrait.** Scores are also expressed as a small generated "company portrait" —
     a stylized illustration of your facility as it ended, with its actual rack count, its sky color,
     its sign, and its scars. Shareable image, zero extra art cost beyond the renderer you already have.
342. **Par Ghost.** Each level has a "par" run rendered as a faint ghost line on the incident timeline
     and the revenue graph, so you can see where you diverged from a competent operator.

---

## 7. Core Gameplay Mechanics — Interaction Design, Drawn

### 7.0 The interaction philosophy

343. **Everything Is a Thing.** No abstract menus where an object could exist. Want to add a server?
     Order it from the catalog, watch it arrive, rack it. Want to connect two things? Drag a cable.
     Want to change a setting? There's a panel on the device. The HUD exists only for things that
     genuinely have no physical form (money, time, alerts, scores).
344. **Two Truths Toggle — Physical vs Logical.** One key swaps the entire scene between **Physical**
     (racks, cables, heat, doors — where things *are*) and **Logical** (a clean architecture diagram —
     how things *relate*), with a smooth morph where each server slides from its rack position to its
     tier position. Same objects, same selection, two mental models. This is the single most important
     interaction in the game and the morph animation is what makes it teachable.

### 7.1 Connecting things

345. **Wiring Mode.** Hold `TAB` (or press a wire button) and: the world desaturates to 30%, every
     valid port on every device lights up as a small glowing socket, invalid ports dim out, and the
     cursor becomes a connector end. This is a *mode with an unmistakable look*, so you always know
     you're in it.
346. **Drag-a-Cable.** Click-drag from port to port. The cable follows the cursor with real slack and
     sag; it snaps to the nearest valid port within a radius with a magnetic tug and a click sound.
     Releasing on empty space springs the cable back with a whip. Releasing on an incompatible port
     turns the cable red and it recoils with a buzz — the negative feedback is *physical*, not a modal.
347. **The Port Row.** Every faceplate has a visible row of sockets with type-coded shapes: RJ45 is a
     trapezoid, SFP is a slot, power is a kettle-plug outline, console is a tiny circle. Shape-coded,
     so it works colorblind and at small sizes.
348. **Auto-Route vs Hand-Route.** By default, cables auto-route through the nearest cable tray with a
     tidy orthogonal path. Hold `SHIFT` to hand-route through waypoints. Tidy routing costs a moment
     and gives you a neat rack; lazy routing creates the Rat's Nest (§2.102). The game rewards
     craftsmanship *visually and mechanically*.
349. **Bundling.** Parallel cables between the same two devices auto-merge into a trunk drawn as one
     thicker cable with a small count badge (`×4`). Click the badge to fan it out. This is the key
     technique that keeps a 300-server room from becoming a hairball.
350. **Click-to-Link (the fast path).** For players who hate dragging: select source, click target,
     done. Same result, same visual. Both input styles must produce the identical cable.
351. **The Patch Panel Widget.** Double-clicking a patch panel opens a flat 24/48-port grid overlay
     where you can wire quickly with keyboard, then it collapses back into physical cables in the
     world. A bridge between spreadsheet-fast and diorama-pretty.
352. **Logical Links (dashed).** Some relationships aren't cables — "this app uses that database,"
     "this LB pool contains these nodes." Those are drawn as **dashed cyan arcs on the Signal layer**,
     never as physical cable, so you never confuse "plugged in" with "configured." Physical = solid
     and in-world; logical = dashed and floating.
353. **The Dependency Reveal.** Hover any object and every dependency (both directions) lights up with
     an animated pulse traveling along it. Hold to freeze it. Answers "what breaks if I unplug this?"
     in under a second.
354. **Blast Radius Overlay.** Select an object and press a key: everything that would fail if it
     failed is tinted red, everything degraded is amber, everything fine stays normal. The single
     best planning tool in the game and it's one keypress.
355. **The Unplug Confirm.** Pulling a cable that carries live traffic shows the traffic beads
     *straining* and a 1-second hold-to-confirm ring. Accidental outages are prevented by a gesture,
     not a dialog.
356. **The Mystery Cable.** Occasionally (in inherited facilities), a cable exists with unknown
     endpoints — it's drawn in white (the "temporary" color) and disappears into a wall. You can
     trace it with a toner probe minigame (a beeping wand and a signal-strength ring). Pure hosting
     authenticity and a genuinely fun 20-second puzzle.

### 7.2 Placement

357. **U-Slot Snapping.** Racks are divided into 42 visible U slots with tiny numbers. Devices snap
     to U boundaries with a *clack*. Multi-U devices show their footprint as you hover. Filling a rack
     neatly from the bottom is quietly delightful.
358. **Weight & Center of Gravity.** Heavy things at the top makes the rack lean visibly and adds a
     warning glyph. A tipped rack in a seismic event is your fault and you saw it coming.
359. **Airflow-Aware Placement.** As you hover a device, the ghost shows its intake and exhaust as
     blue and red arrows. Facing it the wrong way in the aisle is *visibly* wrong before you place it.
360. **Circuit Budget Ghost.** The ghost shows the PDU's load meter moving as you consider the
     placement. Exceeding the circuit turns the meter red and the ghost hatched.
361. **Floor Tile Grid.** At Tier 2-3, racks place on floor tiles with clearance rules (front/rear
     aisle, door swing). Violations draw red hatching on the floor. Facility layout becomes a real
     spatial puzzle, not a free-placement blob.
362. **The Row Stamp.** Draw a rectangle on the floor and the game lays a whole row of identical racks
     with correct aisle orientation. Scale-up as a single gesture, with a satisfying stamp animation
     down the row.
363. **The Rack Template / Clone Stamp.** Configure one rack perfectly, then "pick it up" as a
     template and stamp copies. Copies build in sequence with staggered construction animations,
     which looks fantastic and communicates "standardization" viscerally.
364. **Drag-Select & Bulk Ops.** Marquee-select devices; selected objects get a cyan outline and a
     count badge. Bulk actions (reboot, drain, patch) animate across the selection in a *wave* so you
     can see the order and catch it mid-flight.
365. **Drain Mode.** Right-click a node → "drain." A visible amber curtain lowers over its intake;
     existing visitors finish and leave; new ones route around. The node goes safe-to-touch with a
     green wrench icon. The most useful and most satisfying operational verb in the game.

### 7.3 Lenses, overlays, and time

366. **The Overlay Wheel.** Hold a key for a radial menu of lenses, each with a distinct icon and a
     distinct full-scene treatment: **Heat** (false color), **Power** (one-line diagram, everything
     else greyed), **Network** (cables bright, world dark), **Latency** (distance-warped field),
     **Security/Exposure** (magenta rings and floor paint), **Cost-per-U** (green→rust tint),
     **Capacity** (fill bars on everything), **Blast Radius**, **Compliance** (violet chips),
     **Age** (new→old tint, showing your legacy debt as a color map).
367. **Lens Persistence & Blending.** You can pin two lenses at 50% each (e.g. Heat + Power) and the
     game shows a combined false-color. Power users build their own dashboards out of the world itself.
368. **The Packet Bead Simulation.** Traffic on cables is drawn as beads moving at a speed proportional
     to throughput and spaced by packet rate. Congestion is beads bunching up; loss is beads winking
     out. It's not a graph, it's a flow you watch, and it's the main diagnostic instrument.
369. **The Time Dial.** Speed control drawn as a physical dial with 1×/2×/4× and pause. Higher speeds
     add motion blur and ghost trails to sprites so you *feel* the speed rather than just reading it.
370. **Blueprint Pause.** Pausing doesn't just stop time — the world shifts into the cyanotype
     blueprint look (§1.39) and a drafting grid appears. Planning mode has its own visual identity so
     you always know the world isn't moving. Placing and wiring while paused is encouraged.
371. **The Rewind Tape (undo).** Undo is drawn as a tape reel spinning backward with a brief VHS
     rewind smear across the last action. Only mechanical/build actions are undoable; time is not.
372. **The Incident Pounce.** When something serious happens, the camera does *not* teleport. It
     arcs to the event over ~0.6s with an accelerating dolly, and a thin white line connects the
     alert in the HUD to the world object. You always know where you are and how you got there.
373. **The NOC Wall.** A diegetic dashboard object in your office: a wall of monitors showing tiny
     live graphs, a map, and a camera feed. Clicking a monitor jumps the camera. Your minimap is a
     piece of furniture you actually built.
374. **The Rack Ribbon.** A thin persistent strip along the bottom of the chrome: one slim vertical
     bar per rack, colored by its single most salient state (Law 3). 200 racks fit in a strip. Click
     one to fly there. This is how the endgame stays navigable.
375. **Alert Taxonomy.** Exactly three tiers with three distinct looks: **Toast** (bottom-right, slides
     in, no sound, auto-dismiss — informational), **Badge** (persistent pip on the object and on the
     Rack Ribbon — needs attention), **Klaxon** (screen-edge red vignette pulse + a sound + camera
     offer — act now). Never more than one klaxon at a time; additional criticals queue behind it.
376. **The Vignette Language.** Screen-edge tints communicate global state without taking space:
     red pulse = critical incident, blue = brownout/power, white = suppression discharge, violet =
     audit in progress, gold = a big payday landing. Peripheral vision doing real work.

### 7.4 Upgrades, repair, failure

377. **Bolt-On Upgrades.** Upgrades are visible hardware changes, not stat bumps: more DIMMs appear in
     slots, a second PSU slides in, an extra NIC card, bigger drives (different caddy color), a fatter
     heatsink. You can look at a server and know its spec. This is the *whole* upgrade UI.
378. **The Plating Pass.** Software-level upgrades (hardening, tuning, patching) render as a quick
     sweep of light over the object leaving a subtly different finish — a satin sheen for hardened,
     a matte for patched. Small but readable, and it accumulates.
379. **The Patch Window.** Maintenance is a scheduled, visible time band on the HUD timeline; inside
     it, traffic is pre-drained and staff work fast. Outside it, they work slowly and nervously and
     visitors are still flowing. Doing it right *looks* calm; doing it wrong looks frantic.
380. **The Walk.** All repairs require a staff sprite to physically reach the object. You watch them
     go. This makes facility layout, spares placement, and out-of-band management all *felt* rather
     than calculated. It's also the game's natural pacing mechanism.
381. **The Repair Minigames (optional, short).** Reseating an optic (a small alignment gesture),
     crimping a cable (a rhythm click), swapping a drive (drag the caddy out, drag a spare in). All
     skippable with auto-resolve at a time penalty, all visually specific.
382. **The RAID Rebuild Bar.** After a drive swap, a visible rebuild progress ring on the array with a
     *danger window* shown in amber — during which a second failure is fatal. You watch the risk
     window close. Genuinely tense, entirely visual.
383. **Cascading Failure Rendering.** A failure that propagates is drawn as a darkness that *spreads
     along the dependency arcs* with a visible front. You can see it coming and cut ahead of it by
     drain-mode-ing something in its path. The best emergent-drama visual the design has.
384. **Circuit Breaker (software) — "The Flip."** Auto-protection drawn as a small breaker glyph on
     the arc that flips open with a snap; traffic visibly reroutes. Half-open state is a breaker
     that's letting one bead through at a time to test the water — adorable and exactly right.
385. **The Failover Handoff.** Active/passive failover is drawn as a crown physically moving from one
     node to another with a short arc. Two crowns = split brain (§2.124). One crown = correct. The
     crown is the single most important 8px sprite in the game.
386. **Graceful Degradation Layers.** When overloaded, services visibly shed features in order: the
     recommendation widget goes grey, then images drop to placeholders, then the page goes text-only.
     The visitor still converts but drops a smaller coin. Degradation as a picture of a page getting
     simpler.
387. **The Triage Board.** During a major incident, the HUD can flip into an incident-bridge layout:
     the world shrinks to a corner, a timeline of what happened fills the middle, affected customers
     list on the right, and your staff are assignable cards. A whole second UI mode for the worst
     ten minutes, with a red-tinted chrome so you know where you are.
388. **The Runbook Quick-Bar.** Documented procedures become one-click buttons on a bar at the bottom
     during incidents, each with its own icon. An undocumented incident shows an *empty bar* — a very
     motivating absence.
389. **The Postmortem Sheet.** After an incident, a form fills itself in with the timeline you just
     lived. Completing it costs staff time and yields a runbook tab, a Polaroid, and reputation. The
     paperwork is drawn as paperwork and it's worth doing.

### 7.5 Readability at scale

390. **The Squint Test (design rule).** Every screen must be evaluated at 25% size and 10% opacity on
     detail. If the single most important thing isn't still visible, the screen fails. Applied to every
     tier.
391. **The Icon Budget.** A hard cap on simultaneously-drawn alert glyphs per screen region; overflow
     merges into a "+7" cluster badge that expands on hover. Prevents glyph soup by construction.
392. **Clustering with Intent.** At Tier 3+, identical adjacent states merge into one labeled region
     ("Row C: 14 nodes, healthy") drawn as a single soft outline. Only the *exceptions* stay drawn
     individually. Your eye is pulled to exceptions automatically.
393. **The Exception Spotlight.** In a sea of healthy green, one amber unit gets a subtle radial
     darkening of everything around it. Not a flash — a *lowering of the surroundings*. Far less
     fatiguing than blinking, and far more effective.
394. **Motion as the Last Channel.** Color, shape, and position are used first; *motion* is reserved
     for things that need action now. A calm facility should be visually calm — idle animations
     subtle, LEDs slow-breathing. The contrast is what makes an emergency register instantly.
395. **The Quiet Mode.** A toggle that hides everything healthy entirely, leaving only problems drawn
     on a dark ghost of the facility. For late-game, this is how you actually operate.
396. **Colorblind Shape-Coding.** Every semantic color also has a shape: health states carry a small
     glyph (● healthy, ▲ warning, ■ fault, ✖ down), threats carry an angular chevron, visitors a
     round mote, money a hexagon. Full deuteranopia/protanopia/tritanopia palettes, plus a
     "patterns" mode using hatching for zones.
397. **Text Scale Independence.** All HUD text is in the Chrome layer and never scales with zoom; a
     user-settable global UI scale (75%–200%) that reflows panels rather than just magnifying them.
398. **The Label Budget.** Device labels only render at Tier ≤2, and even then only for selected,
     alerting, or player-pinned objects. You can pin a label to any object permanently (drawing pin
     icon) — players build their own personal label layer.

---

## 8. Visuals and Presentation — The Main Event

### 8.1 Art style options (with a recommendation)

399. **Option A — Isometric Pixel Art (dense, warm, hand-made).** 2:1 iso, ~32px per rack U at Tier 1,
     limited palette per Identity Kit, hand-animated LEDs and fans. Strengths: enormous charm, reads
     beautifully at small sizes, cheap per-asset, LED-level detail is trivially legible. Weakness:
     asset count explodes at scale, rotation is limited.
400. **Option B — Flat Vector Isometric (clean, modern, infinitely scalable).** Mini Metro / Two Point
     lineage. Strengths: perfect at any zoom, trivially recolorable per Identity Kit and per era,
     great for overlays. Weakness: can feel sterile; harder to make 200 racks feel like a *place*.
401. **Option C — Cyanotype / CAD Blueprint.** The entire game as technical drawing: white lines on
     blue, hatching, dimension arrows, revision clouds. Strengths: unique, extremely readable, makes
     complexity look intentional. Weakness: hard to make threats feel dangerous or money feel good.
     **Best used as a *mode*, not the whole game** — pause/plan (§7.370) and blueprint export (§5.295).
402. **Option D — Cutaway Dollhouse 2.5D.** Orthographic 3D with front walls removed, like Theme
     Hospital or The Sims. Strengths: best "my facility is a place" feeling, easy camera ladder, real
     lighting from LEDs. Weakness: most expensive, hardest to keep readable at Tier 3+.
403. **Option E — Diegetic Terminal.** Everything rendered as a TUI: box-drawing, block glyphs,
     256-color, a blinking cursor. Strengths: perfect for the BBS/dial-up era, cheap, and a beloved
     aesthetic among the exact audience for this game. Weakness: can't carry a whole campaign.
404. **Option F — Paper Diorama / Craft.** Cardboard racks, paper cables, felt floor tiles, visible
     glue and fold lines. Strengths: charming, distinctive, and makes "physical infrastructure"
     tactile. Weakness: fights realism when you need to show heat and light.
405. **RECOMMENDED HYBRID — "Iso Pixel World, Vector Signal, Terminal Chrome."**
     - **World layer:** isometric pixel art (Option A) for warmth and legibility of LEDs and cables.
     - **Signal layer:** crisp flat vector (Option B) for overlays, lanes, rings, and heat — so
       diagnostics never fight the world's texture and always read at any zoom.
     - **Chrome layer:** a slightly diegetic terminal/instrument aesthetic (Option E flavor) — monospace
       readouts, a receipt-printer ledger, physical dials — so the UI feels like operator equipment.
     This gives you three visually distinct, non-competing registers, which is exactly what Law 1 wants.
406. **The Two-Palette Discipline.** The World layer uses only muted materials (concrete, steel, beige,
     rust, black plastic) plus LED points. The Signal layer owns all the saturated semantic hues. The
     result: the world can be busy and the signals still scream.
407. **Grain & Materiality.** A very light, static film grain plus subtle per-material noise (brushed
     metal streaks, plastic speckle, concrete pores). It's what stops a flat-vector game from looking
     like a wireframe and a pixel game from looking like a spreadsheet.
408. **The Lighting Model.** Rooms are dim and **lit by their own equipment**. Rack LEDs, screen glow,
     exit signs, and overhead task lights are the light sources. Consequences: a dead rack is a *dark*
     rack, a heavily loaded GPU row glows orange and casts color on the aisle, and a power failure is
     a literal descent into darkness. Lighting does the work of a dozen HUD elements.
409. **The Practical Lights List.** Exit signs (green), EPO button (red, glass), aisle strip lights,
     CRAC status lamps, generator panel, camera IR glow in the dark, the meet-me room's fluorescents,
     the NOC's monitor wash on the operators' faces.
410. **Depth of Field, Sparingly.** A slight tilt-shift at Tier 3+ makes a huge facility feel like a
     model, which is both beautiful and a readability aid (the focal row is crisp, the rest is soft).
     Disableable for accessibility.

### 8.2 Animation principles

411. **The Breathing LED.** The idle animation of the entire game. A 1.6s sine breath on healthy green
     LEDs, with slight per-unit phase offset so a rack shimmers gently rather than pulsing in lockstep.
     A room full of breathing racks is the game's signature calm image.
412. **Fan Blur Ramp.** Fans are 3-frame blur states: slow, fast, screaming. Rack noise level is thus
     readable purely visually. A room going from slow to screaming during a heat event is the best
     ambient alarm you can build.
413. **Idle Fidgets.** Staff sprites drink coffee, check phones, lean on racks, spin a chair. Cables
     sway slightly in airflow. Dust motes drift in the light beams. Ten seconds of idle animation per
     character is what makes a facility feel inhabited rather than diagrammed.
414. **The Anticipation Budget.** Every action gets a small pre-motion: a server slides *back* a few
     pixels before sliding into the rack; a cable pulls taut before connecting; a coin dips before
     flying. Cheap squash-and-stretch turns a functional game into a satisfying one.
415. **Screen Shake Budget.** Shake is reserved for exactly four events: generator start, breaker
     trip, seismic, and a whale customer signing. Anything else uses a flash or a vignette. Shake
     inflation is the fastest way to make a game feel cheap.
416. **The Particle Vocabulary (fixed list).** Sparks (electrical), magic smoke (component death),
     steam (cooling), dust (age/contamination), glass shards (physical breach), paper (legal/tickets),
     packing foam (new gear), gold flecks (money), cyan motes (visitors), magenta grit (threats),
     white fog (suppression), water (leaks). Twelve systems, reused everywhere, each unmistakable.
417. **The Flash Language.** One-frame full-white flash = something was *created* or *served*.
     One-frame red flash = something was *hit*. One-frame blue flash = something was *identified*.
     Never mix.
418. **Transition Wipes by Meaning.** Blueprint wipe = planning. Dust-sheet wipe = ending a facility.
     Iris on a rack = zooming into a specific thing. Fade to black = era change. Each wipe carries
     meaning so the player is oriented before the new screen arrives.
419. **Reduced Motion Mode.** Every animation above has a static or minimal-motion fallback: LEDs use
     brightness steps instead of sine breathing, particles become static indicators, shakes become
     border flashes, tilt-shift and grain off. Accessibility as a first-class art pass, not a toggle
     bolted on.

### 8.3 Iconography

420. **Three Icon Tiers.** **Tier-A world glyphs** (drawn in-world, isometric, 16–32px: warning
     triangle above a rack, wrench on a drained node, padlock on a compromised one). **Tier-B chrome
     icons** (flat, 2px stroke, 24px, on a strict 24-grid with 2px padding). **Tier-C micro pips**
     (4–6px, single color, no stroke, used on the Rack Ribbon and in dense lists).
421. **The Icon Family Rules.** Everything is built from a small vocabulary of primitives: the
     rounded rectangle (a device), the circle (a service), the hexagon (money/resources), the chevron
     (a threat), the mote (a visitor), the shield (a defense), the wrench (an action), the seal (a
     compliance state). Anything new must be composable from these.
422. **Threat Class Marks.** Each threat family has a mark you learn once: **volumetric** = three
     stacked chevrons, **application** = a bracket pair, **physical** = a cracked square,
     **legal/abuse** = a stamp corner, **human** = a silhouette head, **environmental** = a wave.
     The bestiary card shows the mark, and the mark reappears on lanes, alerts, and defenses that
     counter it.
423. **The Counter Match.** Every defense object's icon visibly *contains* the mark of what it stops
     (the scrubber icon contains the volumetric chevrons; the WAF contains the brackets). Players
     learn the counter table from the icons themselves.
424. **Status Chips.** Small rounded chips with a 1-word label and a semantic color, used identically
     on device inspectors, customer cards, and the sales pipeline: `HEALTHY`, `DEGRADED`, `DOWN`,
     `DRAINING`, `PATCHING`, `COMPROMISED`, `SEALED`, `EXPIRED`, `OVERDUE`, `AT RISK`. One vocabulary
     across the whole game.
425. **The Label Plate Aesthetic.** In-world text (hostnames, rack IDs, circuit numbers) is rendered
     as **Dymo tape, printed label, or Sharpie on tape** depending on era and on how hurried the
     player was. Yes: labels made during an incident are visibly scrawled. Best detail in the doc.
426. **Auto-Generated Rack Elevations.** Any rack can be viewed as a proper printed elevation diagram
     with U numbers and device labels — the same picture a real DC hands you. Doubles as a shareable
     artifact and as the Tier-1 view.

### 8.4 Typography

427. **The Type Stack.** Three families, hard-assigned: a **condensed technical sans** for chrome
     labels (fits in tight gauges), a **monospace** for anything numeric, log-like, or terminal-ish
     (ledger tape, IPs, hostnames, metrics), and a **display face per era** for titles and signage.
428. **Era Display Faces.** 1994: a chunky bitmap face. 2001: a humanist sans with a bevel. 2008: a
     glossy grotesk. 2016: a geometric sans. 2030: a variable-weight sans that animates its weight
     on state change. The title card alone should date the level.
429. **Numbers Never Jump.** All live numerics use tabular figures and fixed-width fields so counters
     don't jitter. A subtle non-negotiable that makes the HUD feel professional.
430. **The Big Number Rule.** Exactly one number on screen may be "large." It's contextual: cash in
     calm play, incident cost during an outage, time remaining in a timed scenario. Everything else is
     secondary size. Prevents HUD shouting matches.

### 8.5 HUD layout

431. **The Instrument Bezel.** The chrome is framed as a piece of operator equipment: a thin dark
     bezel around the world view with recessed gauges. It grows more instrumented with difficulty
     (§1.49) and changes skin per era (§8.437).
432. **Top Bar — The Vitals.** Left to right: company name + logo, cash + delta, MRR spine summary,
     the Threat Mass Bar (§2.54), the uptime Nines water line, the reputation sky swatch, the time
     dial. Nothing else ever goes here.
433. **Bottom Dock — The Build Bar.** Categorized buildables as physical product tiles with a price,
     a power draw, and a U-height. Hovering shows the ghost. Locked items show as censored silhouettes
     (§5.285), so the dock is also a teaser of the tech tree.
434. **Right Panel — The Inspector.** Slides in when something's selected. Header (name, type, status
     chip), a photo-real faceplate rendering, capacity bars, the attack surface rose (§4.183), a
     connections list with hover-to-highlight, actions, and a mini event log. Always the same layout
     for every object type so muscle memory works.
435. **Left Rail — The Alert Stack.** Newest at top, grouped by object, each with a thumbnail of the
     world location and a one-line cause. Click to pounce (§7.372). Collapses to pips when empty-ish.
436. **Bottom Strip — The Rack Ribbon** (§7.374) and the **Ledger Tape** (§6.299) share this band.
437. **Era UI Skins.** The chrome re-skins wholesale per era: 1994 is a text-mode frame with
     box-drawing; 2001 is Win95 gray with bevels and a title bar; 2008 is glassy with gradients and
     rounded corners; 2016 is flat with generous whitespace; 2030 is translucent dark panels with a
     subtle blur. Same layout, different skin, so the player never relearns positions.
438. **The Panic Layout.** During a klaxon incident, the HUD automatically simplifies: the build dock
     collapses, the incident cost meter goes big, the triage board (§7.387) is one key away, and
     everything non-essential dims 60%. The UI itself has a stress response.
439. **The Diegetic Clock.** A wall clock in the facility, plus a shift indicator. It's how you read
     time-of-day, which affects staff availability, traffic patterns, and the outside light through
     the (one, deliberate) window.
440. **The Window.** Every facility has exactly one window to the outside. It shows the weather, the
     time of day, the season, and during a hurricane level, the storm. One asset, enormous atmosphere
     return, and it's the only place the player sees "outside."

### 8.6 Per-hosting-type visual shifts, summarized

441. **The Identity Kit Manifest.** Each hosting type supplies: palette chord (5), ambient light
     temperature, floor material, dominant silhouette (rack / cage / tank / dish / cabinet / desk),
     visitor form, threat accent, particle emphasis, signature motion, HUD swap (which gauge replaces
     the default), and one **hero object** that appears in the key art (the tape robot arm, the
     immersion tank, the modem wall, the meet-me room, the dish field, the sorting table).
442. **The Hero Object Rule.** Every level must have one object that is worth a screenshot. Design the
     level around making the player build it and then look at it.
443. **The HUD Swap Per Type.** Shared hosting shows *accounts and abuse*; colo shows *power, cooling,
     access*; CDN shows *hit ratio and PoP map*; backup shows *RPO/RTO and window clocks*; GPU shows
     *utilization, temperature, and $/GPU-hour*; game hosting shows *tick rate, player count, ping*;
     mail shows *queue depth and reputation*; SIP shows *concurrent calls and MOS*. The top bar's
     third slot is the "what this business actually cares about" slot and it changes per level, which
     teaches business-model differences through UI.
444. **The Cross-Business Facility.** When running multiple lines at once, the facility is visually
     zoned by Identity Kit (§5.282) and the HUD gets a business-line selector — clicking one dims the
     others' zones and swaps the specialized gauge. Your company's messiness becomes legible.

### 8.7 Cameras and framing

445. **Smart Focus.** Selecting an object frames it with a small dead-zone camera so related things
     stay visible. Never center-locks; that's nauseating at high zoom.
446. **The Establishing Shot.** Each level opens with a slow 4-second push-in from Tier 4 to the
     working tier, over the Deal Sheet's audio. Free grandeur.
447. **The Tenant's-Eye Walkthrough.** The eye-height camera (§1.47/3.175) with a slight handheld
     sway and a lens flare on the aisle lights. Used for tours, audits, and the ending.
448. **The Ceiling Cam.** A top-down orthographic option for pure layout work — no perspective, no
     charm, maximum precision. Power users will live here while building rows.
449. **The Security Camera Feed.** A picture-in-picture mode showing a grainy, timestamped, slightly
     fisheyed feed from any placed camera. Used for security events and for comedy.
450. **The Photo Frame.** A framing overlay with rule-of-thirds guides, DOF control, time-of-day
     scrub, and a "hide HUD" toggle. See §9.1.

### 8.8 Money, motion, and feedback (visual specifics)

451. **Coin Arcs.** All money follows a parabolic arc with a slight bounce on landing and a soft
     chime. Big amounts are one big coin with a heavier arc, not many small ones — so value reads
     as *mass*, never as particle count.
452. **The Negative Puff.** Money lost is never a coin flying away with fanfare; it's a desaturated
     puff that falls *down* out of frame. Losses should feel like gravity, gains like flight.
453. **The Delta Ticker.** Cash changes show a small `+$1,240` / `−$310` chip that rises and fades
     over the treasury. Color-locked: gold for positive, rust for negative (never red — red is faults).
454. **Threat Impact Feedback.** A landed attack produces: 1-frame red flash on the target, a directional
     impact spark on the face it came from, a chip of the target's health bar breaking off and falling,
     and a magenta grit puff. Four cheap elements, unmistakable in a crowd.
455. **Defense Fire Feedback.** Defenses "firing" is drawn as interception, not projectiles: the threat
     *hits the defense* and splats/dissolves. No tower shooting bullets at approaching enemies — that
     would be the wrong metaphor for a firewall. Defense is a *wall or a sieve*, and the visual should
     say so.
456. **The Exception: Active Response.** Things that genuinely go on the offensive (null-routing,
     blackholing, takedown requests, legal action) *do* get outbound visuals: a null route is drawn as
     a trapdoor opening in the lane and the traffic falling through it. Delightful.
457. **Connection Made.** A new cable connecting successfully: the port LEDs on both ends flash green
     in a two-beat handshake, the cable "settles" with a small sag animation, and the first packet
     bead runs the length of it. You always see the link come up.
458. **Upgrade Complete.** A brief sweep of light along the object plus the new hardware physically
     visible plus a small "spec plate" chip that flips to the new value. Three signals, one second.
459. **Failure Complete.** LED goes red, the fan blur stops (silence is loud), a small smoke wisp, and
     the object's outline picks up a broken-line treatment that persists until repaired. Persistent
     damage state so you can find it later.

### 8.9 Readability at scale (visual techniques)

460. **The Aggregate Glyph.** A rack summarizing 40 servers draws one glyph: a small vertical bar
     chart of its servers' states (a 40×1 pixel column). It's a literal sparkline made of your fleet
     and it's readable at 12px.
461. **Heat Tiles over Sprites.** At Tier 3+, individual state dissolves into a per-rack tile color.
     The floor plan becomes a low-res image of your company's health, which the human eye is
     extremely good at scanning.
462. **The Fleet Sparkline Wall.** An optional Tier-3 overlay: every rack rendered as a small
     sparkline of its last 5 minutes. 200 tiny graphs is actually very readable when they're identical
     in shape and you're scanning for the odd one out.
463. **Anomaly Highlighting, Not Status Highlighting.** At scale, don't color things by status
     (everything would be green); color things by *deviation from their own baseline*. A rack that's
     fine but weird is the one you want to see.
464. **Progressive Disclosure of Cables.** Above Tier 2, physical cables stop drawing individually and
     become **link ribbons** between racks whose width is aggregate bandwidth. The cable plant becomes
     a flow map.
465. **The Ghost Facility.** When you fly to another site, the previous one stays visible as a dim
     ghost at the map edge with its single most salient state showing. You never lose awareness of
     what you left.
466. **Audio-Visual Pairing.** Every visual alarm has a distinct sound *and* every sound has a visual.
     Deaf players lose nothing; players who look away lose nothing. The rack hum, the fan scream, the
     drive click, the breaker snap, the badge beep, the coin chime, the receipt printer, the pager.

### 8.10 Era & period detail (art bible notes)

467. **1990s Kit.** Beige plastic with yellowing, 5.25" bays, turbo buttons, CRT monitors with visible
     curvature and a slow degauss wobble, ribbon cables, a wall of RJ11, a laser printer the size of a
     dishwasher, a whiteboard with a phone list, a fax machine, cigarette burns on the desk.
468. **2000s Kit.** Blue LEDs everywhere (period-correct and hilarious), 1U pizza boxes with front
     bezels, KVM switches, a rack-mount CRT on a sliding tray, Cat5 in beige, a wall-mount ISDN box,
     a Foosball table nobody uses.
469. **2010s Kit.** Black mesh bezels, orange/aqua fiber, blade chassis, hot-aisle containment, cable
     management arms, a wall of identical 2U boxes, a NOC with three ultrawides and a Nagios wall of
     amber.
470. **2020s Kit.** High-density, liquid cooling manifolds, 400G optics, QSFP breakout fans-out,
     rear-door heat exchangers, OCP-style open racks with busbars, a GPU rack with its own dedicated
     feeder, a Grafana wall that is mostly dark-mode purple.
471. **Near-Future Kit.** Immersion tanks, optical interconnect glow, modular data halls that arrive
     on trucks as containers, robotic maintenance rovers on the aisle floor, translucent status
     surfaces on rack doors, and a facility that is entirely unlit because nothing human works there —
     which makes the one time you walk in with a flashlight *tremendous*.
472. **The Sticker Archaeology.** Gear carries stickers from its era: asset tags, warranty voids,
     "PROPERTY OF," a dead vendor's logo, a previous owner's hostname scratched out. Inherited gear in
     the acquisition level is a whole visual story told in stickers.
473. **The Cable Archaeology.** Old cable colors persist. A facility that's been through four eras has
     beige Cat5, grey Cat5e, blue Cat6, and aqua fiber all in the same tray. You can date a rack by
     its cabling, and the game should let you.

### 8.11 Key art, marketing, and shareable moments

474. **The Money Shot.** Every campaign should build toward one image: the camera pulls back through
     the hot aisle, past the containment glass, out the door, up over the campus, and the sign lights
     up. Design it early and make sure the engine can shoot it.
475. **The Rack Portrait.** A poster-style render of a single rack with its elevation labels, in
     cyanotype or in full color. Cheap to generate, deeply satisfying to own, perfect share asset.
476. **The Before/After Slider.** Auto-captured screenshots from level start and level end, presented
     as a draggable comparison. Zero design cost, maximum "look what I did."
477. **The Incident Poster.** A stylized commemoration of your worst outage: the date, the duration,
     the cause icon, and a dramatic render of the moment it peaked. Gallows humor as collectible art.
478. **The Company Letterhead.** An auto-generated letterhead with your logo, name, and tagline that
     frames report cards, invoices, and postmortems. Ties all your paper UI together into one brand.

### 8.12 The LOD contract (the spec that makes all of the above possible)

479. **Every Entity Declares Five Things.** (1) Full sprite + animation set. (2) A 16px icon.
     (3) A single semantic color + a 4px pip shape. (4) Its contribution to its parent's aggregate
     glyph. (5) Its one-line inspector summary. Nothing enters the game without all five. This is the
     art pipeline rule that keeps the endgame readable and it should be enforced by tooling.
480. **The Salience Score.** Every entity computes a salience number each frame (severity × recency ×
     player-pinned). Parent containers display only their highest-salience child. This is Law 3 made
     mechanical, and it's what prevents the Christmas-tree failure mode.
481. **The Zoom Budget.** Hard caps per tier: Tier 0 ≤ 40 animated entities, Tier 1 ≤ 120, Tier 2 ≤
     400, Tier 3 ≤ 1200 (mostly static tiles), Tier 4 ≤ 300 (large objects), Tier 5 ≤ 200 (map marks).
     Everything above the cap merges. Performance and readability solved by the same rule.

---

## 9. Anything Else — Modes, Twists, Humor, Meta

482. **Photo Mode / Rack Portrait Studio.** Full framing controls, time-of-day, hide-HUD, lens options,
     a title-card generator, and export. In a game about building a beautiful thing, letting players
     photograph it is most of the meta-game for free.
483. **Sandbox — "Rack Builder."** No threats, no money. Just build the most beautiful, tidy, correctly
     cabled facility you can, with a cable-neatness score and a shareable elevation PDF-alike. This
     will be someone's favorite mode and it costs almost nothing on top of the main game.
484. **Blueprint Export.** Any facility exports as a cyanotype schematic plus a rack elevation set.
     Suitable for a desktop wallpaper. Also, genuinely, the thing players will post.
485. **"On-Call Night" — Endless Mode.** A single night shift, escalating incidents, no building
     allowed (you can only operate what exists). The screen slowly dims toward dawn; the coffee cups
     accumulate on your desk as a visible timer. Score = incidents survived. The most atmospheric
     mode in the design and the one that best captures the actual job.
486. **"Two Datacenters, One Phone" — Co-op.** Split responsibilities: one player has the floor
     (physical), one has the network/logical view. They literally see different overlays of the same
     facility and must describe things to each other. The Locate Beacon (§4.179) becomes the
     communication tool. Built-in comedy, built-in tension.
487. **Attacker vs Operator (asymmetric versus).** One player builds and defends; the other spends a
     budget on threats from the bestiary and chooses timing and targets. The attacker's UI is a dark,
     minimal terminal that only shows what reconnaissance has revealed — so the two players are
     playing visually *opposite* games. Enormous style opportunity.
488. **Daily Incident.** One shared scenario per day, fixed seed, leaderboard by incident cost. A
     five-minute puzzle with a fixed facility you didn't build (and therefore don't understand) —
     which is, again, exactly the real job.
489. **Museum Mode / The Era Gallery.** A walk-through hall where each era's facility is preserved as
     a diorama with a placard. Pure art showcase, doubles as a tutorial reference, and makes the
     era work pay off twice.
490. **The Screensaver.** A slow, idle camera drifting through your finished facility with the LEDs
     breathing and the fans humming. Ship it. People will leave it running.
491. **Sticker Pack Cosmetics.** Unlockable stickers you place on your own gear, plus custom Dymo
     labels you can type. Player-authored labels are the single cheapest source of joy available and
     they show up in every screenshot.
492. **Cosmetic Economy (non-pay).** Rack faceplate styles, LED colors (including the tasteless
     all-blue 2004 pack), cable color schemes, floor tile patterns, company logo kit, sign fonts,
     NOC wallpaper. All earned, all visible, all screenshot-relevant.
493. **The Logo Generator.** Procedural company logo builder (mark + wordmark + color) that then
     appears on your sign, your letterhead, your invoices, your staff badges, your gear asset tags,
     and the lobby wall. One system, dozens of placements, enormous ownership return.
494. **Customer Logo Generator.** Same system, applied to auto-generated customers, so your contract
     cards and logo wall are full of plausible fake companies with plausible fake logos. Instant
     world texture.
495. **The Office Cat.** An NPC cat that sleeps on the warmest rack. Where it sleeps is *actually* a
     heat indicator. Fully diegetic monitoring. It occasionally walks across a keyboard.
496. **The Doorstop.** A decommissioned Sun/SGI/DEC box used to prop open a door, rendered lovingly.
     Occasionally an achievement makes you realize it's still in DNS.
497. **The "DO NOT UNPLUG" Post-it.** A placeable sticky note. Objects with one are excluded from bulk
     operations. Player-authored safety rails as physical objects.
498. **The Unlabeled Cable Achievement.** "Found It" — successfully trace a mystery cable (§7.356).
499. **The Ops Diary Comic.** At level end, the game auto-generates a 6-panel comic strip from your
     incident timeline, using the actual screenshots stylized with halftone and hand-lettered captions
     pulled from your event log. Shareable, hilarious, and built entirely from data you already have.
500. **The Postmortem Blog.** Your published postmortems accumulate into a fake company engineering
     blog you can browse, complete with era-appropriate web design (a 1998 one has a tiled background
     and an under-construction GIF). Best single joke in the game.
501. **Rack Cards (collectibles).** Every piece of hardware you've ever run gets a trading card with
     a gorgeous illustration, its spec, its era, and your personal stats with it ("42 units deployed,
     3,110 days of service, 6 failures"). A hardware nostalgia engine.
502. **The Hall of Fame Drive.** The single drive in your company with the longest uptime gets a
     little crown and a plaque. When it finally dies, there's a short, genuinely sad animation.
503. **The Seasonal Decoration Pack.** Tinsel on the racks in December, which very slightly increases
     fire risk. Perfect.
504. **Twitch/Streamer Layout.** A HUD preset with bigger fonts, a simplified alert stack, and a
     "what just happened" caption bar that narrates events in plain language for viewers. Also a
     spectator camera that auto-pounces on incidents.
505. **Modding: Skin Packs.** The Identity Kit manifest (§8.441) is data. Ship it as moddable JSON +
     sprite sheets so the community can build "1980s mainframe hosting," "space station colo,"
     "solarpunk edge," "cursed basement host." The per-type visual system is *designed* to be modded.
506. **The Cursed Basement.** A joke level with a residential basement, a consumer router, an
     extension cord daisy chain, and a window AC unit. Everything is wrong and the art should revel
     in it. Also a surprisingly good tutorial for *why* the real stuff exists.
507. **The Whiteboard Mode.** Draw on the world with a marker tool; your annotations persist and are
     visible in screenshots and to co-op partners. Arrows, circles, and "WHY IS THIS HERE?"
508. **Accessibility Replay.** Every incident can be replayed at 0.25× with all overlays on and a
     narrated caption track. Both an accessibility feature and the best tutorial format available.
509. **The Difficulty Called "Realistic."** Turns off the alert stack. You only find out about
     problems by *looking*. The lighting, the LEDs, the fan noise, the cat, and the airflow streamers
     become your entire monitoring system. A whole difficulty mode built purely out of the art.
510. **The End Credits Roll Down a Cable Tray.** Because of course they do.

---

## Appendix: the one-page style guide this document implies

- **Layers:** World (iso pixel, muted materials) · Signal (flat vector, saturated semantics) ·
  Chrome (instrument/terminal, monospace numerics).
- **Reserved hues:** cyan = visitors · magenta = threats · green/amber/red = owned-thing health ·
  gold = money · violet = compliance · white = emergency · blue strobe = locate.
- **Motion:** breathing LEDs at idle; motion reserved for "act now"; shake for four events only.
- **Cable code:** amber copper · aqua fiber · black/red power A/B · grey OOB · violet cross-connect ·
  white "temporary."
- **LED grammar:** slow green breath / fast green / amber steady / amber blink / red steady /
  red blink / blue / off.
- **Camera ladder:** Chassis · Rack Elevation · Room Iso · Floor Plan · Campus · Globe.
- **Every entity ships:** sprite set · 16px icon · 4px pip + shape · aggregate contribution ·
  one-line summary.
- **Every level ships:** a Visual Identity Kit, a hero object, a HUD gauge swap, and a money shot.
