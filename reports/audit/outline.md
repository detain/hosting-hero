# hosting_game.md — Complete Heading Outline

- Generated: 2026-10-09 (read-only audit; generator: /tmp/opencode/gen_outline.py)
- Source: `hosting_game.md`, 35507 lines, git HEAD `58f5186e5a1cc51e1cf6917800c0544acc21c098`, blob `0ac10cd305016b997c889f83d52682312c468a67`
- Law: end line = line before the next heading at same-or-higher level; last heading runs to EOF. Fenced code blocks excluded (verified: zero headings inside them).
- Reconciled against plain grep: `^# `=11, `^## `=150, `^### `=3440; no `^####+` headings exist.
- The 11 level-1 headings = unnumbered document title (line 1, holds the Table of Contents preamble) + numbered sections `# 0` … `# 9`.

## Table 1 — Level-1 sections (`^# `)

| order | heading | start | end | lines | ## count | ### count |
|---|---|---|---|---|---|---|
| preamble | Hosting Company Tower Defense — Merged Idea Document | 1 | 215 | 215 | 1 | 0 |
| 0 | 0. Foundations | 216 | 734 | 519 | 6 | 43 |
| 1 | 1. Levels, scenarios, and progression | 735 | 5995 | 5261 | 15 | 405 |
| 2 | 2. Threats | 5996 | 11397 | 5402 | 27 | 568 |
| 3 | 3. Visitors, traffic, and clients | 11398 | 14858 | 3461 | 12 | 401 |
| 4 | 4. Buildables: services and infrastructure | 14859 | 19281 | 4423 | 14 | 467 |
| 5 | 5. Unlocks and discovery | 19282 | 21843 | 2562 | 12 | 287 |
| 6 | 6. Economy, money, and scoring | 21844 | 25650 | 3807 | 16 | 374 |
| 7 | 7. Core gameplay mechanics | 25651 | 28896 | 3246 | 16 | 286 |
| 8 | 8. Visuals and presentation | 28897 | 32667 | 3771 | 18 | 339 |
| 9 | 9. Anything else | 32668 | 35507 | 2840 | 13 | 270 |
| TOTAL | (sections tile the file exactly) | 1 | 35507 | 35507 | 150 | 3440 |

## Table 2 — Level-2 subsections (`^## `), document order

| in section | heading | start | end | lines | ### count |
|---|---|---|---|---|---|
| preamble | Table of Contents | 43 | 215 | 173 | 0 |
| 0 | 0.1 Design pillars | 222 | 459 | 238 | 21 |
| 0 | 0.2 The hosting-type variety engine (core design pillar) | 460 | 579 | 120 | 11 |
| 0 | 0.3 The hosting-type catalogue and the Scarcity Table | 580 | 633 | 54 | 1 |
| 0 | 0.4 The era axis | 634 | 662 | 29 | 3 |
| 0 | 0.5 Working titles and tone | 663 | 683 | 21 | 3 |
| 0 | 0.6 What wave 2 changed (navigation map) | 684 | 734 | 51 | 4 |
| 1 | 1.1 The scale ladder (campaign spine) | 737 | 1176 | 440 | 22 |
| 1 | 1.2 Perspective-shift levels | 1177 | 1501 | 325 | 24 |
| 1 | 1.3 Hosting-type levels (the variety engine as content) | 1502 | 3003 | 1502 | 65 |
| 1 | 1.4 Cross-type and structural levels | 3004 | 3122 | 119 | 9 |
| 1 | 1.5 Scenario library (one-off missions) | 3123 | 4231 | 1109 | 102 |
| 1 | 1.6 Progression shape between levels | 4232 | 4552 | 321 | 28 |
| 1 | 1.7 Difficulty curve craft | 4553 | 4791 | 239 | 20 |
| 1 | 1.8 Tier postcards: the visual identity of each scale | 4792 | 4933 | 142 | 15 |
| 1 | 1.9 Level grammar and authoring laws | 4934 | 5094 | 161 | 11 |
| 1 | 1.10 In-level structure: shifts, windows, forks and framing | 5095 | 5216 | 122 | 11 |
| 1 | 1.11 Campaign metagame and topology | 5217 | 5367 | 151 | 17 |
| 1 | 1.12 New level shapes and business-layer levels | 5368 | 5775 | 408 | 37 |
| 1 | 1.13 Level modifiers and mutators | 5776 | 5889 | 114 | 27 |
| 1 | 1.14 Boss-shaped events (the end-of-quarter beat) | 5890 | 5944 | 55 | 11 |
| 1 | 1.15 Era treatments and presentation devices | 5945 | 5995 | 51 | 6 |
| 2 | 2.1 Threat design principles and the role taxonomy | 5998 | 6285 | 288 | 23 |
| 2 | 2.2 Ambient weather (constant background noise) | 6286 | 6420 | 135 | 13 |
| 2 | 2.3 Volumetric and protocol floods | 6421 | 6730 | 310 | 23 |
| 2 | 2.4 Mimics: threats that look like visitors | 6731 | 6859 | 129 | 10 |
| 2 | 2.5 Application, injection, and data threats | 6860 | 7151 | 292 | 22 |
| 2 | 2.6 Credential, access, and human threats | 7152 | 7346 | 195 | 17 |
| 2 | 2.7 Infrastructure and network threats | 7347 | 7640 | 294 | 31 |
| 2 | 2.8 Entropy: hardware, power, cooling, and physics | 7641 | 8016 | 376 | 33 |
| 2 | 2.9 Self-inflicted and operational failures | 8017 | 8483 | 467 | 49 |
| 2 | 2.10 Business, financial, and reputational threats | 8484 | 9152 | 669 | 76 |
| 2 | 2.11 Attacker archetypes (the "who") | 9153 | 9438 | 286 | 28 |
| 2 | 2.12 Type-specific threats | 9439 | 10054 | 616 | 93 |
| 2 | 2.13 Threat behaviour rules and modifiers | 10055 | 10157 | 103 | 8 |
| 2 | 2.14 Supply chain, logistics, and procurement threats | 10158 | 10296 | 139 | 18 |
| 2 | 2.15 Utility, environmental, and civic threats | 10297 | 10415 | 119 | 14 |
| 2 | 2.16 AI-era and modern threats | 10416 | 10501 | 86 | 9 |
| 2 | 2.17 Structural and systemic threats | 10502 | 10603 | 102 | 11 |
| 2 | 2.18 Storage, virtualization, and capacity failures | 10604 | 10687 | 84 | 9 |
| 2 | 2.19 Identity, time, and trust failures | 10688 | 10744 | 57 | 5 |
| 2 | 2.20 Abuse-desk and legal-pressure threats | 10745 | 10819 | 75 | 10 |
| 2 | 2.21 Cost attacks (denial of wallet) | 10820 | 10863 | 44 | 4 |
| 2 | 2.22 HUD attacks: threats against your information | 10864 | 10923 | 60 | 8 |
| 2 | 2.23 Overcorrection: threats that punish paranoia | 10924 | 10972 | 49 | 7 |
| 2 | 2.24 Threat economy, wave composition, and generator systems | 10973 | 11050 | 78 | 15 |
| 2 | 2.25 Boss design and campaign-scale threats | 11051 | 11097 | 47 | 5 |
| 2 | 2.26 Threat presentation language (the visual grammar of §2) | 11098 | 11309 | 212 | 24 |
| 2 | 2.27 Threat-to-hosting-type matrices | 11310 | 11397 | 88 | 3 |
| 3 | 3.1 The visitor model | 11422 | 11925 | 504 | 43 |
| 3 | 3.2 Visitor archetypes | 11926 | 12459 | 534 | 64 |
| 3 | 3.3 What "a visitor" is per hosting type | 12460 | 12822 | 363 | 44 |
| 3 | 3.4 Why visitors bounce | 12823 | 13067 | 245 | 35 |
| 3 | 3.5 Customer and client archetypes | 13068 | 13371 | 304 | 44 |
| 3 | 3.6 Attraction and acquisition channels | 13372 | 13845 | 474 | 48 |
| 3 | 3.7 Conversion, churn, and retention | 13846 | 14166 | 321 | 35 |
| 3 | 3.8 Segmentation and positioning | 14167 | 14231 | 65 | 7 |
| 3 | 3.9 The client (tenant) system | 14232 | 14417 | 186 | 15 |
| 3 | 3.10 Support and tickets as a visitor-facing system | 14418 | 14489 | 72 | 10 |
| 3 | 3.11 The sales pipeline and the deal | 14490 | 14580 | 91 | 14 |
| 3 | 3.12 The visual grammar of visitors, clients, and the front of house | 14581 | 14858 | 278 | 42 |
| 4 | 4.1 Design rules for buildables | 14875 | 15313 | 439 | 38 |
| 4 | 4.2 Compute and application tier | 15314 | 15559 | 246 | 23 |
| 4 | 4.3 Data and storage tier | 15560 | 15826 | 267 | 22 |
| 4 | 4.4 Network and edge | 15827 | 16284 | 458 | 38 |
| 4 | 4.5 Defenses | 16285 | 16695 | 411 | 33 |
| 4 | 4.6 Observability and response | 16696 | 16971 | 276 | 22 |
| 4 | 4.7 Facility | 16972 | 17543 | 572 | 57 |
| 4 | 4.8 Staff | 17544 | 17937 | 394 | 41 |
| 4 | 4.9 The business machine | 17938 | 18705 | 768 | 79 |
| 4 | 4.10 Type-specific buildables | 18706 | 19031 | 326 | 69 |
| 4 | 4.11 Non-physical buildables: policy, process and paper | 19032 | 19139 | 108 | 20 |
| 4 | 4.12 Productization: turning operations into SKUs | 19140 | 19207 | 68 | 16 |
| 4 | 4.13 Rentals, burst, and the panic economy | 19208 | 19249 | 42 | 7 |
| 4 | 4.14 Where the business machine lives: the mezzanine and the desk grammar | 19250 | 19281 | 32 | 2 |
| 5 | 5.1 Unlock philosophy | 19284 | 19494 | 211 | 15 |
| 5 | 5.2 Scar-driven unlocks (pain → capability) | 19495 | 19817 | 323 | 68 |
| 5 | 5.3 Milestone unlocks | 19818 | 19901 | 84 | 5 |
| 5 | 5.4 Discovery mechanics | 19902 | 20542 | 641 | 70 |
| 5 | 5.5 Tech tree branches and shapes | 20543 | 20755 | 213 | 15 |
| 5 | 5.6 Unlocking whole lines of hosting business | 20756 | 21009 | 254 | 18 |
| 5 | 5.7 Anti-unlocks, deprecation, and rot | 21010 | 21163 | 154 | 17 |
| 5 | 5.8 Unlock presentation and payoff | 21164 | 21431 | 268 | 35 |
| 5 | 5.9 Credentials, permissions, and accreditation (the unlocks you cannot buy) | 21432 | 21549 | 118 | 8 |
| 5 | 5.10 Reputation and social-proof unlocks | 21550 | 21615 | 66 | 9 |
| 5 | 5.11 Staff, organizational, and knowledge unlocks | 21616 | 21714 | 99 | 15 |
| 5 | 5.12 The research economy and unlock pacing | 21715 | 21843 | 129 | 12 |
| 6 | 6.1 The currency set | 21857 | 22080 | 224 | 16 |
| 6 | 6.2 Revenue streams | 22081 | 22382 | 302 | 37 |
| 6 | 6.3 Costs | 22383 | 22749 | 367 | 31 |
| 6 | 6.4 Cash-flow mechanics | 22750 | 22939 | 190 | 18 |
| 6 | 6.5 Pricing as a mechanic | 22940 | 23260 | 321 | 29 |
| 6 | 6.6 Per-type economics | 23261 | 23566 | 306 | 21 |
| 6 | 6.7 Money-moving events | 23567 | 23751 | 185 | 23 |
| 6 | 6.8 The metrics HUD | 23752 | 23883 | 132 | 15 |
| 6 | 6.9 Scoring and end-of-level rating | 23884 | 24385 | 502 | 51 |
| 6 | 6.10 Win and lose conditions | 24386 | 24573 | 188 | 21 |
| 6 | 6.11 Financing instruments | 24574 | 24717 | 144 | 16 |
| 6 | 6.12 Contract and term structure | 24718 | 24901 | 184 | 15 |
| 6 | 6.13 Restricted cash and the balance sheet | 24902 | 25052 | 151 | 16 |
| 6 | 6.14 Multi-line, transition, and portfolio economics | 25053 | 25183 | 131 | 10 |
| 6 | 6.15 The money design language (drawing the economy) | 25184 | 25460 | 277 | 51 |
| 6 | 6.16 Baseline tuning numbers | 25461 | 25650 | 190 | 4 |
| 7 | 7.1 The board: flow, topology, and the two directions | 25653 | 25909 | 257 | 22 |
| 7 | 7.2 Connections: the central interaction | 25910 | 26328 | 419 | 36 |
| 7 | 7.3 Placement and space | 26329 | 26484 | 156 | 16 |
| 7 | 7.4 Upgrades | 26485 | 26638 | 154 | 16 |
| 7 | 7.5 Time, tempo, and player actions | 26639 | 27078 | 440 | 36 |
| 7 | 7.6 Information, fog, and diagnosis | 27079 | 27379 | 301 | 25 |
| 7 | 7.7 Failure, recovery, and consequence | 27380 | 27738 | 359 | 32 |
| 7 | 7.8 Per-type mechanical shifts | 27739 | 27923 | 185 | 23 |
| 7 | 7.9 Meta-loops and rhythm | 27924 | 28016 | 93 | 8 |
| 7 | 7.10 Path shaping: the Millisecond Budget, Inspection Depth, and Suspicion Routing | 28017 | 28178 | 162 | 8 |
| 7 | 7.11 QoS and traffic prioritisation | 28179 | 28250 | 72 | 4 |
| 7 | 7.12 The resource model: what is actually scarce | 28251 | 28321 | 71 | 4 |
| 7 | 7.13 The simulation loop, written down | 28322 | 28440 | 119 | 7 |
| 7 | 7.14 Automation, standing policy, and the policy UI | 28441 | 28585 | 145 | 12 |
| 7 | 7.15 The commercial board: the other half of the map | 28586 | 28785 | 200 | 23 |
| 7 | 7.16 Interaction laws and readability at scale | 28786 | 28896 | 111 | 14 |
| 8 | 8.1 Art direction candidates | 28928 | 29128 | 201 | 18 |
| 8 | 8.2 Rendering rules, colour language, and shape tokens | 29129 | 29570 | 442 | 27 |
| 8 | 8.3 Camera, altitudes, and level of detail | 29571 | 29740 | 170 | 17 |
| 8 | 8.4 What infrastructure looks like | 29741 | 30117 | 377 | 36 |
| 8 | 8.5 What threats look like | 30118 | 30334 | 217 | 14 |
| 8 | 8.6 What visitors look like | 30335 | 30521 | 187 | 15 |
| 8 | 8.7 Expressing actions, money, and state | 30522 | 30888 | 367 | 34 |
| 8 | 8.8 UI and HUD | 30889 | 31411 | 523 | 59 |
| 8 | 8.9 Readability at scale | 31412 | 31560 | 149 | 19 |
| 8 | 8.10 Per-type and per-era visual identity | 31561 | 31912 | 352 | 22 |
| 8 | 8.11 Audio | 31913 | 32052 | 140 | 17 |
| 8 | 8.12 Presentation moments and the effects catalogue | 32053 | 32169 | 117 | 11 |
| 8 | 8.13 Animation and motion language | 32170 | 32241 | 72 | 9 |
| 8 | 8.14 Accessibility, colour-blind safety, and redundant encoding | 32242 | 32345 | 104 | 13 |
| 8 | 8.15 Typography, numbers, and iconography | 32346 | 32448 | 103 | 10 |
| 8 | 8.16 The production asset spec, acceptance tests, and style guide | 32449 | 32556 | 108 | 7 |
| 8 | 8.17 Photo mode, key art, and shareable artifacts | 32557 | 32624 | 68 | 8 |
| 8 | 8.18 The visual-coverage audit — systems that had no picture | 32625 | 32667 | 43 | 3 |
| 9 | 9.1 Modes | 32679 | 33158 | 480 | 42 |
| 9 | 9.2 Twists and systemic wildcards | 33159 | 33931 | 773 | 71 |
| 9 | 9.3 Humour and tone | 33932 | 34259 | 328 | 32 |
| 9 | 9.4 Meta systems | 34260 | 34501 | 242 | 23 |
| 9 | 9.5 The educational angle | 34502 | 34649 | 148 | 11 |
| 9 | 9.6 Design guardrails | 34650 | 34835 | 186 | 21 |
| 9 | 9.7 Long-tail and stretch ideas | 34836 | 34933 | 98 | 10 |
| 9 | 9.8 Onboarding, difficulty and assistance | 34934 | 35030 | 97 | 10 |
| 9 | 9.9 Endings and the shape of a finish | 35031 | 35099 | 69 | 7 |
| 9 | 9.10 Community, cosmetics and exportable artifacts | 35100 | 35228 | 129 | 17 |
| 9 | 9.11 Production guardrails and responsible depiction | 35229 | 35285 | 57 | 4 |
| 9 | 9.12 Small ideas that didn't fit anywhere else | 35286 | 35397 | 112 | 15 |
| 9 | 9.13 Design priorities — the wave-2 closing notes | 35398 | 35507 | 110 | 7 |

## Table 3 — Level-3 headings (`^### `), document order

| in subsection | heading | start | end | lines |
|---|---|---|---|---|
| 0.1 | P1 — The Shared Pipe | 224 | 240 | 17 |
| 0.1 | P2 — Capability vs. Surface | 241 | 253 | 13 |
| 0.1 | P3 — Peacetime is the Real Boss | 254 | 263 | 10 |
| 0.1 | P4 — Attention is a Resource | 264 | 274 | 11 |
| 0.1 | P5 — Legibility Under Load | 275 | 283 | 9 |
| 0.1 | P6 — The same pipe carries the thing you want and the thing you fear | 284 | 290 | 7 |
| 0.1 | P7 — Ship the real monsters | 291 | 305 | 15 |
| 0.1 | P8 — The business is the other half of the game | 306 | 316 | 11 |
| 0.1 | P9 — The reward loop is on letting through, not shooting down | 317 | 325 | 9 |
| 0.1 | P10 — Almost nothing you do has an immediate result | 326 | 336 | 11 |
| 0.1 | P11 — Hosting is billed in terms, not in months | 337 | 350 | 14 |
| 0.1 | P12 — Revenue has a colour, not just a size | 351 | 361 | 11 |
| 0.1 | P13 — The contract is a tower | 362 | 371 | 10 |
| 0.1 | P14 — Money you can't touch is not money | 372 | 381 | 10 |
| 0.1 | P15 — A pivot is a double-carry, not a switch | 382 | 390 | 9 |
| 0.1 | P16 — Path shaping, not just tower shopping | 391 | 402 | 12 |
| 0.1 | P17 — Defenses need roles, and coverage must be legible | 403 | 411 | 9 |
| 0.1 | P18 — There must be something you spend to win *right now* | 412 | 422 | 11 |
| 0.1 | P19 — A tension without a number is a mood, not a mechanic | 423 | 433 | 11 |
| 0.1 | P20 — The boring middle of the job is the unmined content | 434 | 445 | 12 |
| 0.1 | P21 — Every mechanically-defined system owes a visual | 446 | 459 | 14 |
| 0.2 | The Ruleset Card | 470 | 488 | 19 |
| 0.2 | The Three-Change Rule (design law) | 489 | 495 | 7 |
| 0.2 | The Verb Shift Rule | 496 | 503 | 8 |
| 0.2 | The Business Line System | 504 | 513 | 10 |
| 0.2 | The Portfolio Meter | 514 | 522 | 9 |
| 0.2 | Line Synergies | 523 | 533 | 11 |
| 0.2 | Line Antagonisms | 534 | 541 | 8 |
| 0.2 | The "What Are We Even" identity stat | 542 | 548 | 7 |
| 0.2 | Control Granularity as a difficulty axis | 549 | 559 | 11 |
| 0.2 | Same event, different crisis (the proof the engine works) | 560 | 568 | 9 |
| 0.2 | The Five-Asset Skin Kit (production spec) | 569 | 579 | 11 |
| 0.3 | Type-specific "fifth axis" scoring | 620 | 633 | 14 |
| 0.4 | Era × Type is a 2D content grid | 636 | 644 | 9 |
| 0.4 | The Era Campaign ("From Dial-Up to GPU") | 645 | 653 | 9 |
| 0.4 | The Era-Transition Cutscene | 654 | 662 | 9 |
| 0.5 | Working title candidates | 665 | 669 | 5 |
| 0.5 | Tonal target | 670 | 676 | 7 |
| 0.5 | The emotional arc | 677 | 683 | 7 |
| 0.6 | The nine biggest structural additions | 690 | 706 | 17 |
| 0.6 | Whole hosting business families added in wave 2 | 707 | 715 | 9 |
| 0.6 | Threat space that was half-covered and is now filled | 716 | 723 | 8 |
| 0.6 | Known live disagreements | 724 | 734 | 11 |
| 1.1 | The four ladders, and which one is the campaign (contradiction resolution) | 749 | 771 | 23 |
| 1.1 | Tier 0 — "Hello World" / `index.html` / "Inside the Box" | 772 | 803 | 32 |
| 1.1 | Tier 0.5 — "The Noisy Neighbor" (the shared resource) | 804 | 819 | 16 |
| 1.1 | Tier 1 — "One Box" / `root@localhost` / "Your Own Box" | 820 | 839 | 20 |
| 1.1 | Tier 2 — "Two U in Someone Else's Cage" / `Cage 14, Row C` | 840 | 865 | 26 |
| 1.1 | Tier 2.5 — "A Rack Of Our Own" | 866 | 878 | 13 |
| 1.1 | Tier 3 — "The Stack" / "The Cage" / `prod` | 879 | 902 | 24 |
| 1.1 | Tier 3.5 — "The Platform" (you sell an API; other people build on you) | 903 | 913 | 11 |
| 1.1 | Tier 4 — "Landlord" / "The Floor" / "We Are The Datacenter" / `Suite 200` | 914 | 942 | 29 |
| 1.1 | Tier 5 — "Anycast" / "The Map" / "Two Datacenters, One Company" | 943 | 968 | 26 |
| 1.1 | Tier 6 — "Hyperscale" / "Region Build" / "The Grid" (endgame) | 969 | 990 | 22 |
| 1.1 | The difficulty comes from coupling, not HP (design rule) | 991 | 1005 | 15 |
| 1.1 | The camera ladder (six fixed tiers as authored art treatments) | 1006 | 1018 | 13 |
| 1.1 | The Elevator Transition | 1019 | 1026 | 8 |
| 1.1 | Zoom-as-Abstraction (the LOD swap) | 1027 | 1037 | 11 |
| 1.1 | The Scale Handshake Frame | 1038 | 1047 | 10 |
| 1.1 | Per-Tier Composition Rules | 1048 | 1057 | 10 |
| 1.1 | The Aisle Vanishing Point | 1058 | 1065 | 8 |
| 1.1 | The Growth Scar | 1066 | 1074 | 9 |
| 1.1 | The parallel business ladder (CEO framing) | 1075 | 1136 | 62 |
| 1.1 | The business difficulty curve | 1137 | 1155 | 19 |
| 1.1 | The P&L Ladder (financial complexity as a gated HUD) | 1156 | 1176 | 21 |
| 1.2 | The Invariant-Core filter (authoring law for every perspective level) | 1184 | 1198 | 15 |
| 1.2 | The Perspective Frame Device | 1199 | 1218 | 20 |
| 1.2 | `The Tenant` / "The Customer" | 1219 | 1231 | 13 |
| 1.2 | `Red Team Friday` | 1232 | 1247 | 16 |
| 1.2 | `The NOC Shift` / "On-Call Night" | 1248 | 1261 | 14 |
| 1.2 | `The New Hire` | 1262 | 1280 | 19 |
| 1.2 | `The Auditor` / "Audit Week" | 1281 | 1298 | 18 |
| 1.2 | `The Auditor, Inverted` | 1299 | 1305 | 7 |
| 1.2 | `The Datacenter Tech` / "Remote Hands" | 1306 | 1324 | 19 |
| 1.2 | `The Migration Crew` / `The Migration` | 1325 | 1340 | 16 |
| 1.2 | `The Abuse Desk` | 1341 | 1357 | 17 |
| 1.2 | `The Support Queue Level` | 1358 | 1375 | 18 |
| 1.2 | `The Landlord` | 1376 | 1384 | 9 |
| 1.2 | `The CDN` | 1385 | 1390 | 6 |
| 1.2 | `The Upstream` | 1391 | 1397 | 7 |
| 1.2 | `The Registrar` / `NXDOMAIN` | 1398 | 1405 | 8 |
| 1.2 | `Eyes of the Packet` | 1406 | 1414 | 9 |
| 1.2 | `Founder Mode` / "The CEO Chair" | 1415 | 1430 | 16 |
| 1.2 | `The Sales Chair` | 1431 | 1438 | 8 |
| 1.2 | `The Board Meeting` | 1439 | 1445 | 7 |
| 1.2 | `Due Diligence` (walking someone else's floor) | 1446 | 1453 | 8 |
| 1.2 | `The Capacity Planner` | 1454 | 1459 | 6 |
| 1.2 | `The Apprentice` (you may only write rules) | 1460 | 1468 | 9 |
| 1.2 | `The Acquisition` (fogged inheritance) | 1469 | 1501 | 33 |
| 1.3 | Authoring requirements for every hosting-type entry (design law) | 1510 | 1518 | 9 |
| 1.3 | The Visual Identity Kit (one "visual chord" per hosting type) | 1519 | 1529 | 11 |
| 1.3 | "The Mass Host" / "Cabinet 14" — Shared web hosting (cPanel-style) | 1530 | 1563 | 34 |
| 1.3 | "Four Hundred Identical Sites" / "Managed Everything" / "White Glove" — Managed WordPress / managed app | 1564 | 1582 | 19 |
| 1.3 | "Node 14 Is Full" — VPS / cloud instances | 1583 | 1600 | 18 |
| 1.3 | "Root Is Theirs" — Dedicated servers / bare metal | 1601 | 1617 | 17 |
| 1.3 | "Amps and Aisles" / "Cage 7" / "The Landlord's Grid" — Colocation landlord | 1618 | 1678 | 61 |
| 1.3 | "Cage Match" / "Build-to-Suit" / "The Shell" — Wholesale / hyperscale shells | 1679 | 1694 | 16 |
| 1.3 | "Prime Time" / "Tick Rate" / "The Arena" — Game server hosting | 1695 | 1741 | 47 |
| 1.3 | "The Launch Window" — Game hosting, scenario variant | 1742 | 1749 | 8 |
| 1.3 | "Private Shard" — Community / MMO hosting | 1750 | 1755 | 6 |
| 1.3 | "Trunk Group" / "The Switchboard" — VoIP / SIP trunking | 1756 | 1778 | 23 |
| 1.3 | "Postmaster" / "Deliverability" / "The Post Office" — Email hosting | 1779 | 1816 | 38 |
| 1.3 | "Authoritative" / "NXDOMAIN" / "Root Zone" — Anycast DNS hosting | 1817 | 1860 | 44 |
| 1.3 | "Edge" / "Cache Hit" / "The Constellation" — CDN | 1861 | 1894 | 34 |
| 1.3 | "Eleven Nines" / "Bucket" / "The Honeycomb" — Object storage | 1895 | 1929 | 35 |
| 1.3 | "Restore Point" / "The Vault" / "Bit Rot" — Backup / archival hosting | 1930 | 1980 | 51 |
| 1.3 | "Declaration Day" — Disaster-Recovery-as-a-Service (the oversubscription level) | 1981 | 2000 | 20 |
| 1.3 | "The Vault Run" / "Bit Rot" / "The Courier" — Offsite tape vaulting | 2001 | 2014 | 14 |
| 1.3 | "Going Live" / "Transcode Queue" / "The Studio" — Video hosting / live streaming | 2015 | 2035 | 21 |
| 1.3 | "Dead Air" — Linear broadcast playout hosting | 2036 | 2053 | 18 |
| 1.3 | "The Seedbox Farm" / "The Warehouse" — Image, file hosting, seedboxes | 2054 | 2068 | 15 |
| 1.3 | "Rack 4 Is 40 Kilowatts" / "Thermal Envelope" / "The Furnace" — GPU / AI compute | 2069 | 2140 | 72 |
| 1.3 | "Hour 39" / "Render Farm" / "The Anthill" / "The Loom" — HPC / render farm | 2141 | 2160 | 20 |
| 1.3 | "Hashrate" / "The Boiler Room" / "The Barn" — Crypto mining hosting | 2161 | 2184 | 24 |
| 1.3 | "The Control Plane" / "Cluster" / "The Yard" / "Namespace" — Kubernetes / PaaS / containers | 2185 | 2210 | 26 |
| 1.3 | "Cold Start" / "The Mayfly Field" / "The Popcorn Pan" — Serverless / functions | 2211 | 2227 | 17 |
| 1.3 | "The Managed Database" / "DBaaS" / "The Cellar" / "Read Replica" — Database-as-a-service | 2228 | 2240 | 13 |
| 1.3 | "Anything Goes" / "No Questions" / "The Back Alley" / "Blacksite" — Bulletproof hosting | 2241 | 2288 | 48 |
| 1.3 | "In Scope" / "Chapter 7 Compliant" / "The Clean Room" / "Chain of Custody" — Regulated hosting (HIPAA/PCI/FedRAMP) | 2289 | 2328 | 40 |
| 1.3 | "FedRAMP Purgatory" — Regulated hosting, the extreme variant | 2329 | 2335 | 7 |
| 1.3 | "The Border" / "Sovereign" — GDPR / data residency / national cloud variant | 2336 | 2348 | 13 |
| 1.3 | "Exchange Colo" / "The Microsecond Cathedral" / "The Meter Stick" — Financial low-latency colocation | 2349 | 2366 | 18 |
| 1.3 | "Pass Window" / "Ground Station" / "The Dish Field" — Satellite ground-station hosting | 2367 | 2384 | 18 |
| 1.3 | "Eighty Little Sites" / "MEC" / "The Roadside" / "The Street Cabinet" — Edge / 5G micro-datacenters | 2385 | 2402 | 18 |
| 1.3 | "The Swarm" / "IoT Backhaul" / "The Hive Hum" — IoT device backends | 2403 | 2415 | 13 |
| 1.3 | "Node Sync" / "The Ledger Wall" / "The Clock Tower" — Blockchain node hosting | 2416 | 2425 | 10 |
| 1.3 | "Busy Signal" / "Ring 0" / "The Modem Wall" / "Dial Tone" — Dial-up ISP (period, ~1996) | 2426 | 2464 | 39 |
| 1.3 | "The Shell Box" / "MOTD" / "The Terminal Room" — BBS / shell accounts / IRC leaf (period) | 2465 | 2478 | 14 |
| 1.3 | "The Usenet Feed" / "The Firehose" / "The Paper Mill" — Usenet (period) | 2479 | 2490 | 12 |
| 1.3 | "Web Ring" — Early web hosting (period) | 2491 | 2499 | 9 |
| 1.3 | "Chain of Trust" / "Trust Store" — Certificate Authority / managed PKI | 2500 | 2539 | 40 |
| 1.3 | "Whois" / "Redemption Grace" — Domain registrar and registry operation | 2540 | 2577 | 38 |
| 1.3 | "The Index" — Package registry / artifact repository hosting | 2578 | 2601 | 24 |
| 1.3 | "Who Watches" / "Cardinality" — Monitoring / observability as a service | 2602 | 2639 | 38 |
| 1.3 | "Mirror" — Open-source distribution mirror hosting | 2640 | 2655 | 16 |
| 1.3 | "Green Light" / "Untrusted Code, By Design" — CI / build-farm hosting | 2656 | 2685 | 30 |
| 1.3 | "Fruit Salad" — Apple / Mac hardware hosting | 2686 | 2704 | 19 |
| 1.3 | "No Logs" — Privacy hosting: VPN endpoints, Tor exits, encrypted mail | 2705 | 2727 | 23 |
| 1.3 | "Zero Knowledge" — Password manager / secrets hosting | 2728 | 2738 | 11 |
| 1.3 | "The Show Floor" — Event, conference and broadcast NOC | 2739 | 2758 | 20 |
| 1.3 | "Sub-100" — Ad-tech / real-time bidding infrastructure | 2759 | 2776 | 18 |
| 1.3 | "The Fabric" — Internet exchange point (IXP) operation | 2777 | 2802 | 26 |
| 1.3 | "Clean Traffic" — DDoS scrubbing as a product | 2803 | 2822 | 20 |
| 1.3 | "In the Container" — Modular / prefab datacenter deployment | 2823 | 2838 | 16 |
| 1.3 | "Chain of Custody" — Secure IT asset disposition (ITAD) and media destruction | 2839 | 2855 | 17 |
| 1.3 | "Stratum One" / "The Roof Antenna" — Time, timing and precision services | 2856 | 2877 | 22 |
| 1.3 | "The Co-op" — Non-profit / member-owned / community hosting | 2878 | 2891 | 14 |
| 1.3 | "The Rig" — Offshore, maritime and extreme-remote hosting | 2892 | 2905 | 14 |
| 1.3 | "Cold Water" — Sustainability-first hosting (heat reuse, immersion, free cooling) | 2906 | 2922 | 17 |
| 1.3 | "Lights Out" — Fully automated / zero-touch facility | 2923 | 2935 | 13 |
| 1.3 | "The Green Screen Annuity" — Legacy / mainframe / AS400 hosting | 2936 | 2955 | 20 |
| 1.3 | "Line of Sight" — Rural wireless ISP (WISP) | 2956 | 2973 | 18 |
| 1.3 | "The Radiologist Is Waiting" — Medical imaging (PACS/DICOM) hosting | 2974 | 2988 | 15 |
| 1.3 | "Authorization" — Payment switch / POS hosting | 2989 | 3003 | 15 |
| 1.4 | `Diversify` / `Two Businesses at Once` | 3006 | 3018 | 13 |
| 1.4 | `Pivot` / "The Pivot Level" | 3019 | 3035 | 17 |
| 1.4 | `The Junk Hardware Acquisition` / "The Junkyard" / "The Junk Drawer" | 3036 | 3051 | 16 |
| 1.4 | `The Landlord and the Tenant` | 3052 | 3060 | 9 |
| 1.4 | `Multi-Line` / "The Convergence Level" / "Everything, Everywhere" | 3061 | 3069 | 9 |
| 1.4 | `The Reseller Channel` — you host hosts who host hosts | 3070 | 3079 | 10 |
| 1.4 | `Tenant-of-a-tenant recursion` | 3080 | 3091 | 12 |
| 1.4 | `Two Brands, One Datacenter` (the fighter-brand level) | 3092 | 3106 | 15 |
| 1.4 | `The Same Outage, Six Ways` | 3107 | 3122 | 16 |
| 1.5 | `Launch Day` / `Hug of Death` / `The Slashdotting` | 3133 | 3159 | 27 |
| 1.5 | `Black Friday` / `Peak Season` | 3160 | 3179 | 20 |
| 1.5 | `Zero Downtime Migration` / `Silent Migration` / `Lift and Shift` | 3180 | 3200 | 21 |
| 1.5 | `Post-Breach` / `The Breach` / `The Suspicious Login` | 3201 | 3227 | 27 |
| 1.5 | `The Sev-0` | 3228 | 3236 | 9 |
| 1.5 | `The Certificate Expired` / `Cert Apocalypse` | 3237 | 3247 | 11 |
| 1.5 | `Mass Revocation` | 3248 | 3258 | 11 |
| 1.5 | `Power Event` / `Black Start` / `Generator Test` | 3259 | 3279 | 21 |
| 1.5 | `EPO` | 3280 | 3294 | 15 |
| 1.5 | `Retransfer` | 3295 | 3306 | 12 |
| 1.5 | `Wet Stacking` | 3307 | 3316 | 10 |
| 1.5 | `Fuel Truck` | 3317 | 3325 | 9 |
| 1.5 | `The Fire Department Cut The Power` | 3326 | 3334 | 9 |
| 1.5 | `Cooling Failure` / `Heatwave` / `Cold Aisle Chaos` / `Heat Dome` | 3335 | 3355 | 21 |
| 1.5 | `The Fiber Cut` / `Cable Cut` / `Fiber Seeking Backhoe` | 3356 | 3368 | 13 |
| 1.5 | `Underwater` | 3369 | 3377 | 9 |
| 1.5 | `Ransomware Sunday` / `Ransomware Friday` | 3378 | 3385 | 8 |
| 1.5 | `Rebuild Window` | 3386 | 3395 | 10 |
| 1.5 | `The Angry Whale` / `The Concentration Crisis` / `The Sole Whale` | 3396 | 3404 | 9 |
| 1.5 | `Compliance Week` / `The Audit` / `Audit Pass` | 3405 | 3416 | 12 |
| 1.5 | `The Copycat` / `The Price War` | 3417 | 3425 | 9 |
| 1.5 | `Hug of Death (Charity Stream)` / `Viral Moment` | 3426 | 3432 | 7 |
| 1.5 | `Viral Customer` | 3433 | 3440 | 8 |
| 1.5 | `Bad Deploy Friday` / `The Ship-It Friday` | 3441 | 3450 | 10 |
| 1.5 | `The Quiet Month` / `Reverse Wave` / `The Good Problem` | 3451 | 3467 | 17 |
| 1.5 | `Peering War` / `Peering Ratio` / `Peer Review` / `Ratio` | 3468 | 3482 | 15 |
| 1.5 | `Upstream Divorce` / `Hostile Upstream` / `Null Route` | 3483 | 3489 | 7 |
| 1.5 | `The Insider` | 3490 | 3496 | 7 |
| 1.5 | `The Fake Employee` | 3497 | 3506 | 10 |
| 1.5 | `Datacenter Build` / `First Watt` | 3507 | 3517 | 11 |
| 1.5 | `Bare Metal Bring-Up` | 3518 | 3523 | 6 |
| 1.5 | `The Regulator` / `The Regulator Calls` / `Regulatory Shift` | 3524 | 3531 | 8 |
| 1.5 | `The Lawful Intercept Request` | 3532 | 3542 | 11 |
| 1.5 | `Sanctions Screening` / `The Sanctioned Tenant` / `Sanction Line` | 3543 | 3554 | 12 |
| 1.5 | `Leap Second / Y2038 / DST` / `The Date Bug` | 3555 | 3561 | 7 |
| 1.5 | `Free Tier Flood` / `Free Tier Abuse` / `Free Tier Invaded` | 3562 | 3569 | 8 |
| 1.5 | `Sold Out` / `Lead Time` | 3570 | 3577 | 8 |
| 1.5 | `The Honeymoon` | 3578 | 3584 | 7 |
| 1.5 | `Two Masters` / `Split Brain` | 3585 | 3592 | 8 |
| 1.5 | `Zero-Day Sunday` / `Zero-Day Tuesday` / `Zero Day Wednesday` / `Patch Tuesday` | 3593 | 3612 | 20 |
| 1.5 | `The Change Freeze` / `Frozen Change` / `Read-Only Friday` | 3613 | 3623 | 11 |
| 1.5 | `Cost Cut` / `Cost Cutting` / `The Bad Quarter` | 3624 | 3633 | 10 |
| 1.5 | `The Long Weekend` / "No Hands" / `Skeleton Crew` / `Founder's Vacation` | 3634 | 3644 | 11 |
| 1.5 | `The Understaffed Sunday` | 3645 | 3653 | 9 |
| 1.5 | `The Intern` | 3654 | 3660 | 7 |
| 1.5 | `The Influencer` / `The Demo` / `The Tour` / `White Glove` | 3661 | 3680 | 20 |
| 1.5 | `Chip Shortage` / `Supply Drought` | 3681 | 3687 | 7 |
| 1.5 | `Blacklisted` / `Spamhaus SBL` | 3688 | 3699 | 12 |
| 1.5 | `The Lame Delegation` | 3700 | 3708 | 9 |
| 1.5 | `The Chargeback Wave` / `Processor Freeze` / `Rolling Reserve` | 3709 | 3727 | 19 |
| 1.5 | `Debanked` | 3728 | 3740 | 13 |
| 1.5 | `Runway: 6 Weeks` / `Insolvency Run` / `Payroll Friday` | 3741 | 3759 | 19 |
| 1.5 | `Covenant` | 3760 | 3765 | 6 |
| 1.5 | `Collections Week` | 3766 | 3777 | 12 |
| 1.5 | `Deadbeat Quarter` | 3778 | 3783 | 6 |
| 1.5 | `Data Hostage` | 3784 | 3789 | 6 |
| 1.5 | `The Price Hike` / `Vendor Shock` / `The Relicense` | 3790 | 3803 | 14 |
| 1.5 | `The Free Thing Started Charging` | 3804 | 3811 | 8 |
| 1.5 | `The RFP` | 3812 | 3826 | 15 |
| 1.5 | `Contract Recompete` / `The Renewal` | 3827 | 3834 | 8 |
| 1.5 | `The Competitor's Obituary` / `Fire Sale` / `The Good Samaritan` | 3835 | 3848 | 14 |
| 1.5 | `The Reciprocal` | 3849 | 3857 | 9 |
| 1.5 | `Review Bomb` / `The Viral Competitor Smear` / `Media Attention` | 3858 | 3867 | 10 |
| 1.5 | `The Founder Bus Factor` / `Key Person` / `The Bus Factor` / `Two Weeks' Notice` | 3868 | 3879 | 12 |
| 1.5 | `IP Exhaustion` | 3880 | 3886 | 7 |
| 1.5 | `The Landlord Renewal` / `Landlord Squeeze` | 3887 | 3893 | 7 |
| 1.5 | `The Data Center Move` | 3894 | 3899 | 6 |
| 1.5 | `Hurricane / Regional Event` / `Force Majeure` | 3900 | 3912 | 13 |
| 1.5 | `Smoke` | 3913 | 3921 | 9 |
| 1.5 | `Dry Season` | 3922 | 3930 | 9 |
| 1.5 | `The Cheap Bid` | 3931 | 3943 | 13 |
| 1.5 | `Hardware Refresh Weekend` | 3944 | 3954 | 11 |
| 1.5 | `The Warranty Cliff` / `Depreciation Cliff` | 3955 | 3965 | 11 |
| 1.5 | `DDoS Season` | 3966 | 3971 | 6 |
| 1.5 | `The Ransom Customer` / `Ransom DDoS` / `Extortion` | 3972 | 3979 | 8 |
| 1.5 | `Sell the Company` | 3980 | 3990 | 11 |
| 1.5 | `Legacy Mode` (period flashback) | 3991 | 3997 | 7 |
| 1.5 | `The Decom` / "Lights Out" | 3998 | 4004 | 7 |
| 1.5 | `The Grand Opening` | 4005 | 4012 | 8 |
| 1.5 | `The Slow Week After` | 4013 | 4021 | 9 |
| 1.5 | `The RFO` | 4022 | 4034 | 13 |
| 1.5 | `Someone Else's Outage` | 4035 | 4040 | 6 |
| 1.5 | `The Vendor Bridge` | 4041 | 4051 | 11 |
| 1.5 | `Break Glass` | 4052 | 4063 | 12 |
| 1.5 | `Metastable` | 4064 | 4073 | 10 |
| 1.5 | `The Threshold Day` (the "nothing changed" level) | 4074 | 4088 | 15 |
| 1.5 | `The Feature Flag That Was Left On` | 4089 | 4095 | 7 |
| 1.5 | `The Bisect` | 4096 | 4105 | 10 |
| 1.5 | `The Whitelisted Office` | 4106 | 4115 | 10 |
| 1.5 | `Index Rebuild` | 4116 | 4123 | 8 |
| 1.5 | `The Circuit Order` | 4124 | 4136 | 13 |
| 1.5 | `The Transformer` | 4137 | 4145 | 9 |
| 1.5 | `Customs` | 4146 | 4154 | 9 |
| 1.5 | `The Counterfeit` | 4155 | 4162 | 8 |
| 1.5 | `Export Control` / `In Scope, Out of Country` | 4163 | 4179 | 17 |
| 1.5 | `The Nexus Letter` | 4180 | 4190 | 11 |
| 1.5 | `The Audit-Within-A-Level` | 4191 | 4196 | 6 |
| 1.5 | `Compliance Sunset` | 4197 | 4202 | 6 |
| 1.5 | `Insourcing` | 4203 | 4209 | 7 |
| 1.5 | `Reseller Revolt` | 4210 | 4216 | 7 |
| 1.5 | `The Price of Power Went Negative` | 4217 | 4224 | 8 |
| 1.5 | `Dry Run` variants and the `Fire Drill` modifier | 4225 | 4231 | 7 |
| 1.6 | Ratchet unlocks (the world gets harder, announced) | 4234 | 4243 | 10 |
| 1.6 | Legacy debt carry-over | 4244 | 4261 | 18 |
| 1.6 | Carry-over, but thin (what actually persists) | 4262 | 4270 | 9 |
| 1.6 | The Company Ledger | 4271 | 4281 | 11 |
| 1.6 | The three floors (required, or the campaign becomes unwinnable) | 4282 | 4292 | 11 |
| 1.6 | Scars | 4293 | 4315 | 23 |
| 1.6 | Named customers persist (the recurring cast) | 4316 | 4335 | 20 |
| 1.6 | The difficulty dials, assigned to layers (contradiction resolution) | 4336 | 4353 | 18 |
| 1.6 | Difficulty as SLA | 4354 | 4361 | 8 |
| 1.6 | Difficulty as Business Model (the faction selector) | 4362 | 4370 | 9 |
| 1.6 | Operator-mode modifiers | 4371 | 4381 | 11 |
| 1.6 | Authentic difficulty knobs (rather than arbitrary multipliers) | 4382 | 4391 | 10 |
| 1.6 | Achievement gates (replacing MRR gates) | 4392 | 4402 | 11 |
| 1.6 | The Ratchet (product decisions are one-way doors) | 4403 | 4409 | 7 |
| 1.6 | Cohort View | 4410 | 4415 | 6 |
| 1.6 | The Quarterly Board Meeting | 4416 | 4421 | 6 |
| 1.6 | The Uptime Streak → the Credit Grade | 4422 | 4432 | 11 |
| 1.6 | The Multiple (a persistent meta-stat) | 4433 | 4441 | 9 |
| 1.6 | Ramp-up debt (channels are expensive to start and impossible to restart quickly) | 4442 | 4447 | 6 |
| 1.6 | Prestige: "The Exit" | 4448 | 4471 | 24 |
| 1.6 | Seasonality (the commercial and thermal year) | 4472 | 4483 | 12 |
| 1.6 | The Seasonal Physical Calendar | 4484 | 4497 | 14 |
| 1.6 | The Long Weekend / the on-call clock | 4498 | 4504 | 7 |
| 1.6 | Chapter bosses (with a readable three-phase shape) | 4505 | 4517 | 13 |
| 1.6 | Sandbox unlock parity | 4518 | 4522 | 5 |
| 1.6 | The Type Ladder and the Sampler Structure | 4523 | 4536 | 14 |
| 1.6 | The Business-Type Tech Web (not a tree) | 4537 | 4543 | 7 |
| 1.6 | The Era Track | 4544 | 4552 | 9 |
| 1.7 | The Wave Envelope (resolving waves vs continuous flow) | 4555 | 4570 | 16 |
| 1.7 | The Pressure Budget | 4571 | 4583 | 13 |
| 1.7 | The Two-Beat Wave | 4584 | 4590 | 7 |
| 1.7 | Two difficulty axes, never one | 4591 | 4597 | 7 |
| 1.7 | Telegraph Depth, and the information-design law (three-way contradiction resolution) | 4598 | 4627 | 30 |
| 1.7 | Grace Windows → the Triage Window / the Attention Grace | 4628 | 4645 | 18 |
| 1.7 | The Difficulty Dial the Player Turns | 4646 | 4661 | 16 |
| 1.7 | Anti-Turtle Clock (caused, not arbitrary) | 4662 | 4669 | 8 |
| 1.7 | Peacetime is the real boss (and must be scored) | 4670 | 4688 | 19 |
| 1.7 | Downshift levels (the deliberate exhale) | 4689 | 4699 | 11 |
| 1.7 | Pressure carry-over (the fatigue ledger between levels) | 4700 | 4708 | 9 |
| 1.7 | The Mercy Rule / Consultant Mode | 4709 | 4716 | 8 |
| 1.7 | The Comeback Curve | 4717 | 4726 | 10 |
| 1.7 | The Failure Ladder (losing drops you, it doesn't restart you) | 4727 | 4738 | 12 |
| 1.7 | The Fail-Forward Fade (how a loss is presented) | 4739 | 4747 | 9 |
| 1.7 | The Three-Clock Rule | 4748 | 4754 | 7 |
| 1.7 | Soft failure over hard failure (and the hard-cliff exception rule) | 4755 | 4767 | 13 |
| 1.7 | Difficulty expressed as chrome | 4768 | 4773 | 6 |
| 1.7 | The Nines Ceiling | 4774 | 4779 | 6 |
| 1.7 | The density/interface lockstep rule | 4780 | 4791 | 12 |
| 1.8 | The Closet (Tier 0 art note) | 4799 | 4804 | 6 |
| 1.8 | The Density Ramp | 4805 | 4815 | 11 |
| 1.8 | The Cable Entropy Curve | 4816 | 4825 | 10 |
| 1.8 | The Noise Floor | 4826 | 4832 | 7 |
| 1.8 | Sky / Time-of-day Bands | 4833 | 4845 | 13 |
| 1.8 | The Weather Card | 4846 | 4853 | 8 |
| 1.8 | The Blueprint Rewind / the Blueprint Wipe | 4854 | 4863 | 10 |
| 1.8 | The Establishing Frame vs the Working Frame | 4864 | 4873 | 10 |
| 1.8 | The Company Wall | 4874 | 4883 | 10 |
| 1.8 | The Asset-Tag Ledger | 4884 | 4896 | 13 |
| 1.8 | Rack Elevation Diff | 4897 | 4901 | 5 |
| 1.8 | Scale-Anchor Object | 4902 | 4907 | 6 |
| 1.8 | The "You Are Here" Sticker | 4908 | 4914 | 7 |
| 1.8 | The Logo Evolves (reputation as typography) | 4915 | 4924 | 10 |
| 1.8 | Tier-Up Title Card | 4925 | 4933 | 9 |
| 1.9 | The Level Grammar (anti-fragmentation rule) | 4940 | 4949 | 10 |
| 1.9 | The Binding Constraint promise | 4950 | 4956 | 7 |
| 1.9 | The Invariant Core (six verbs, never swapped) | 4957 | 4971 | 15 |
| 1.9 | The Handover Note (60-second orientation for a ruleset swap) | 4972 | 4985 | 14 |
| 1.9 | The Rosetta Card (teaching that it is the same game) | 4986 | 4999 | 14 |
| 1.9 | The Returning Type doctrine (novelty, then mastery) | 5000 | 5012 | 13 |
| 1.9 | The Portable Skill Table (what each type teaches that transfers) | 5013 | 5043 | 31 |
| 1.9 | The Level Archetype Taxonomy (and the no-repeat rule) | 5044 | 5061 | 18 |
| 1.9 | The scenario length buckets | 5062 | 5067 | 6 |
| 1.9 | The Cold Start Minute (a spec for the first 90 seconds of every level) | 5068 | 5082 | 15 |
| 1.9 | The Three-Act Shape (with concrete lengths) | 5083 | 5094 | 12 |
| 1.10 | Shift Structure (day/night pacing) | 5100 | 5108 | 9 |
| 1.10 | The Change Window | 5109 | 5116 | 8 |
| 1.10 | Quarter Arc | 5117 | 5123 | 7 |
| 1.10 | The Signed Contract (pre-level difficulty as a negotiation) | 5124 | 5145 | 22 |
| 1.10 | The Difficulty Contract / Statement of Work | 5146 | 5153 | 8 |
| 1.10 | The Deal Sheet (level intro card) | 5154 | 5160 | 7 |
| 1.10 | The Objective Totem | 5161 | 5172 | 12 |
| 1.10 | The Constraint Band | 5173 | 5183 | 11 |
| 1.10 | The Midpoint Fork | 5184 | 5196 | 13 |
| 1.10 | The Double-Header (two boards, one budget) | 5197 | 5205 | 9 |
| 1.10 | The Scenario Icon Family | 5206 | 5216 | 11 |
| 1.11 | The Spine and the Sidings | 5221 | 5229 | 9 |
| 1.11 | The Pivot Map (the campaign is a node map, not a line) | 5230 | 5235 | 6 |
| 1.11 | The Campaign Market Map (where you expand, not just what you build) | 5236 | 5246 | 11 |
| 1.11 | Branch-and-Merge campaign topology | 5247 | 5254 | 8 |
| 1.11 | The Campaign Spine as a Patch Panel | 5255 | 5263 | 9 |
| 1.11 | Level Select as the Job Board | 5264 | 5271 | 8 |
| 1.11 | The Retrospective Level Select | 5272 | 5278 | 7 |
| 1.11 | The Recurring Cast | 5279 | 5291 | 13 |
| 1.11 | The Cold Open Level (the actual first five minutes) | 5292 | 5300 | 9 |
| 1.11 | Chapter Epigraphs | 5301 | 5309 | 9 |
| 1.11 | The Ratchet Audit (a level that tests only your carried-over automation) | 5310 | 5318 | 9 |
| 1.11 | "The Same Company, Five Years Later" (time-skip levels) | 5319 | 5327 | 9 |
| 1.11 | Lead Time as a first-class progression axis | 5328 | 5336 | 9 |
| 1.11 | The Rebuildability stat | 5337 | 5346 | 10 |
| 1.11 | Redundancy grammar as a progression ladder | 5347 | 5356 | 10 |
| 1.11 | Ratchet Progression (knowledge is never lost; capacity is) | 5357 | 5360 | 4 |
| 1.11 | Seeded Weekly Ruleset | 5361 | 5367 | 7 |
| 1.12 | The Decommission | 5375 | 5387 | 13 |
| 1.12 | The Scream Test | 5388 | 5401 | 14 |
| 1.12 | The Reconciliation | 5402 | 5414 | 13 |
| 1.12 | The Dry Run | 5415 | 5423 | 9 |
| 1.12 | The Second Opinion | 5424 | 5433 | 10 |
| 1.12 | The Handover | 5434 | 5442 | 9 |
| 1.12 | The Fleet Week | 5443 | 5450 | 8 |
| 1.12 | The Bake-Off | 5451 | 5458 | 8 |
| 1.12 | The Inherited Contract | 5459 | 5466 | 8 |
| 1.12 | The Two-Timeline Level | 5467 | 5474 | 8 |
| 1.12 | The Long Now | 5475 | 5482 | 8 |
| 1.12 | The Postmortem Level | 5483 | 5493 | 11 |
| 1.12 | The Sales Engineer's Nightmare | 5494 | 5502 | 9 |
| 1.12 | Column Fodder | 5503 | 5515 | 13 |
| 1.12 | The Capacity Auction | 5516 | 5523 | 8 |
| 1.12 | The Regulator's Sandbox | 5524 | 5532 | 9 |
| 1.12 | The Rate Card | 5533 | 5548 | 16 |
| 1.12 | Due Diligence (the level where you are the one being read) | 5549 | 5563 | 15 |
| 1.12 | Consent to Assignment | 5564 | 5574 | 11 |
| 1.12 | The Book Sale | 5575 | 5584 | 10 |
| 1.12 | The Ramp | 5585 | 5596 | 12 |
| 1.12 | Anchor Tenant | 5597 | 5603 | 7 |
| 1.12 | Take-or-Pay | 5604 | 5614 | 11 |
| 1.12 | Kilowatt Casino (power resale and demand response) | 5615 | 5621 | 7 |
| 1.12 | Interconnect Queue | 5622 | 5634 | 13 |
| 1.12 | Backlog | 5635 | 5646 | 12 |
| 1.12 | Price Increase Day | 5647 | 5661 | 15 |
| 1.12 | The Sunset Letter | 5662 | 5671 | 10 |
| 1.12 | The Insurance Renewal | 5672 | 5683 | 12 |
| 1.12 | Revenue Assurance Week | 5684 | 5696 | 13 |
| 1.12 | Metering Blackout | 5697 | 5706 | 10 |
| 1.12 | The QBR | 5707 | 5716 | 10 |
| 1.12 | The Recommended Host | 5717 | 5727 | 11 |
| 1.12 | The Partner Turns | 5728 | 5737 | 10 |
| 1.12 | The Agent | 5738 | 5750 | 13 |
| 1.12 | Repatriation Season | 5751 | 5761 | 11 |
| 1.12 | Offshore | 5762 | 5775 | 14 |
| 1.13 | `Skeleton Crew` | 5782 | 5785 | 4 |
| 1.13 | `Founder's Vacation` | 5786 | 5789 | 4 |
| 1.13 | `Cash Only` | 5790 | 5793 | 4 |
| 1.13 | `Frozen Change` | 5794 | 5797 | 4 |
| 1.13 | `Hostile Upstream` | 5798 | 5801 | 4 |
| 1.13 | `Price War` | 5802 | 5804 | 3 |
| 1.13 | `Viral Moment` | 5805 | 5807 | 3 |
| 1.13 | `The Tour` | 5808 | 5812 | 5 |
| 1.13 | `Regulatory Sunrise` | 5813 | 5816 | 4 |
| 1.13 | `Heat Dome` | 5817 | 5820 | 4 |
| 1.13 | `Fiber Seeking Backhoe` | 5821 | 5824 | 4 |
| 1.13 | `Deadbeat Quarter` | 5825 | 5827 | 3 |
| 1.13 | `Patch Tuesday` | 5828 | 5831 | 4 |
| 1.13 | `The Whale` | 5832 | 5835 | 4 |
| 1.13 | `Ghost Ship` | 5836 | 5839 | 4 |
| 1.13 | `Fire Drill` | 5840 | 5844 | 5 |
| 1.13 | `Sanction Line` | 5845 | 5848 | 4 |
| 1.13 | `Media Attention` | 5849 | 5852 | 4 |
| 1.13 | `Supply Drought` | 5853 | 5855 | 3 |
| 1.13 | `Blind Mode` | 5856 | 5859 | 4 |
| 1.13 | `Read-Only` | 5860 | 5864 | 5 |
| 1.13 | `Snowflake` | 5865 | 5868 | 4 |
| 1.13 | `Bus Factor 1` | 5869 | 5872 | 4 |
| 1.13 | `Boutique Managed` | 5873 | 5875 | 3 |
| 1.13 | `Customer Quality Mix` | 5876 | 5879 | 4 |
| 1.13 | `Observability Debt` | 5880 | 5883 | 4 |
| 1.13 | `Lead Time` | 5884 | 5889 | 6 |
| 1.14 | `The Multi-Vector Day` | 5896 | 5899 | 4 |
| 1.14 | `Grid Down` | 5900 | 5903 | 4 |
| 1.14 | `The Zero-Day` | 5904 | 5908 | 5 |
| 1.14 | `Extortion` | 5909 | 5912 | 4 |
| 1.14 | `The Cascade` | 5913 | 5916 | 4 |
| 1.14 | `Audit Day` | 5917 | 5920 | 4 |
| 1.14 | `The Migration Deadline` | 5921 | 5923 | 3 |
| 1.14 | `The Competitor's Collapse` | 5924 | 5927 | 4 |
| 1.14 | `The Declaration Cascade` | 5928 | 5932 | 5 |
| 1.14 | `Distrust Day` | 5933 | 5937 | 5 |
| 1.14 | `The Broadcast Storm` | 5938 | 5944 | 7 |
| 1.15 | The Era Shader Stack | 5950 | 5962 | 13 |
| 1.15 | The Time-Lapse Wipe | 5963 | 5969 | 7 |
| 1.15 | Era-Correct Failure Aesthetics | 5970 | 5974 | 5 |
| 1.15 | The Anachronism Flag | 5975 | 5980 | 6 |
| 1.15 | The Retro Boot Screen | 5981 | 5987 | 7 |
| 1.15 | Loading Is Provisioning | 5988 | 5995 | 8 |
| 2.1 | The five axes of threat distinctiveness | 6000 | 6014 | 15 |
| 2.1 | The four damage currencies | 6015 | 6027 | 13 |
| 2.1 | Every threat is quoted in dollars and churn | 6028 | 6037 | 10 |
| 2.1 | The four bands (weather / storms / hunters / entropy) | 6038 | 6046 | 9 |
| 2.1 | The four families (malicious / entropic / human / systemic) | 6047 | 6055 | 9 |
| 2.1 | The Threat Role Taxonomy (design-first, theme-second) | 6056 | 6078 | 23 |
| 2.1 | The Nine Defense Roles and the Coverage Grid | 6079 | 6104 | 26 |
| 2.1 | Attacker budgets (making yourself expensive is the win condition) | 6105 | 6116 | 12 |
| 2.1 | Every threat must be telegraphed, readable, and counterable by more than one build | 6117 | 6122 | 6 |
| 2.1 | At least a third of all threats are non-attacks | 6123 | 6129 | 7 |
| 2.1 | The scariest threats look exactly like customers | 6130 | 6132 | 3 |
| 2.1 | Threats punish specific build choices (the wave deck is a mirror) | 6133 | 6153 | 21 |
| 2.1 | Damage types should differ so defenses aren't interchangeable | 6154 | 6161 | 8 |
| 2.1 | Nothing announces itself (presentation rule) | 6162 | 6173 | 12 |
| 2.1 | Damage is often delayed and off-screen | 6174 | 6180 | 7 |
| 2.1 | Threats path the dependency graph, not geometry | 6181 | 6202 | 22 |
| 2.1 | The Two-Front Law (a wave design rule) | 6203 | 6213 | 11 |
| 2.1 | The Second Incident rule | 6214 | 6224 | 11 |
| 2.1 | The Feint (the telegraph as a weapon against you) | 6225 | 6238 | 14 |
| 2.1 | The Grudge system (attacker persistence with a visible state) | 6239 | 6248 | 10 |
| 2.1 | The Copycat Wave (the game remembers what beat you) | 6249 | 6258 | 10 |
| 2.1 | Threat behaviours worth designing around (an authoring checklist) | 6259 | 6271 | 13 |
| 2.1 | Threat delivery mechanics (how they "approach") | 6272 | 6285 | 14 |
| 2.2 | Scanner Swarm / Masscan Gnats / The Scanner Drone | 6288 | 6311 | 24 |
| 2.2 | The `/wp-login.php` Brute Squad | 6312 | 6322 | 11 |
| 2.2 | SSH Brute Force (the background radiation) | 6323 | 6331 | 9 |
| 2.2 | `.env` / `.git` Crawlers | 6332 | 6339 | 8 |
| 2.2 | Comment / Form Spam Drones | 6340 | 6346 | 7 |
| 2.2 | Referrer / SEO Spam Ghosts | 6347 | 6354 | 8 |
| 2.2 | Bad Bot Fleet (aggressive crawlers) | 6355 | 6363 | 9 |
| 2.2 | AI Scraper Locusts | 6364 | 6376 | 13 |
| 2.2 | Scraper Locust (content theft variant) | 6377 | 6388 | 12 |
| 2.2 | xmlrpc Pingback Amplifier | 6389 | 6396 | 8 |
| 2.2 | Revenue Leakage (the business layer's weather) | 6397 | 6406 | 10 |
| 2.2 | The Commoditization Fog | 6407 | 6413 | 7 |
| 2.2 | Abuse Complaint Backlog (ambient form) | 6414 | 6420 | 7 |
| 2.3 | SYN Flood / The Half-Handshake Pile | 6423 | 6454 | 32 |
| 2.3 | UDP Amplification Barrage (DNS ANY / NTP monlist / memcached / SSDP / CLDAP) | 6455 | 6479 | 25 |
| 2.3 | Reflection/Amplification where YOU are the reflector | 6480 | 6488 | 9 |
| 2.3 | Reflection Aimed *Through* You | 6489 | 6494 | 6 |
| 2.3 | Slowloris / RUDY (slow POST) / "The Sipper" / "The Molasses Sloth" | 6495 | 6513 | 19 |
| 2.3 | The Slow Read (reverse Slowloris) | 6514 | 6521 | 8 |
| 2.3 | HTTP/2 Rapid Reset | 6522 | 6532 | 11 |
| 2.3 | The Handshake Flood (asymmetric crypto cost) | 6533 | 6542 | 10 |
| 2.3 | Layer-7 GET Flood on the Expensive Endpoint / "Refresh Rats" | 6543 | 6563 | 21 |
| 2.3 | ReDoS — The Regex That Ate A Core | 6564 | 6573 | 10 |
| 2.3 | The Decompression Bomb | 6574 | 6581 | 8 |
| 2.3 | Cache-Buster Flood / Cache-Miss Storm | 6582 | 6593 | 12 |
| 2.3 | Mirai-Style IoT Botnet / The Murmuration | 6594 | 6604 | 11 |
| 2.3 | Pulse Wave | 6605 | 6611 | 7 |
| 2.3 | Carpet Bomb / Prefix Attack | 6612 | 6621 | 10 |
| 2.3 | Connection Exhaustion | 6622 | 6627 | 6 |
| 2.3 | Cache Stampede / Thundering Herd | 6628 | 6646 | 19 |
| 2.3 | Retry Storm | 6647 | 6659 | 13 |
| 2.3 | TCP Incast | 6660 | 6669 | 10 |
| 2.3 | Packet Swarm (generic volumetric, presentation entry) | 6670 | 6683 | 14 |
| 2.3 | Booter / Stresser Kid | 6684 | 6700 | 17 |
| 2.3 | Ransom DDoS (RDoS) | 6701 | 6715 | 15 |
| 2.3 | Bandwidth Bill Bomb | 6716 | 6730 | 15 |
| 2.4 | Layer-7 Mimic | 6737 | 6747 | 11 |
| 2.4 | Card Tester | 6748 | 6760 | 13 |
| 2.4 | Scraper Locust (the ambiguity case) | 6761 | 6770 | 10 |
| 2.4 | The Fake Signup Wave | 6771 | 6777 | 7 |
| 2.4 | Sybil Reviewers | 6778 | 6783 | 6 |
| 2.4 | The Squatter (a threat that enters through your revenue funnel) | 6784 | 6795 | 12 |
| 2.4 | Slowloris Sloth (mimic framing) | 6796 | 6802 | 7 |
| 2.4 | The Coat Thief (session hijack) | 6803 | 6811 | 9 |
| 2.4 | The Vending Machine Shaker (API abuse) | 6812 | 6818 | 7 |
| 2.4 | The Mimic Tell (design law) | 6819 | 6859 | 41 |
| 2.5 | SQL Injection Serpent / The Ink Worm *(unlocked by: a database)* | 6866 | 6890 | 25 |
| 2.5 | Blind SQLi | 6891 | 6896 | 6 |
| 2.5 | The Dump (the consequence unit) | 6897 | 6903 | 7 |
| 2.5 | XSS Worm / XSS Marionette / The Mirror Moth *(unlocked by: user content)* | 6904 | 6917 | 14 |
| 2.5 | File Upload Backdoor / Webshell | 6918 | 6934 | 17 |
| 2.5 | Path Traversal Sneak / Directory Traversal Mole | 6935 | 6945 | 11 |
| 2.5 | Deserialization Bomb *(unlocked by: app framework / a convenience plugin)* | 6946 | 6952 | 7 |
| 2.5 | SSRF Tunneler / SSRF Courier | 6953 | 6960 | 8 |
| 2.5 | Cache Deception (the mirror of cache poisoning) | 6961 | 6971 | 11 |
| 2.5 | Dependency Poisoning / Typosquat / Supply-Chain Trojan / The Tainted Crate | 6972 | 6991 | 20 |
| 2.5 | Log4Everything / The Zero-Day Drop / Exploit Kit (CVE Drop) | 6992 | 7009 | 18 |
| 2.5 | The Opportunist Sprayer (CVE spray) | 7010 | 7015 | 6 |
| 2.5 | Magecart Skimmer | 7016 | 7023 | 8 |
| 2.5 | Vulnerable Plugin / The Bad CMS Update | 7024 | 7032 | 9 |
| 2.5 | Cryptominer Squatter / Infestation *(Sapper role)* | 7033 | 7060 | 28 |
| 2.5 | Outbound Spam Cannon / Spam Relay | 7061 | 7073 | 13 |
| 2.5 | Backup Poisoner | 7074 | 7081 | 8 |
| 2.5 | Ransomware on the File Server / Ransomware Bloom / The Padlock Bloom | 7082 | 7114 | 33 |
| 2.5 | The Hypervisor Ransomware | 7115 | 7125 | 11 |
| 2.5 | Ransomware (customer-side) | 7126 | 7132 | 7 |
| 2.5 | Hypervisor Escape / Container Breakout / Multi-Tenancy Escape | 7133 | 7143 | 11 |
| 2.5 | The Full Table Scan / The Noisy Query | 7144 | 7151 | 8 |
| 2.6 | Brute Force Drip | 7154 | 7158 | 5 |
| 2.6 | Credential Stuffing Tide / Keyring Hail | 7159 | 7178 | 20 |
| 2.6 | Phishing Campaign / Phishing Kite | 7179 | 7187 | 9 |
| 2.6 | The Insider / Insider Badge / The Flickering Badge | 7188 | 7221 | 34 |
| 2.6 | The Disgruntled Admin | 7222 | 7228 | 7 |
| 2.6 | The Ex-Employee / Forgotten Key | 7229 | 7239 | 11 |
| 2.6 | Social Engineering Call / Vishing the Support Desk | 7240 | 7252 | 13 |
| 2.6 | The Friendly Face (badge tailgating, presentation) | 7253 | 7263 | 11 |
| 2.6 | Registrar / DNS Hijack / Domain Takeover | 7264 | 7271 | 8 |
| 2.6 | Exposed Management Interface | 7272 | 7281 | 10 |
| 2.6 | Living Off The Control Panel | 7282 | 7295 | 14 |
| 2.6 | The Leaked Key In The Public Repo | 7296 | 7305 | 10 |
| 2.6 | The Canary That Nobody Watched | 7306 | 7313 | 8 |
| 2.6 | Supply Chain Vendor | 7314 | 7320 | 7 |
| 2.6 | Control Panel Exploit | 7321 | 7327 | 7 |
| 2.6 | Tailgating / The Unescorted Visitor / The Evil Maid | 7328 | 7337 | 10 |
| 2.6 | The Guy In A Hi-Vis Vest With A Clipboard / Sneakernet Intrusion | 7338 | 7346 | 9 |
| 2.7 | BGP Prefix Hijack *(Siege role)* | 7349 | 7371 | 23 |
| 2.7 | BGP Leak / The Spill | 7372 | 7379 | 8 |
| 2.7 | The Downstream Route Leak | 7380 | 7388 | 9 |
| 2.7 | The Max-Prefix Shutdown | 7389 | 7396 | 8 |
| 2.7 | BGP Dampening — the punishment that outlasts the fault | 7397 | 7406 | 10 |
| 2.7 | The RPKI Self-Inflicted Blackhole | 7407 | 7415 | 9 |
| 2.7 | DNS Poisoner / Cache Poisoning | 7416 | 7422 | 7 |
| 2.7 | Subdomain Takeover | 7423 | 7430 | 8 |
| 2.7 | Transit Flap | 7431 | 7437 | 7 |
| 2.7 | Upstream Transit / Fiber Cut / The Backhoe | 7438 | 7453 | 16 |
| 2.7 | Upstream Carrier Outage / The Grey Ribbon | 7454 | 7461 | 8 |
| 2.7 | Peering Dispute / De-peering | 7462 | 7469 | 8 |
| 2.7 | The Blended Transit Downgrade | 7470 | 7479 | 10 |
| 2.7 | Asymmetric Routing After Failover | 7480 | 7485 | 6 |
| 2.7 | The Half-Dead Link (unidirectional failure) | 7486 | 7495 | 10 |
| 2.7 | The Microburst | 7496 | 7508 | 13 |
| 2.7 | Spanning Tree Loop / Broadcast Storm / MAC Flood | 7509 | 7515 | 7 |
| 2.7 | Rogue DHCP / Rogue AP | 7516 | 7521 | 6 |
| 2.7 | The PXE Reimage Incident | 7522 | 7531 | 10 |
| 2.7 | Duplex/Speed Mismatch, Bad Optics, and the Dirty Connector | 7532 | 7547 | 16 |
| 2.7 | NIC / Optic / Cable Gray Failure | 7548 | 7555 | 8 |
| 2.7 | MTU Mismatch / PMTUD Blackhole | 7556 | 7561 | 6 |
| 2.7 | The Asymmetric MTU Path | 7562 | 7568 | 7 |
| 2.7 | Switch Firmware Bug / Stack Master Failover | 7569 | 7574 | 6 |
| 2.7 | The Firmware Flash That Didn't Finish | 7575 | 7583 | 9 |
| 2.7 | The Config Nobody Backed Up | 7584 | 7592 | 9 |
| 2.7 | The Management Network That Rode The Production Switch | 7593 | 7600 | 8 |
| 2.7 | Clock Drift / NTP Failure — split into two failures | 7601 | 7612 | 12 |
| 2.7 | Conntrack Table Full / Ephemeral Port Exhaustion / File Descriptor Limit | 7613 | 7619 | 7 |
| 2.7 | The Loose Cable | 7620 | 7626 | 7 |
| 2.7 | Rodents, Wildlife, and the Literal Bug | 7627 | 7640 | 14 |
| 2.8 | The entropy rate cap and aggregation rule | 7649 | 7657 | 9 |
| 2.8 | The Entropy Pressure Budget (a second, quieter generator) | 7658 | 7667 | 10 |
| 2.8 | The stated entropy budget (numbers) | 7668 | 7679 | 12 |
| 2.8 | Disk Failure / Click Death | 7680 | 7695 | 16 |
| 2.8 | Rebuild Storm / The Double Failure | 7696 | 7714 | 19 |
| 2.8 | Correlated Batch Failure / The Bad Batch | 7715 | 7733 | 19 |
| 2.8 | RAID Controller BBU Death | 7734 | 7739 | 6 |
| 2.8 | Silent Bit Rot / The Fade | 7740 | 7752 | 13 |
| 2.8 | RAM / ECC Error Cascade / Bad RAM / Static Fleck | 7753 | 7763 | 11 |
| 2.8 | PSU Pop / The Pop | 7764 | 7777 | 14 |
| 2.8 | Fan Failure → Thermal Throttle / The Wobble | 7778 | 7788 | 11 |
| 2.8 | Backplane / Controller / Motherboard Failure | 7789 | 7791 | 3 |
| 2.8 | Switch Failure | 7792 | 7794 | 3 |
| 2.8 | PDU Overload / Breaker Trip | 7795 | 7803 | 9 |
| 2.8 | Phase Imbalance | 7804 | 7809 | 6 |
| 2.8 | Power Loss / Brownout / The Power Event Ladder | 7810 | 7828 | 19 |
| 2.8 | UPS Battery End-of-Life | 7829 | 7837 | 9 |
| 2.8 | Generator Fails to Start | 7838 | 7848 | 11 |
| 2.8 | Fuel Runs Out | 7849 | 7857 | 9 |
| 2.8 | CRAC / Chiller / Cooling Failure | 7858 | 7876 | 19 |
| 2.8 | Blanking Panel Neglect / Hot Aisle Recirculation | 7877 | 7883 | 7 |
| 2.8 | Water Leak / Condensation / Puddle Creep | 7884 | 7900 | 17 |
| 2.8 | Fire, Fire Precursor, and Suppression Discharge | 7901 | 7916 | 16 |
| 2.8 | Humidity / Static / Dust / The Grime Layer | 7917 | 7930 | 14 |
| 2.8 | Seismic / The Tremor | 7931 | 7937 | 7 |
| 2.8 | Weather, Storm, Flood, Lightning | 7938 | 7949 | 12 |
| 2.8 | Kernel Panic / OOM Killer | 7950 | 7963 | 14 |
| 2.8 | Inode Exhaustion | 7964 | 7969 | 6 |
| 2.8 | Log Partition Full | 7970 | 7977 | 8 |
| 2.8 | Weight Limits on Raised Floor | 7978 | 7985 | 8 |
| 2.8 | The Hardware Lottery | 7986 | 7998 | 13 |
| 2.8 | Physical: Someone Unplugs The Wrong Thing | 7999 | 8006 | 8 |
| 2.8 | Tape Library Robot Jam / Media Failure / The Arm Jam | 8007 | 8016 | 10 |
| 2.9 | Certificate Expiry / The Stale Seal | 8022 | 8041 | 20 |
| 2.9 | Let's Encrypt Rate Limit (the automation failure mode) | 8042 | 8046 | 5 |
| 2.9 | Missing Intermediate Chain | 8047 | 8053 | 7 |
| 2.9 | DNSSEC Signing Expiry / Bad KSK Rollover | 8054 | 8058 | 5 |
| 2.9 | Domain Expiry / The Tumbleweed | 8059 | 8071 | 13 |
| 2.9 | License Expiry | 8072 | 8076 | 5 |
| 2.9 | Expired Things (the whole calendar) | 8077 | 8085 | 9 |
| 2.9 | Bad Deploy / The Wrong Commit | 8086 | 8111 | 26 |
| 2.9 | Bad Config Push | 8112 | 8119 | 8 |
| 2.9 | "It Was Fine In Staging" | 8120 | 8125 | 6 |
| 2.9 | The `rm -rf` / Wrong-Environment Incident | 8126 | 8131 | 6 |
| 2.9 | Failed Rollback / The One-Way Door | 8132 | 8139 | 8 |
| 2.9 | Migration Gone Wrong / Long ALTER TABLE Lock | 8140 | 8144 | 5 |
| 2.9 | Migration Corruption | 8145 | 8150 | 6 |
| 2.9 | Config Drift | 8151 | 8173 | 23 |
| 2.9 | Runaway Cron / Cron Storm | 8174 | 8180 | 7 |
| 2.9 | Time-Bomb Cron | 8181 | 8183 | 3 |
| 2.9 | The Backup Window That Moved | 8184 | 8190 | 7 |
| 2.9 | The Logging Loop | 8191 | 8195 | 5 |
| 2.9 | Redis maxmemory Eviction | 8196 | 8203 | 8 |
| 2.9 | Replication Lag / Silent Replica Drift | 8204 | 8213 | 10 |
| 2.9 | Split-Brain | 8214 | 8223 | 10 |
| 2.9 | Backup That Never Restored | 8224 | 8235 | 12 |
| 2.9 | Monitoring Blind Spot | 8236 | 8241 | 6 |
| 2.9 | The Monitoring Server Dies | 8242 | 8248 | 7 |
| 2.9 | The Alerting Path Dependency | 8249 | 8258 | 10 |
| 2.9 | Alert Fatigue | 8259 | 8285 | 27 |
| 2.9 | The Alert That Fires Correctly And Means Nothing | 8286 | 8293 | 8 |
| 2.9 | The Ticket Avalanche / The Ticket Hydra | 8294 | 8312 | 19 |
| 2.9 | Support Queue Collapse | 8313 | 8318 | 6 |
| 2.9 | Fat-Finger | 8319 | 8333 | 15 |
| 2.9 | The Fix That Causes The Outage | 8334 | 8340 | 7 |
| 2.9 | The Reconciliation Loop That Won't Stop | 8341 | 8343 | 3 |
| 2.9 | The Helpful Vendor | 8344 | 8346 | 3 |
| 2.9 | Capacity Creep | 8347 | 8352 | 6 |
| 2.9 | Capacity Misjudgment / Forecast Miss | 8353 | 8358 | 6 |
| 2.9 | The Rate Limit You Set | 8359 | 8369 | 11 |
| 2.9 | fail2ban Self-DoS | 8370 | 8376 | 7 |
| 2.9 | Your Own Scanner Got You Blacklisted | 8377 | 8384 | 8 |
| 2.9 | The Compliance Scan That Took You Down | 8385 | 8394 | 10 |
| 2.9 | Staff Burnout | 8395 | 8407 | 13 |
| 2.9 | Key Person Risk / Bus Factor 1 | 8408 | 8418 | 11 |
| 2.9 | Documentation Rot | 8419 | 8430 | 12 |
| 2.9 | The Undocumented Dependency | 8431 | 8437 | 7 |
| 2.9 | The Correlated Failure (meta-threat) | 8438 | 8452 | 15 |
| 2.9 | Vendor EOL | 8453 | 8461 | 9 |
| 2.9 | The Demo That Matters | 8462 | 8467 | 6 |
| 2.9 | The Customer Who Lies | 8468 | 8473 | 6 |
| 2.9 | The Uninterpretable Log Line | 8474 | 8483 | 10 |
| 2.10 | The SLA credit magnitude correction (read this before pricing any outage) | 8489 | 8503 | 15 |
| 2.10 | Business threats must consume a hand | 8504 | 8512 | 9 |
| 2.10 | The Chargeback Swarm | 8513 | 8528 | 16 |
| 2.10 | Processor Termination | 8529 | 8543 | 15 |
| 2.10 | Rolling Reserve Imposition | 8544 | 8556 | 13 |
| 2.10 | Merchant Category Reclassification / Debanking | 8557 | 8566 | 10 |
| 2.10 | Involuntary Churn / The Expired Card Ghost | 8567 | 8580 | 14 |
| 2.10 | Bad Debt Creep / The Deadbeat Cohort | 8581 | 8588 | 8 |
| 2.10 | DSO Drift (Days Sales Outstanding) | 8589 | 8595 | 7 |
| 2.10 | Deferred-Revenue Sinkhole | 8596 | 8605 | 10 |
| 2.10 | The Refund Wave / The Refund Cascade | 8606 | 8616 | 11 |
| 2.10 | The Unbilled Upgrade | 8617 | 8625 | 9 |
| 2.10 | Billing Failure → the Billing Run as a scheduled high-risk event | 8626 | 8638 | 13 |
| 2.10 | Currency & Cross-Border Drag / Tax Nexus Creep / Tax Assessment | 8639 | 8646 | 8 |
| 2.10 | FX Collapse in a Priced Market | 8647 | 8654 | 8 |
| 2.10 | The Reddit Thread / The Viral Post / The Review Bomb | 8655 | 8676 | 22 |
| 2.10 | Status Page Denial | 8677 | 8682 | 6 |
| 2.10 | The Industry-Insider Drama Thread | 8683 | 8689 | 7 |
| 2.10 | The Astroturf Temptation | 8690 | 8700 | 11 |
| 2.10 | The Core Update (search algorithm apocalypse) | 8701 | 8712 | 12 |
| 2.10 | Comparison Site Delisting | 8713 | 8718 | 6 |
| 2.10 | Brand Confusion Attack | 8719 | 8724 | 6 |
| 2.10 | The Affiliate Betrayal, the Clawback Wave, and the Coupon Hijack | 8725 | 8739 | 15 |
| 2.10 | The Platform Partner Pivot / Channel Conflict | 8740 | 8748 | 9 |
| 2.10 | Referral Partner Defection | 8749 | 8751 | 3 |
| 2.10 | The Reseller Who Was Actually A Competitor | 8752 | 8754 | 3 |
| 2.10 | The Influencer Complaint | 8755 | 8760 | 6 |
| 2.10 | Uptime-Monitor Public Shaming | 8761 | 8765 | 5 |
| 2.10 | The Ex-Employee Post | 8766 | 8770 | 5 |
| 2.10 | Founder's Tweet | 8771 | 8776 | 6 |
| 2.10 | The Support Vampire | 8777 | 8792 | 16 |
| 2.10 | The Hoarder / The Resource Hog / The Noisy Neighbor | 8793 | 8804 | 12 |
| 2.10 | The Concentration Risk Whale | 8805 | 8833 | 29 |
| 2.10 | The Departing Whale | 8834 | 8839 | 6 |
| 2.10 | The Key Customer's Acquisition | 8840 | 8847 | 8 |
| 2.10 | The Insourcer | 8848 | 8852 | 5 |
| 2.10 | The Quiet Downgrade | 8853 | 8860 | 8 |
| 2.10 | The Migration Tourist | 8861 | 8865 | 5 |
| 2.10 | The Compliance Tourist | 8866 | 8870 | 5 |
| 2.10 | The Contract Lawyer | 8871 | 8876 | 6 |
| 2.10 | The Security Questionnaire Treadmill | 8877 | 8887 | 11 |
| 2.10 | The Audit Right | 8888 | 8895 | 8 |
| 2.10 | The Most-Favoured-Nation Clause | 8896 | 8904 | 9 |
| 2.10 | The Overcommitted Salesperson | 8905 | 8910 | 6 |
| 2.10 | The Ransom Customer | 8911 | 8915 | 5 |
| 2.10 | The Chargeback Artist / The Chargeback Gremlin | 8916 | 8921 | 6 |
| 2.10 | The Crypto Miner on a Free Trial | 8922 | 8927 | 6 |
| 2.10 | The Resold Reseller | 8928 | 8933 | 6 |
| 2.10 | The Reseller Who Oversells | 8934 | 8943 | 10 |
| 2.10 | The Ghost Tenant (colo) | 8944 | 8950 | 7 |
| 2.10 | The Price War / The Copycat | 8951 | 8961 | 11 |
| 2.10 | The Hyperscaler Free Tier / Cloud Giant Price Cut | 8962 | 8968 | 7 |
| 2.10 | The Acquisition Predator / The Roll-Up Acquirer | 8969 | 8974 | 6 |
| 2.10 | The Poison-Pill Customer | 8975 | 8982 | 8 |
| 2.10 | The Earnout Dispute | 8983 | 8991 | 9 |
| 2.10 | The Vendor Squeeze | 8992 | 9009 | 18 |
| 2.10 | The Landlord's Lender | 9010 | 9018 | 9 |
| 2.10 | The Upstream Bankruptcy | 9019 | 9023 | 5 |
| 2.10 | The Acquisition of Your Landlord | 9024 | 9026 | 3 |
| 2.10 | The Talent Raid | 9027 | 9033 | 7 |
| 2.10 | Employee Misclassification / Contractor Audit | 9034 | 9040 | 7 |
| 2.10 | The Word "Unlimited" | 9041 | 9050 | 10 |
| 2.10 | SLA Credit Claim (and the clause that actually bites) | 9051 | 9059 | 9 |
| 2.10 | Regulatory Fine / Compliance Lapse | 9060 | 9066 | 7 |
| 2.10 | Licensing Audit | 9067 | 9073 | 7 |
| 2.10 | Compliance Audit / Law Enforcement Request / Seizure | 9074 | 9085 | 12 |
| 2.10 | The Plaintiff's Lawyer | 9086 | 9091 | 6 |
| 2.10 | Angry Customer Escalation | 9092 | 9096 | 5 |
| 2.10 | The 1-Star Review | 9097 | 9103 | 7 |
| 2.10 | The Disgruntled Ex-Customer | 9104 | 9109 | 6 |
| 2.10 | The Investor Who Changed Their Mind | 9110 | 9116 | 7 |
| 2.10 | Vendor Financing Recall | 9117 | 9119 | 3 |
| 2.10 | The Reference Call | 9120 | 9127 | 8 |
| 2.10 | Ambulance Chasers | 9128 | 9134 | 7 |
| 2.10 | The Founder's Bad Week | 9135 | 9142 | 8 |
| 2.10 | Health and Safety | 9143 | 9152 | 10 |
| 2.11 | Bots / Scanner Bots / The Opportunist Scanner | 9160 | 9167 | 8 |
| 2.11 | Script Kiddie | 9168 | 9179 | 12 |
| 2.11 | The Grinder (Credential Stuffer) | 9180 | 9186 | 7 |
| 2.11 | Booter Kid | 9187 | 9189 | 3 |
| 2.11 | Botnet Herder / Botnet Operator | 9190 | 9198 | 9 |
| 2.11 | Extortion Crew / The Extortionist | 9199 | 9208 | 10 |
| 2.11 | The Griefer | 9209 | 9214 | 6 |
| 2.11 | The Competitor (the game's rival AI) | 9215 | 9261 | 47 |
| 2.11 | The Researcher / White Hat | 9262 | 9278 | 17 |
| 2.11 | The Journalist / The Activist Blogger | 9279 | 9285 | 7 |
| 2.11 | Spam Gang | 9286 | 9293 | 8 |
| 2.11 | Cryptominer Tenant | 9294 | 9299 | 6 |
| 2.11 | The Booter Customer | 9300 | 9305 | 6 |
| 2.11 | The Abusive Customer | 9306 | 9311 | 6 |
| 2.11 | Nation-State / APT / The Quiet Ones | 9312 | 9354 | 43 |
| 2.11 | Hacktivist Wave / Hacktivist Swarm | 9355 | 9360 | 6 |
| 2.11 | The Carder Ring | 9361 | 9365 | 5 |
| 2.11 | The Disgruntled Ex-Customer | 9366 | 9368 | 3 |
| 2.11 | The Abuse Desk of Another Provider | 9369 | 9374 | 6 |
| 2.11 | The Regulator | 9375 | 9386 | 12 |
| 2.11 | The Auditor | 9387 | 9392 | 6 |
| 2.11 | The Plaintiff's Attorney | 9393 | 9395 | 3 |
| 2.11 | The Bank | 9396 | 9402 | 7 |
| 2.11 | The Market | 9403 | 9409 | 7 |
| 2.11 | Entropy (the unattributed director) | 9410 | 9416 | 7 |
| 2.11 | Your Own Customers | 9417 | 9422 | 6 |
| 2.11 | Mother Nature | 9423 | 9427 | 5 |
| 2.11 | The Crawler Consortium (search engine bots) | 9428 | 9438 | 11 |
| 2.12 | The pruning rule for this subsection | 9444 | 9458 | 15 |
| 2.12 | The Population Effect (generalise the Empty Server Spiral) | 9459 | 9467 | 9 |
| 2.12 | Game hosting: The Grudge Booter | 9468 | 9473 | 6 |
| 2.12 | Game hosting: The Cheater / The Glitch Player | 9474 | 9485 | 12 |
| 2.12 | Game hosting: Mod Update Day | 9486 | 9492 | 7 |
| 2.12 | Game hosting: The Empty Server Spiral | 9493 | 9499 | 7 |
| 2.12 | Game hosting: The Stream Sniper / Ghost Server | 9500 | 9504 | 5 |
| 2.12 | Game hosting: Competitor-Sponsored Attack | 9505 | 9510 | 6 |
| 2.12 | Game hosting: Hype-Cycle Collapse | 9511 | 9516 | 6 |
| 2.12 | VoIP: Toll Fraud Night | 9517 | 9528 | 12 |
| 2.12 | VoIP: Jitter Storms, Codec Mismatch, One-Way Audio | 9529 | 9535 | 7 |
| 2.12 | VoIP: SIP Scanner Chorus | 9536 | 9541 | 6 |
| 2.12 | VoIP: The 911 Obligation | 9542 | 9548 | 7 |
| 2.12 | Email: The Snowshoe Spammer Customer | 9549 | 9555 | 7 |
| 2.12 | Email: The Customer Whose List Is Purchased | 9556 | 9561 | 6 |
| 2.12 | Email: The Silent Deprioritization | 9562 | 9575 | 14 |
| 2.12 | Email: Blocklist Cascade / Spamhaus SBL Listing | 9576 | 9584 | 9 |
| 2.12 | Email: The Compromised Mailbox | 9585 | 9589 | 5 |
| 2.12 | Email: Backscatter | 9590 | 9592 | 3 |
| 2.12 | Email: The Spam Cannon (presentation) | 9593 | 9597 | 5 |
| 2.12 | DNS: Water Torture | 9598 | 9607 | 10 |
| 2.12 | DNS: Reflection Conscription | 9608 | 9614 | 7 |
| 2.12 | DNS: The Fat-Finger Zone Push | 9615 | 9620 | 6 |
| 2.12 | DNS: NXDOMAIN Flood and Free-Tier COGS Leak | 9621 | 9627 | 7 |
| 2.12 | CDN: Cache Poisoning via Header | 9628 | 9636 | 9 |
| 2.12 | CDN: Purge Storm | 9637 | 9641 | 5 |
| 2.12 | CDN: The 2% Hit Ratio Customer / The Un-cacheable Customer | 9642 | 9647 | 6 |
| 2.12 | CDN: Peering Ratio Disputes and the 95th-Percentile Blowout | 9648 | 9653 | 6 |
| 2.12 | CDN: Regional PoP Loss and Hot-Object Imbalance | 9654 | 9657 | 4 |
| 2.12 | Object storage: Silent Corruption, The Public Bucket, Small File Apocalypse | 9658 | 9664 | 7 |
| 2.12 | Object storage: Erasure-Coding Math Failure | 9665 | 9670 | 6 |
| 2.12 | Egress Bill Shock | 9671 | 9677 | 7 |
| 2.12 | Backup: The Missed Backup Window | 9678 | 9683 | 6 |
| 2.12 | Backup: The Encryption Key Nobody Has | 9684 | 9694 | 11 |
| 2.12 | Backup: The Restore That Doesn't | 9695 | 9697 | 3 |
| 2.12 | Backup: Restore Surge Cost | 9698 | 9703 | 6 |
| 2.12 | Tape: The Unreadable Tape | 9704 | 9706 | 3 |
| 2.12 | Tape: Library Jam / Robot Failure / Courier Loss | 9707 | 9713 | 7 |
| 2.12 | GPU: Thermal Runaway and The Synchronized Ramp | 9714 | 9719 | 6 |
| 2.12 | GPU: Driver Roulette | 9720 | 9722 | 3 |
| 2.12 | GPU: Coolant Leak / Cooling-Loop Contamination | 9723 | 9729 | 7 |
| 2.12 | GPU: GPU Theft | 9730 | 9736 | 7 |
| 2.12 | GPU: Hardware Back-Order | 9737 | 9741 | 5 |
| 2.12 | GPU/HPC: Job Preemption Fallout | 9742 | 9747 | 6 |
| 2.12 | GPU/AI: Model Exfiltration | 9748 | 9753 | 6 |
| 2.12 | GPU: The Counterparty Default | 9754 | 9761 | 8 |
| 2.12 | GPU: The Residual Value Cliff | 9762 | 9767 | 6 |
| 2.12 | AI hosting: Prompt-Injected Tenant Workload | 9768 | 9773 | 6 |
| 2.12 | HPC: The Slow Rank | 9774 | 9780 | 7 |
| 2.12 | HPC: Interconnect Faults and Scheduler Starvation | 9781 | 9787 | 7 |
| 2.12 | Crypto: Market Collapse | 9788 | 9792 | 5 |
| 2.12 | Crypto: Tenant Overdraw | 9793 | 9798 | 6 |
| 2.12 | Crypto: Tenant Insolvency and Cheap-PSU Fire Risk | 9799 | 9804 | 6 |
| 2.12 | Kubernetes: The Admission Webhook Deadlock | 9805 | 9809 | 5 |
| 2.12 | Kubernetes: etcd Quorum Loss / Control Plane Outage | 9810 | 9814 | 5 |
| 2.12 | Kubernetes/PaaS: Multi-Tenancy Escape | 9815 | 9819 | 5 |
| 2.12 | Kubernetes/PaaS: CI Stampedes, Secret Leakage, Free-Tier Mining | 9820 | 9826 | 7 |
| 2.12 | Serverless: The Recursive Invocation Bill | 9827 | 9833 | 7 |
| 2.12 | DBaaS: Replication Lag, Split Brain, Long-Query Starvation, Backup Locks | 9834 | 9840 | 7 |
| 2.12 | Managed hosting: The Bad Plugin | 9841 | 9843 | 3 |
| 2.12 | Managed hosting: Scope Creep Support | 9844 | 9849 | 6 |
| 2.12 | VPS / LowEnd: Public Benchmark Shaming and Oversell Exposure | 9850 | 9857 | 8 |
| 2.12 | Dedicated/bare metal: Hardware Failure + Truck Roll, and Utilization Below Breakeven | 9858 | 9863 | 6 |
| 2.12 | Colo: The Tenant Who Overloads The Circuit | 9864 | 9876 | 13 |
| 2.12 | Colo: The Blocked Hot Aisle | 9877 | 9882 | 6 |
| 2.12 | Colo: The Cable Spaghetti Tenant | 9883 | 9885 | 3 |
| 2.12 | Colo: Tenant Gone Rogue | 9886 | 9894 | 9 |
| 2.12 | Colo: The Ambiguous Remote Hands Request | 9895 | 9899 | 5 |
| 2.12 | Colo: The Tenant Who Stops Paying / The Tenant Who Won't Leave | 9900 | 9908 | 9 |
| 2.12 | Colo: The Carrier Exit | 9909 | 9913 | 5 |
| 2.12 | Colo: Cross-Connect Errors and the Tenant's Own Fire | 9914 | 9920 | 7 |
| 2.12 | Wholesale / build-to-suit: Pre-Leasing Shortfall and Construction Overrun | 9921 | 9926 | 6 |
| 2.12 | Bulletproof: The Upstream Ultimatum / The Upstream Drop | 9927 | 9933 | 7 |
| 2.12 | Bulletproof: Payment Processor Termination / Registrar Seizure | 9934 | 9938 | 5 |
| 2.12 | Bulletproof: RIR Investigation | 9939 | 9944 | 6 |
| 2.12 | Bulletproof: The Abuse/Revenue Dial | 9945 | 9953 | 9 |
| 2.12 | Regulated: The Finding / The Regulator Visit | 9954 | 9959 | 6 |
| 2.12 | Regulated: The Breach Notification Clock | 9960 | 9964 | 5 |
| 2.12 | Regulated: The Data Residency Violation | 9965 | 9970 | 6 |
| 2.12 | Regulated: The Staff Clearance Lapse | 9971 | 9973 | 3 |
| 2.12 | Regulated: Evidence Gaps and Access-Log Retention | 9974 | 9979 | 6 |
| 2.12 | Dial-up: The Line Hog, The Telco Outage, The Modem Card Death, The War-Dialer | 9980 | 9989 | 10 |
| 2.12 | Dial-up: The Busy Signal | 9990 | 9996 | 7 |
| 2.12 | Period: The Warez Kiddie on the Shell Box | 9997 | 9999 | 3 |
| 2.12 | Period: Netsplit and the Usenet Binary Flood | 10000 | 10002 | 3 |
| 2.12 | Satellite: Rain Fade and The Missed Pass | 10003 | 10009 | 7 |
| 2.12 | Edge/MEC: The Site With No Remote Access | 10010 | 10016 | 7 |
| 2.12 | IoT: Device Reconnect Storm | 10017 | 10025 | 9 |
| 2.12 | File hosting/video: The Copyright Bot Sweep | 10026 | 10029 | 4 |
| 2.12 | Video: Transcode Storm | 10030 | 10034 | 5 |
| 2.12 | Video/streaming: The Event-Start Thundering Herd, Restream Piracy, and Buffering | 10035 | 10040 | 6 |
| 2.12 | Financial colo: Fairness Violations, Microburst Congestion, Clock-Sync Failure | 10041 | 10047 | 7 |
| 2.12 | Weather (satellite / remote edge / any facility) | 10048 | 10054 | 7 |
| 2.13 | Behaviour mix-ins (make familiar threats fresh) | 10057 | 10088 | 32 |
| 2.13 | Mix-ins as visible, draftable affixes | 10089 | 10096 | 8 |
| 2.13 | Each mix-in invalidates exactly one defense role | 10097 | 10106 | 10 |
| 2.13 | Hunters adapt (design law) | 10107 | 10117 | 11 |
| 2.13 | The Suspicious Uptick at 4am | 10118 | 10127 | 10 |
| 2.13 | The threat that is your own success | 10128 | 10135 | 8 |
| 2.13 | Threat pathing telegraph | 10136 | 10147 | 12 |
| 2.13 | Five telegraph grades | 10148 | 10157 | 10 |
| 2.14 | The DOA Rate | 10163 | 10171 | 9 |
| 2.14 | Counterfeit Components | 10172 | 10180 | 9 |
| 2.14 | The Hardware Broker | 10181 | 10188 | 8 |
| 2.14 | The Wrong SKU | 10189 | 10195 | 7 |
| 2.14 | The RMA Black Hole | 10196 | 10202 | 7 |
| 2.14 | The Freight Damage | 10203 | 10209 | 7 |
| 2.14 | Allocation | 10210 | 10217 | 8 |
| 2.14 | Lead-Time Inflation | 10218 | 10223 | 6 |
| 2.14 | Component Shortage | 10224 | 10230 | 7 |
| 2.14 | Component Recall | 10231 | 10236 | 6 |
| 2.14 | The Distributor Credit Hold | 10237 | 10246 | 10 |
| 2.14 | Customs, Duties, and the Seized Shipment | 10247 | 10254 | 8 |
| 2.14 | Currency / Import Tariff Shock | 10255 | 10257 | 3 |
| 2.14 | The Expired Support Contract / The Warranty Cliff | 10258 | 10264 | 7 |
| 2.14 | The Acquired Vendor | 10265 | 10273 | 9 |
| 2.14 | The Acqui-Loss | 10274 | 10281 | 8 |
| 2.14 | Licensing Repricing / Licensing Change | 10282 | 10288 | 7 |
| 2.14 | The Vendor API Deprecation | 10289 | 10296 | 8 |
| 2.15 | The Interconnection Queue | 10302 | 10309 | 8 |
| 2.15 | Demand Charge Ratchet / Demand Charge Shock | 10310 | 10325 | 16 |
| 2.15 | Grid Curtailment and Frequency Events | 10326 | 10332 | 7 |
| 2.15 | The Energy Hedge Goes Underwater | 10333 | 10342 | 10 |
| 2.15 | Regional Power Price Spike | 10343 | 10348 | 6 |
| 2.15 | Water Restriction and the WUE Stat | 10349 | 10355 | 7 |
| 2.15 | The Neighbour's Construction | 10356 | 10363 | 8 |
| 2.15 | The Building Is Also An Office | 10364 | 10370 | 7 |
| 2.15 | The Landlord's Other Tenant | 10371 | 10379 | 9 |
| 2.15 | Lightning and Bonding | 10380 | 10387 | 8 |
| 2.15 | Wildlife (extended) | 10388 | 10395 | 8 |
| 2.15 | Climate and Weather Events (regional modifiers) | 10396 | 10403 | 8 |
| 2.15 | Community Opposition | 10404 | 10410 | 7 |
| 2.15 | Seismic / Storm / Flood (regional) | 10411 | 10415 | 5 |
| 2.16 | Generative Abuse at Scale | 10421 | 10430 | 10 |
| 2.16 | Model Poisoning of Your Own Defences | 10431 | 10442 | 12 |
| 2.16 | The Agentic Customer | 10443 | 10452 | 10 |
| 2.16 | Prompt-Injected Support Automation | 10453 | 10460 | 8 |
| 2.16 | The AI Agent Incident | 10461 | 10473 | 13 |
| 2.16 | The Scraped Knowledge Base | 10474 | 10481 | 8 |
| 2.16 | Deepfaked Authority | 10482 | 10491 | 10 |
| 2.16 | AI Bubble Deflation *(era-gated)* | 10492 | 10497 | 6 |
| 2.16 | AI Scraper Locusts (see §2.2) | 10498 | 10501 | 4 |
| 2.17 | The Metastable Failure | 10507 | 10517 | 11 |
| 2.17 | Gray Failure | 10518 | 10528 | 11 |
| 2.17 | The Shared Fate You Bought (the Correlation Score) | 10529 | 10539 | 11 |
| 2.17 | The Reconciliation Loop That Won't Stop | 10540 | 10547 | 8 |
| 2.17 | The Cache That Became A Database | 10548 | 10556 | 9 |
| 2.17 | The Config That Is Also Code | 10557 | 10564 | 8 |
| 2.17 | The Forgotten Environment | 10565 | 10572 | 8 |
| 2.17 | Abandoned / Shadow Infrastructure | 10573 | 10580 | 8 |
| 2.17 | The Employee Who Automated Themselves Into Load-Bearing | 10581 | 10590 | 10 |
| 2.17 | The Staffing Dispute | 10591 | 10598 | 8 |
| 2.17 | The Undocumented Dependency / The Correlated Failure | 10599 | 10603 | 5 |
| 2.18 | Thin Provisioning Cliff | 10609 | 10619 | 11 |
| 2.18 | Snapshot Sprawl | 10620 | 10628 | 9 |
| 2.18 | The SSD Endurance Cliff | 10629 | 10640 | 12 |
| 2.18 | The Dying-But-Not-Dead Drive | 10641 | 10650 | 10 |
| 2.18 | CPU Ready Time (the metric that lives in a third place) | 10651 | 10661 | 11 |
| 2.18 | Deleted But Open | 10662 | 10669 | 8 |
| 2.18 | The Filesystem That Slowed Down At 90% | 10670 | 10675 | 6 |
| 2.18 | Missing Capacity In The Least Obvious Place | 10676 | 10682 | 7 |
| 2.18 | Backup Window Saturation | 10683 | 10687 | 5 |
| 2.19 | The Internal PKI Expiry | 10690 | 10704 | 15 |
| 2.19 | The OCSP Responder Outage | 10705 | 10714 | 10 |
| 2.19 | The GNSS/NTP Spoof — when all your clocks agree and are wrong | 10715 | 10725 | 11 |
| 2.19 | The HSTS Preload One-Way Door | 10726 | 10733 | 8 |
| 2.19 | The TLS Deprecation Cutoff | 10734 | 10744 | 11 |
| 2.20 | The Upstream Abuse Escalation Ladder | 10751 | 10758 | 8 |
| 2.20 | DMCA Flood / Abuse Complaint Stack | 10759 | 10771 | 13 |
| 2.20 | Phishing Site on Your Network / The Phishing Tenant | 10772 | 10778 | 7 |
| 2.20 | The DDoS-for-Hire Tenant | 10779 | 10784 | 6 |
| 2.20 | IP Reputation Blacklist | 10785 | 10791 | 7 |
| 2.20 | CSAM Report | 10792 | 10799 | 8 |
| 2.20 | Sanctions Screening Failure | 10800 | 10805 | 6 |
| 2.20 | RIR Investigation | 10806 | 10808 | 3 |
| 2.20 | Law Enforcement Seizure | 10809 | 10811 | 3 |
| 2.20 | Compliance Sweep | 10812 | 10819 | 8 |
| 2.21 | The Cost Attack (category rules) | 10825 | 10837 | 13 |
| 2.21 | Members of the family | 10838 | 10846 | 9 |
| 2.21 | The Taxi Meter (shared widget) | 10847 | 10854 | 8 |
| 2.21 | The Cost Anomaly Monitor (the missing Detect tower) | 10855 | 10863 | 9 |
| 2.22 | The family and its fairness contract | 10869 | 10877 | 9 |
| 2.22 | Metric Poisoning | 10878 | 10884 | 7 |
| 2.22 | The Dead Sensor / The Monitoring Server Dies | 10885 | 10890 | 6 |
| 2.22 | Alert Flooding | 10891 | 10897 | 7 |
| 2.22 | The Wrong Green | 10898 | 10905 | 8 |
| 2.22 | Log Tampering | 10906 | 10911 | 6 |
| 2.22 | Referrer / SEO Spam Ghosts | 10912 | 10915 | 4 |
| 2.22 | The Telemetry Resolution Trap | 10916 | 10923 | 8 |
| 2.23 | The Competitor's "No Robots" Campaign | 10930 | 10936 | 7 |
| 2.23 | The Legitimate Burst You Blocked | 10937 | 10943 | 7 |
| 2.23 | The Accessibility Complaint | 10944 | 10949 | 6 |
| 2.23 | The Support Tax | 10950 | 10955 | 6 |
| 2.23 | fail2ban Self-DoS and the Rate Limit You Set | 10956 | 10958 | 3 |
| 2.23 | Model Poisoning of Your Own Defences | 10959 | 10962 | 4 |
| 2.23 | The Mound of the Stopped (the family's instrument) | 10963 | 10972 | 10 |
| 2.24 | The two pressure budgets | 10978 | 10985 | 8 |
| 2.24 | The active-family pool cap | 10986 | 10988 | 3 |
| 2.24 | Mastery demotion and retirement | 10989 | 10995 | 7 |
| 2.24 | The Copycat reserve | 10996 | 10998 | 3 |
| 2.24 | Affixes as a reward multiplier | 10999 | 11001 | 3 |
| 2.24 | The Two-Front requirement for hard waves | 11002 | 11005 | 4 |
| 2.24 | The denomination quota | 11006 | 11008 | 3 |
| 2.24 | The Second Incident multiplier | 11009 | 11011 | 3 |
| 2.24 | The Feint budget | 11012 | 11014 | 3 |
| 2.24 | Grudge as a difficulty input | 11015 | 11017 | 3 |
| 2.24 | Attacker budgets as a win condition | 11018 | 11020 | 3 |
| 2.24 | The Wave Composition Bar | 11021 | 11029 | 9 |
| 2.24 | The Threat Mass Bar | 11030 | 11036 | 7 |
| 2.24 | The Pressure Gradient (ambient attack baseline) | 11037 | 11044 | 8 |
| 2.24 | Compound-wave authoring | 11045 | 11050 | 6 |
| 2.25 | Boss design specification (three phases, each invalidating one defense) | 11053 | 11068 | 16 |
| 2.25 | The named campaign antagonists | 11069 | 11077 | 9 |
| 2.25 | Ransomware on your own management plane (the campaign boss) | 11078 | 11085 | 8 |
| 2.25 | The Zero-Day Drop as a shared global event | 11086 | 11089 | 4 |
| 2.25 | The Refund Cascade death spiral | 11090 | 11097 | 8 |
| 2.26 | The Silhouette Rule | 11103 | 11110 | 8 |
| 2.26 | The threat visual contract, five channels | 11111 | 11116 | 6 |
| 2.26 | The Threat Scale Law | 11117 | 11126 | 10 |
| 2.26 | The Wind-Up Frame | 11127 | 11132 | 6 |
| 2.26 | Motion as behaviour — the seven motion primitives | 11133 | 11143 | 11 |
| 2.26 | Approach Lanes | 11144 | 11151 | 8 |
| 2.26 | The Off-Board Register | 11152 | 11166 | 15 |
| 2.26 | The Attribution Direction Law | 11167 | 11174 | 8 |
| 2.26 | The Threat Despawn Vocabulary | 11175 | 11186 | 12 |
| 2.26 | The Miss (the fourth attack-landing outcome) | 11187 | 11194 | 8 |
| 2.26 | Damage States, three stages plus one | 11195 | 11200 | 6 |
| 2.26 | The Entropy Eruption Grammar | 11201 | 11211 | 11 |
| 2.26 | The Paper Family (business and legal threats) | 11212 | 11222 | 11 |
| 2.26 | The Broadcast Family (reputation threats) | 11223 | 11232 | 10 |
| 2.26 | The Human Family (credential, insider, physical) | 11233 | 11238 | 6 |
| 2.26 | The Camera Cone Gap | 11239 | 11246 | 8 |
| 2.26 | The Designator | 11247 | 11255 | 9 |
| 2.26 | The Poisoned Tint | 11256 | 11263 | 8 |
| 2.26 | The Silent Threat Strip (the Hum Bar notch) | 11264 | 11271 | 8 |
| 2.26 | The Correlated Failure White Line | 11272 | 11275 | 4 |
| 2.26 | The Zero-Day Sky | 11276 | 11284 | 9 |
| 2.26 | The Turned-Away Map | 11285 | 11292 | 8 |
| 2.26 | The Taxi Meter | 11293 | 11299 | 7 |
| 2.26 | The Bestiary Card | 11300 | 11309 | 10 |
| 2.27 | Matrix A — signature threat, signature non-attack problem, and what it costs | 11315 | 11338 | 24 |
| 2.27 | Matrix B — the wave-deck mix per type (what the generator draws) | 11339 | 11384 | 46 |
| 2.27 | Matrix C — which threat families dominate which type | 11385 | 11397 | 13 |
| 3.1 | Patience as HP — the unified visitor spec (the reverse creep) | 11424 | 11443 | 20 |
| 3.1 | A visitor is a five-stat unit | 11444 | 11454 | 11 |
| 3.1 | Visitors take damage from *your* stack | 11455 | 11461 | 7 |
| 3.1 | The closed loop — patience, latency, queueing, and slots, written out once | 11462 | 11491 | 30 |
| 3.1 | The Latency Ladder readout | 11492 | 11538 | 47 |
| 3.1 | The Millisecond Budget (defense selection as a knapsack) | 11539 | 11563 | 25 |
| 3.1 | Suspicion Routing — the Two Lanes (the game's mazing layer) | 11564 | 11585 | 22 |
| 3.1 | Friction Gates | 11586 | 11629 | 44 |
| 3.1 | Classification, not destruction — and the third outcome | 11630 | 11641 | 12 |
| 3.1 | Value as Bounty — and value accrues per hop | 11642 | 11652 | 11 |
| 3.1 | The Conversion Node | 11653 | 11658 | 6 |
| 3.1 | Session Depth | 11659 | 11665 | 7 |
| 3.1 | Duration classes — and the resource each one eats | 11666 | 11686 | 21 |
| 3.1 | Patience → Trust → Tenure (three timescales) | 11687 | 11693 | 7 |
| 3.1 | Priority Classes and the Shed Ladder (pre-configured triage) | 11694 | 11706 | 13 |
| 3.1 | Visitor Trust as a per-identity value the defenses can read | 11707 | 11716 | 10 |
| 3.1 | The Return Cadence (today's service is tomorrow's wave size) | 11717 | 11726 | 10 |
| 3.1 | Returners and Referrers | 11727 | 11732 | 6 |
| 3.1 | Word of Mouth is the wave-size dial | 11733 | 11740 | 8 |
| 3.1 | The Satisfaction Bank (goodwill as a spendable buffer) | 11741 | 11750 | 10 |
| 3.1 | Party Arrival, generalised (all-or-nothing units) | 11751 | 11764 | 14 |
| 3.1 | Capacity as concurrency slots, not bandwidth | 11765 | 11771 | 7 |
| 3.1 | The Queue and the Death Spiral | 11772 | 11780 | 9 |
| 3.1 | Cache Hit Ratio as a visible visitor path | 11781 | 11785 | 5 |
| 3.1 | Keepalive and Connection Reuse | 11786 | 11790 | 5 |
| 3.1 | Geographic origin (speed of light is a hard game constant) | 11791 | 11795 | 5 |
| 3.1 | The Diurnal Curve | 11796 | 11803 | 8 |
| 3.1 | Seasonality | 11804 | 11808 | 5 |
| 3.1 | Flash crowd / viral spike | 11809 | 11813 | 5 |
| 3.1 | The bot fraction | 11814 | 11821 | 8 |
| 3.1 | Retry amplification | 11822 | 11825 | 4 |
| 3.1 | Visitor weight varies wildly | 11826 | 11829 | 4 |
| 3.1 | Herding (visitors follow other visitors) | 11830 | 11836 | 7 |
| 3.1 | Sticky vs. fluid traffic | 11837 | 11841 | 5 |
| 3.1 | Demand Elasticity by Latency (the visible curve) | 11842 | 11850 | 9 |
| 3.1 | The Latency-Blind Visitor | 11851 | 11858 | 8 |
| 3.1 | Traffic That Is Not For You | 11859 | 11867 | 9 |
| 3.1 | The Bounce Ticker | 11868 | 11874 | 7 |
| 3.1 | The Live Bounce-Reason Strip | 11875 | 11883 | 9 |
| 3.1 | The Conversion Funnel as literal geometry | 11884 | 11889 | 6 |
| 3.1 | The Visitor↔Build counter-matrix (a legible answer table) | 11890 | 11901 | 12 |
| 3.1 | The Cohort as a unit (customers own their traffic) | 11902 | 11912 | 11 |
| 3.1 | Declining demand as a verb (the "we're full" sign) | 11913 | 11925 | 13 |
| 3.2 | Family I — Browsers | 11956 | 11957 | 2 |
| 3.2 | The Skimmer / Casual Browser | 11958 | 11964 | 7 |
| 3.2 | The Mobile Commuter / Impatient Mobile Visitor | 11965 | 11975 | 11 |
| 3.2 | The Desktop Regular / Returning Customer | 11976 | 11987 | 12 |
| 3.2 | The Deep Reader | 11988 | 11993 | 6 |
| 3.2 | The Deep-Link Visitor | 11994 | 11999 | 6 |
| 3.2 | The Power User | 12000 | 12005 | 6 |
| 3.2 | The Logged-In User | 12006 | 12012 | 7 |
| 3.2 | The Night Owl | 12013 | 12016 | 4 |
| 3.2 | The Ghost Visitor (adblocked / no-JS / privacy) | 12017 | 12022 | 6 |
| 3.2 | The Accessibility Visitor | 12023 | 12028 | 6 |
| 3.2 | The Geo-Distant Visitor | 12029 | 12034 | 6 |
| 3.2 | The Regional Wave | 12035 | 12041 | 7 |
| 3.2 | Family II — Buyers | 12042 | 12043 | 2 |
| 3.2 | The Buyer / Power Shopper / Checkout Whale | 12044 | 12052 | 9 |
| 3.2 | The Impulse Buyer | 12053 | 12058 | 6 |
| 3.2 | The Comparison Shopper | 12059 | 12064 | 6 |
| 3.2 | The Returning Cart-Abandoner | 12065 | 12070 | 6 |
| 3.2 | The Refund Hunter | 12071 | 12077 | 7 |
| 3.2 | The Tire-Kicker | 12078 | 12085 | 8 |
| 3.2 | The Migrating Customer / The Migration-In | 12086 | 12099 | 14 |
| 3.2 | The Repatriator | 12100 | 12111 | 12 |
| 3.2 | Family III — Machines | 12112 | 12113 | 2 |
| 3.2 | The API Client / API Consumer | 12114 | 12134 | 21 |
| 3.2 | The Integration Partner | 12135 | 12142 | 8 |
| 3.2 | Googlebot / The Crawler (friendly bot) | 12143 | 12156 | 14 |
| 3.2 | The Uptime Monitor | 12157 | 12166 | 10 |
| 3.2 | The Customer Who Monitors You Better Than You Do | 12167 | 12175 | 9 |
| 3.2 | The Authorized Attacker (the customer's pentester) | 12176 | 12186 | 11 |
| 3.2 | IoT — the device fleet | 12187 | 12192 | 6 |
| 3.2 | Bot Traffic That Isn't Malicious | 12193 | 12201 | 9 |
| 3.2 | Family IV — Amplifiers | 12202 | 12203 | 2 |
| 3.2 | The Advocate / Word-of-Mouth Visitor | 12204 | 12220 | 17 |
| 3.2 | The Reviewer | 12221 | 12231 | 11 |
| 3.2 | The Influencer / The Press | 12232 | 12239 | 8 |
| 3.2 | The Streamer / Sponsored Creator (game hosting and developer products) | 12240 | 12247 | 8 |
| 3.2 | The Journalist | 12248 | 12253 | 6 |
| 3.2 | The Community | 12254 | 12260 | 7 |
| 3.2 | The Referrer You Didn't Ask For | 12261 | 12270 | 10 |
| 3.2 | Family V — Costs | 12271 | 12272 | 2 |
| 3.2 | The Freeloader / Free Tier Tourist | 12273 | 12282 | 10 |
| 3.2 | The Hotlinker / Bandwidth Parasite | 12283 | 12286 | 4 |
| 3.2 | The Support Seeker | 12287 | 12293 | 7 |
| 3.2 | The Customer Who Has Locked Themselves Out | 12294 | 12302 | 9 |
| 3.2 | The Repeat Bouncer | 12303 | 12306 | 4 |
| 3.2 | The Upload Visitor | 12307 | 12313 | 7 |
| 3.2 | The Sanctioned Entity / Fraud Signup | 12314 | 12319 | 6 |
| 3.2 | Family VI — Evaluators | 12320 | 12321 | 2 |
| 3.2 | The Enterprise Buyer / Enterprise Evaluator | 12322 | 12331 | 10 |
| 3.2 | The Evaluator's synthetic test (the scheduled exam) | 12332 | 12339 | 8 |
| 3.2 | The Procurement Delegation (a multi-headed customer) | 12340 | 12353 | 14 |
| 3.2 | The Column-Fodder Prospect | 12354 | 12363 | 10 |
| 3.2 | The Incumbent-Locked Lead | 12364 | 12373 | 10 |
| 3.2 | The Auditor (regulated) | 12374 | 12378 | 5 |
| 3.2 | The Compliance Visitor (the security questionnaire) | 12379 | 12387 | 9 |
| 3.2 | The Banker | 12388 | 12395 | 8 |
| 3.2 | The Buyer's Analyst | 12396 | 12399 | 4 |
| 3.2 | The Distributor Rep | 12400 | 12408 | 9 |
| 3.2 | Cross-family specials | 12409 | 12410 | 2 |
| 3.2 | The Whale | 12411 | 12426 | 16 |
| 3.2 | The Media Streamer / Streaming Viewer | 12427 | 12435 | 9 |
| 3.2 | The Ghost (the dormant payer) | 12436 | 12448 | 13 |
| 3.2 | The Reseller (any type) — a client who brings their own swarm | 12449 | 12453 | 5 |
| 3.2 | The Lurker (BBS / IRC / community) | 12454 | 12459 | 6 |
| 3.3 | Web host — a page load | 12490 | 12496 | 7 |
| 3.3 | Managed WordPress — a page load *plus* a plugin-update event | 12497 | 12501 | 5 |
| 3.3 | VPS / cloud — a provisioning request, and then someone else's traffic | 12502 | 12508 | 7 |
| 3.3 | Dedicated / bare metal — a sales inquiry | 12509 | 12511 | 3 |
| 3.3 | Game host — a player joining a server | 12512 | 12525 | 14 |
| 3.3 | Game host — the Tournament | 12526 | 12529 | 4 |
| 3.3 | VoIP / SIP — a call | 12530 | 12540 | 11 |
| 3.3 | Email host — a message | 12541 | 12551 | 11 |
| 3.3 | DNS host — a query | 12552 | 12561 | 10 |
| 3.3 | CDN — a request at a PoP | 12562 | 12568 | 7 |
| 3.3 | Object storage — a GET/PUT | 12569 | 12577 | 9 |
| 3.3 | Backup host — a backup job (and, rarely, a restore request) | 12578 | 12592 | 15 |
| 3.3 | Backup / DR — the restore request, and the declaration | 12593 | 12602 | 10 |
| 3.3 | Tape vault — a courier, and a recall request | 12603 | 12606 | 4 |
| 3.3 | Video / streaming — a viewer | 12607 | 12616 | 10 |
| 3.3 | Playout / broadcast — the schedule itself is the visitor | 12617 | 12620 | 4 |
| 3.3 | GPU / AI host — an inference request, or a training job | 12621 | 12635 | 15 |
| 3.3 | HPC / render — a job submission | 12636 | 12639 | 4 |
| 3.3 | CI host — a build job | 12640 | 12647 | 8 |
| 3.3 | Kubernetes / PaaS — a deployment | 12648 | 12657 | 10 |
| 3.3 | Serverless — an invocation | 12658 | 12663 | 6 |
| 3.3 | DBaaS — a query | 12664 | 12667 | 4 |
| 3.3 | Observability host — a metric series | 12668 | 12674 | 7 |
| 3.3 | Colo — a prospective tenant touring the facility | 12675 | 12717 | 43 |
| 3.3 | Colo — the tenant's engineer badging in | 12718 | 12726 | 9 |
| 3.3 | Wholesale / build-to-suit — a site-selection team | 12727 | 12732 | 6 |
| 3.3 | Colo / wholesale — The Broker | 12733 | 12736 | 4 |
| 3.3 | Regulated — an auditor | 12737 | 12740 | 4 |
| 3.3 | IX operator — a peering session | 12741 | 12748 | 8 |
| 3.3 | Registrar — a registration, a renewal, and a transfer | 12749 | 12755 | 7 |
| 3.3 | CA — a certificate signing request with a validation challenge attached | 12756 | 12760 | 5 |
| 3.3 | PACS / medical imaging — a study retrieval with a human attached | 12761 | 12763 | 3 |
| 3.3 | POS / payments — an authorization | 12764 | 12766 | 3 |
| 3.3 | WISP — a subscriber's CPE | 12767 | 12770 | 4 |
| 3.3 | Time service (NTP) — a synchronization client | 12771 | 12774 | 4 |
| 3.3 | Legacy / mainframe — a batch window | 12775 | 12778 | 4 |
| 3.3 | Dial-up — a dialling subscriber | 12779 | 12789 | 11 |
| 3.3 | BBS / shell / Usenet — a user session | 12790 | 12794 | 5 |
| 3.3 | Seedbox / storage users — occupancy, not traffic | 12795 | 12799 | 5 |
| 3.3 | IoT — a device check-in | 12800 | 12804 | 5 |
| 3.3 | Satellite ground station — a pass | 12805 | 12808 | 4 |
| 3.3 | Mining hosting — no visitors at all | 12809 | 12813 | 5 |
| 3.3 | Bulletproof — a client who asks no questions | 12814 | 12817 | 4 |
| 3.3 | Ad-tech / RTB — a bid request | 12818 | 12822 | 5 |
| 3.4 | Latency drain / TTFB over budget | 12837 | 12840 | 4 |
| 3.4 | Path Ugliness (too many hops) | 12841 | 12845 | 5 |
| 3.4 | Redirect chains | 12846 | 12852 | 7 |
| 3.4 | TLS handshake cost | 12853 | 12858 | 6 |
| 3.4 | The Error cliff | 12859 | 12866 | 8 |
| 3.4 | The Scary-warning cliff | 12867 | 12872 | 6 |
| 3.4 | The browser warning that isn't yours | 12873 | 12880 | 8 |
| 3.4 | The Captcha tax / your own defenses | 12881 | 12892 | 12 |
| 3.4 | The defense that is invisible to you because it works before your logs | 12893 | 12901 | 9 |
| 3.4 | The Phantom Funnel (demand you cannot see) | 12902 | 12914 | 13 |
| 3.4 | Protocol Compatibility as a Visitor Filter | 12915 | 12922 | 8 |
| 3.4 | Happy Eyeballs failure | 12923 | 12929 | 7 |
| 3.4 | The cert chain that only fails on old clients | 12930 | 12935 | 6 |
| 3.4 | The visitor's ISP is the problem | 12936 | 12943 | 8 |
| 3.4 | The mobile-carrier NAT block | 12944 | 12950 | 7 |
| 3.4 | Geo-IP misclassification | 12951 | 12954 | 4 |
| 3.4 | Cold start | 12955 | 12958 | 4 |
| 3.4 | Cold cache after a deploy | 12959 | 12963 | 5 |
| 3.4 | Queue Despair (the visible queue) | 12964 | 12968 | 5 |
| 3.4 | Queue-time value decay (the patience model that depreciates instead of bouncing) | 12969 | 12974 | 6 |
| 3.4 | Ugly / broken / degraded layout | 12975 | 12982 | 8 |
| 3.4 | Third-party drag | 12983 | 12986 | 4 |
| 3.4 | Search ranking decay | 12987 | 12992 | 6 |
| 3.4 | Mail deliverability | 12993 | 12998 | 6 |
| 3.4 | Reputation Bounce (email) | 12999 | 13002 | 4 |
| 3.4 | The Slow Landing Page (business recursion) | 13003 | 13009 | 7 |
| 3.4 | The Trust Gap | 13010 | 13021 | 12 |
| 3.4 | Price Shock at Checkout | 13022 | 13028 | 7 |
| 3.4 | Form Friction | 13029 | 13033 | 5 |
| 3.4 | Payment declined | 13034 | 13037 | 4 |
| 3.4 | Fraud check false positive | 13038 | 13041 | 4 |
| 3.4 | No Instant Provisioning | 13042 | 13047 | 6 |
| 3.4 | The Missing Feature Filter | 13048 | 13054 | 7 |
| 3.4 | Pre-sales response time (the lead decay timer) | 13055 | 13061 | 7 |
| 3.4 | Contract-end bounce (colo and enterprise) | 13062 | 13067 | 6 |
| 3.5 | The $3 Shared Hosting Customer / The Hobbyist | 13099 | 13106 | 8 |
| 3.5 | The Small Business Site | 13107 | 13111 | 5 |
| 3.5 | The WordPress Agency | 13112 | 13118 | 7 |
| 3.5 | The Developer Customer | 13119 | 13125 | 7 |
| 3.5 | The Forum / Community | 13126 | 13129 | 4 |
| 3.5 | The E-Commerce Store | 13130 | 13136 | 7 |
| 3.5 | The SaaS Company | 13137 | 13142 | 6 |
| 3.5 | The Startup Rocket / The Startup That Might Be Huge | 13143 | 13149 | 7 |
| 3.5 | The Enterprise | 13150 | 13153 | 4 |
| 3.5 | The Enterprise Procurement Monster | 13154 | 13158 | 5 |
| 3.5 | Government Greg / the Government-Institutional Buyer | 13159 | 13170 | 12 |
| 3.5 | The Dormant Account / The Zombie Account / The Ghost | 13171 | 13177 | 7 |
| 3.5 | The Zombie (the one who already left) | 13178 | 13182 | 5 |
| 3.5 | The Mail-Only Customer | 13183 | 13186 | 4 |
| 3.5 | The Crypto / Streaming / "Special" Customer | 13187 | 13190 | 4 |
| 3.5 | The Gray Tenant (bulletproof) | 13191 | 13194 | 4 |
| 3.5 | The Adult Site | 13195 | 13198 | 4 |
| 3.5 | The Abuser (Knowing) | 13199 | 13205 | 7 |
| 3.5 | The Abuser (Unknowing) | 13206 | 13212 | 7 |
| 3.5 | The Crypto Miner | 13213 | 13217 | 5 |
| 3.5 | The Bandwidth Hog | 13218 | 13222 | 5 |
| 3.5 | The Bargain Hunter Tenant | 13223 | 13226 | 4 |
| 3.5 | The Colo Tenant (another hosting company) | 13227 | 13235 | 9 |
| 3.5 | The Financial Firm (exchange colo) | 13236 | 13239 | 4 |
| 3.5 | The Healthcare Practice (HIPAA) / The Compliance Customer | 13240 | 13243 | 4 |
| 3.5 | The Game Community Admin / The Clan or Guild | 13244 | 13251 | 8 |
| 3.5 | The Modded-Server Owner | 13252 | 13255 | 4 |
| 3.5 | The Streamer / Influencer (as a client) | 13256 | 13259 | 4 |
| 3.5 | The Broadcaster (video) | 13260 | 13262 | 3 |
| 3.5 | The AI Startup (GPU) | 13263 | 13267 | 5 |
| 3.5 | The AI Lab / Research Lab (HPC & GPU) | 13268 | 13273 | 6 |
| 3.5 | The Grant-Funded Lab (revenue with a published expiry) | 13274 | 13280 | 7 |
| 3.5 | The Backup Customer | 13281 | 13284 | 4 |
| 3.5 | The Migration-In Refugee | 13285 | 13288 | 4 |
| 3.5 | The Agent / Master Agency | 13289 | 13299 | 11 |
| 3.5 | The ISV / OEM Embedder | 13300 | 13307 | 8 |
| 3.5 | The Credit-Risk Startup | 13308 | 13315 | 8 |
| 3.5 | The Ex-Customer | 13316 | 13320 | 5 |
| 3.5 | The Migration-Out (the customer leaving who still needs you) | 13321 | 13329 | 9 |
| 3.5 | The Bimodal Customer | 13330 | 13337 | 8 |
| 3.5 | The Off-Peak Customer (selling the shape of your own valley) | 13338 | 13345 | 8 |
| 3.5 | The Customer's Customer Sentiment (two layers of anger) | 13346 | 13352 | 7 |
| 3.5 | The Compliance-Driven Buyer | 13353 | 13360 | 8 |
| 3.5 | The Silent Majority | 13361 | 13371 | 11 |
| 3.6 | Demand Mix (marketing as creep-wave composition) | 13414 | 13437 | 24 |
| 3.6 | The SEO Garden / Organic Search Road | 13438 | 13460 | 23 |
| 3.6 | The Ad Spend Dial / Paid Search Highway / The Beacon | 13461 | 13480 | 20 |
| 3.6 | The Banner Ad Kite (cheap/spammy marketing) | 13481 | 13485 | 5 |
| 3.6 | Content Drops / The Content Engine | 13486 | 13492 | 7 |
| 3.6 | The Page Speed Score | 13493 | 13498 | 6 |
| 3.6 | The Status Page (honesty as a resource) | 13499 | 13532 | 34 |
| 3.6 | The Speed Badge / Uptime Badge | 13533 | 13540 | 8 |
| 3.6 | Uptime History | 13541 | 13544 | 4 |
| 3.6 | Latency as a Product (publish your numbers) | 13545 | 13550 | 6 |
| 3.6 | Benchmark Publication | 13551 | 13554 | 4 |
| 3.6 | Referral Program / Word-of-Mouth Footpaths | 13555 | 13574 | 20 |
| 3.6 | Affiliate / Review-Site Pipeline | 13575 | 13590 | 16 |
| 3.6 | Review Aggregators | 13591 | 13594 | 4 |
| 3.6 | The Review Wall | 13595 | 13599 | 5 |
| 3.6 | The Deal-Forum Chute | 13600 | 13606 | 7 |
| 3.6 | Partner / Reseller / Agency Channel | 13607 | 13614 | 8 |
| 3.6 | Brokers (colo / wholesale) | 13615 | 13619 | 5 |
| 3.6 | Registrar Cross-Sell | 13620 | 13625 | 6 |
| 3.6 | Community Presence / Open Source Karma | 13626 | 13634 | 9 |
| 3.6 | Dogfooding / Open Source Release | 13635 | 13638 | 4 |
| 3.6 | Content & Tooling Magnets | 13639 | 13644 | 6 |
| 3.6 | The Community / Forum (your own) | 13645 | 13650 | 6 |
| 3.6 | Sponsorships (streamers, podcasts, open-source projects) | 13651 | 13654 | 4 |
| 3.6 | Outbound Sales | 13655 | 13661 | 7 |
| 3.6 | The Conference Booth | 13662 | 13671 | 10 |
| 3.6 | Migration Assistance / The Migration Concierge | 13672 | 13684 | 13 |
| 3.6 | The Competitor's Outage (a free lane that opens by itself) | 13685 | 13689 | 5 |
| 3.6 | The Repatriation Wave | 13690 | 13697 | 8 |
| 3.6 | PR / Post-Mortem Publishing | 13698 | 13703 | 6 |
| 3.6 | Free Backups / Free SSL / Free Staging | 13704 | 13707 | 4 |
| 3.6 | The Free Tier | 13708 | 13715 | 8 |
| 3.6 | Localization / Regional PoP | 13716 | 13719 | 4 |
| 3.6 | Marketplace Listing | 13720 | 13726 | 7 |
| 3.6 | The Listing (the generic case) | 13727 | 13733 | 7 |
| 3.6 | Niche Positioning / The Niche Play | 13734 | 13742 | 9 |
| 3.6 | Geographic Positioning | 13743 | 13746 | 4 |
| 3.6 | Peering at an IX | 13747 | 13756 | 10 |
| 3.6 | IPv6 Support | 13757 | 13761 | 5 |
| 3.6 | Green / Renewable Power Certification | 13762 | 13765 | 4 |
| 3.6 | Certifications as a Lead Magnet | 13766 | 13773 | 8 |
| 3.6 | Case Study with a Whale / The Anchor Tenant | 13774 | 13779 | 6 |
| 3.6 | Promo Codes / Black Friday / Seasonal Promo | 13780 | 13786 | 7 |
| 3.6 | Acquisition (buy the lane) | 13787 | 13791 | 5 |
| 3.6 | The Price Tag (attraction by price) | 13792 | 13803 | 12 |
| 3.6 | The Front Door and The Sign | 13804 | 13811 | 8 |
| 3.6 | The Front-Page Geyser | 13812 | 13817 | 6 |
| 3.6 | Attraction by hosting type | 13818 | 13845 | 28 |
| 3.7 | The Funnel Lane | 13848 | 13858 | 11 |
| 3.7 | Onboarding as a funnel with its own bounce rate | 13859 | 13866 | 8 |
| 3.7 | The Onboarding Gauntlet | 13867 | 13876 | 10 |
| 3.7 | The Grudge Meter | 13877 | 13897 | 21 |
| 3.7 | Health Scoring / Churn Radar | 13898 | 13905 | 8 |
| 3.7 | Save Offers (and the ladder that makes them a real calculation) | 13906 | 13922 | 17 |
| 3.7 | The Exit Survey / Exit Interview | 13923 | 13929 | 7 |
| 3.7 | The Win-Loss Review (the acquisition half of the exit survey) | 13930 | 13937 | 8 |
| 3.7 | The Churn Taxonomy (five kinds, tracked separately) | 13938 | 13958 | 21 |
| 3.7 | Silent Churn (the client who stops growing) | 13959 | 13963 | 5 |
| 3.7 | Involuntary Churn / Dunning | 13964 | 13970 | 7 |
| 3.7 | Contagious Churn / The Word of Mouth Graph | 13971 | 13978 | 8 |
| 3.7 | Contract Lock-in | 13979 | 13984 | 6 |
| 3.7 | The Contract Term Ladder | 13985 | 13993 | 9 |
| 3.7 | NPS Ticker | 13994 | 14001 | 8 |
| 3.7 | The Renewal Wave and the Renewal Calendar | 14002 | 14013 | 12 |
| 3.7 | Win-Back Campaigns | 14014 | 14020 | 7 |
| 3.7 | Annual Prepay Push | 14021 | 14031 | 11 |
| 3.7 | Data Gravity as a retention mechanic | 14032 | 14046 | 15 |
| 3.7 | Domain stickiness | 14047 | 14050 | 4 |
| 3.7 | Proactive Notification | 14051 | 14056 | 6 |
| 3.7 | QBR (Quarterly Business Review) | 14057 | 14062 | 6 |
| 3.7 | The Expansion Trigger Library | 14063 | 14071 | 9 |
| 3.7 | The Upsell Ladder and Cross-Sell | 14072 | 14081 | 10 |
| 3.7 | Negative Churn as a Win Condition | 14082 | 14090 | 9 |
| 3.7 | The Reference Ladder | 14091 | 14098 | 8 |
| 3.7 | Free Migration Service (as a retention *and* acquisition tool) | 14099 | 14102 | 4 |
| 3.7 | Fire the Customer | 14103 | 14106 | 4 |
| 3.7 | The Churn Walk (presentation) | 14107 | 14120 | 14 |
| 3.7 | Cohorts as pattern (not colour) | 14121 | 14131 | 11 |
| 3.7 | Satisfaction as posture | 14132 | 14138 | 7 |
| 3.7 | Customers sit down in your building | 14139 | 14149 | 11 |
| 3.7 | The Logo Wall | 14150 | 14154 | 5 |
| 3.7 | The SLA Credit Coin | 14155 | 14159 | 5 |
| 3.7 | Reputation Weather | 14160 | 14166 | 7 |
| 3.8 | The Positioning Dial | 14169 | 14191 | 23 |
| 3.8 | Vertical Compliance Moat | 14192 | 14198 | 7 |
| 3.8 | Revenue diversification as an explicit goal | 14199 | 14205 | 7 |
| 3.8 | Customer-mix correlation as a strategy | 14206 | 14214 | 9 |
| 3.8 | The Niche compounds, the generalist doesn't | 14215 | 14220 | 6 |
| 3.8 | Declining demand as positioning | 14221 | 14225 | 5 |
| 3.8 | The Controlled Shrink (positioning by subtraction) | 14226 | 14231 | 6 |
| 3.9 | Clients are Spawners | 14237 | 14248 | 12 |
| 3.9 | Client Cards (the game's best recurring choice) | 14249 | 14300 | 52 |
| 3.9 | The Client Interview | 14301 | 14307 | 7 |
| 3.9 | The Qualification Step (the pre-sale version) | 14308 | 14312 | 5 |
| 3.9 | SLA Contracts (per client) — and the Contract Clause Library | 14313 | 14328 | 16 |
| 3.9 | The Upsell Moment | 14329 | 14336 | 8 |
| 3.9 | Noisy Tenant Isolation | 14337 | 14343 | 7 |
| 3.9 | The Sacrifice Decision | 14344 | 14359 | 16 |
| 3.9 | Client Growth | 14360 | 14373 | 14 |
| 3.9 | The Reseller (client card) | 14374 | 14378 | 5 |
| 3.9 | Whale Management (four concrete verbs) | 14379 | 14389 | 11 |
| 3.9 | Firing a customer | 14390 | 14395 | 6 |
| 3.9 | Repricing them so they fire themselves (the third option) | 14396 | 14403 | 8 |
| 3.9 | The Deposit and the Credit Limit | 14404 | 14411 | 8 |
| 3.9 | The Controlled Shrink | 14412 | 14417 | 6 |
| 3.10 | The attention budget | 14424 | 14431 | 8 |
| 3.10 | First response time as a conversion stat | 14432 | 14437 | 6 |
| 3.10 | Support-experience churn (the delayed fuse) | 14438 | 14442 | 5 |
| 3.10 | Tier-1 deflection and the self-service tower | 14443 | 14448 | 6 |
| 3.10 | The escalation path | 14449 | 14454 | 6 |
| 3.10 | The ticket avalanche | 14455 | 14460 | 6 |
| 3.10 | The Concierge (support made visible) | 14461 | 14466 | 6 |
| 3.10 | The Ticket Paper Grammar | 14467 | 14476 | 10 |
| 3.10 | The customer who files better tickets than your staff | 14477 | 14481 | 5 |
| 3.10 | The self-inflicted ticket class | 14482 | 14489 | 8 |
| 3.11 | The lead decay timer | 14496 | 14501 | 6 |
| 3.11 | The Sales Pipeline Rail | 14502 | 14507 | 6 |
| 3.11 | The RFP Fax | 14508 | 14512 | 5 |
| 3.11 | Qualification (and the cost of skipping it) | 14513 | 14517 | 5 |
| 3.11 | The security questionnaire as a gate | 14518 | 14523 | 6 |
| 3.11 | Compliance attestation as a gate-opener | 14524 | 14529 | 6 |
| 3.11 | The Procurement Portal (the delay nobody expects) | 14530 | 14539 | 10 |
| 3.11 | Channel Conflict and Deal Registration | 14540 | 14547 | 8 |
| 3.11 | The residual commission leak | 14548 | 14552 | 5 |
| 3.11 | The broker's cut | 14553 | 14557 | 5 |
| 3.11 | The buy-out play | 14558 | 14562 | 5 |
| 3.11 | The credit decision | 14563 | 14568 | 6 |
| 3.11 | The ramp and the commit | 14569 | 14574 | 6 |
| 3.11 | The win-loss loop | 14575 | 14580 | 6 |
| 3.12 | Visitors Are Light; Threats Are Mass | 14586 | 14593 | 8 |
| 3.12 | The Costume Kit (the spec behind "one shape, many costumes") | 14594 | 14603 | 10 |
| 3.12 | Value as Ornament, not size or glow | 14604 | 14610 | 7 |
| 3.12 | The Patience Ring, with a three-stage LOD | 14611 | 14623 | 13 |
| 3.12 | The Trail = Latency | 14624 | 14628 | 5 |
| 3.12 | The Bounce (a universal six-frame animation) | 14629 | 14633 | 5 |
| 3.12 | The Bounce Cause Tag | 14634 | 14643 | 10 |
| 3.12 | The Bounce Heatmap and its decay | 14644 | 14649 | 6 |
| 3.12 | The Convert (and the hard spec that keeps it from becoming noise) | 14650 | 14657 | 8 |
| 3.12 | The Happiness Halo | 14658 | 14662 | 5 |
| 3.12 | The false-positive flash, reinforced | 14663 | 14670 | 8 |
| 3.12 | Crowd density as a particle field (four bands with hysteresis) | 14671 | 14676 | 6 |
| 3.12 | The Path Preview Ribbon | 14677 | 14681 | 5 |
| 3.12 | The Lookalike Test | 14682 | 14687 | 6 |
| 3.12 | Glance Animations | 14688 | 14695 | 8 |
| 3.12 | The Doorstep | 14696 | 14702 | 7 |
| 3.12 | The Waiting Room | 14703 | 14707 | 5 |
| 3.12 | The Turnstile | 14708 | 14712 | 5 |
| 3.12 | The Party Chain | 14713 | 14717 | 5 |
| 3.12 | The Entourage (whales and delegations) | 14718 | 14723 | 6 |
| 3.12 | The Arrival Metronome | 14724 | 14729 | 6 |
| 3.12 | The Convoy and the Window Band | 14730 | 14735 | 6 |
| 3.12 | The Red Case (the restore) | 14736 | 14741 | 6 |
| 3.12 | The Blueprint Visitor | 14742 | 14746 | 5 |
| 3.12 | The Customer Portrait System | 14747 | 14758 | 12 |
| 3.12 | The Contract Card | 14759 | 14764 | 6 |
| 3.12 | The Wall of Mirrors (customer-eye previews at scale) | 14765 | 14774 | 10 |
| 3.12 | The Empty Server Spiral, drawn | 14775 | 14779 | 5 |
| 3.12 | The Busy Wall (capacity, universal) | 14780 | 14785 | 6 |
| 3.12 | The Front Door, the Sign, the Billboard, the Kite | 14786 | 14792 | 7 |
| 3.12 | The Beacon and the competing beacons | 14793 | 14798 | 6 |
| 3.12 | The Front-Page Geyser | 14799 | 14803 | 5 |
| 3.12 | The Dandelion and the referral web | 14804 | 14810 | 7 |
| 3.12 | The Review Wall and the Uptime Trophy Wall | 14811 | 14816 | 6 |
| 3.12 | The Status Page Beacon | 14817 | 14821 | 5 |
| 3.12 | The Logo Wall and the clean rectangle | 14822 | 14826 | 5 |
| 3.12 | The SLA Credit Coin | 14827 | 14830 | 4 |
| 3.12 | The Churn Ledger Draft | 14831 | 14834 | 4 |
| 3.12 | The 1-star on the window | 14835 | 14841 | 7 |
| 3.12 | Reputation Weather | 14842 | 14846 | 5 |
| 3.12 | The Sales Pipeline Rail and the RFP Fax | 14847 | 14851 | 5 |
| 3.12 | The Tour Rail and the verdict photograph | 14852 | 14858 | 7 |
| 4.1 | The Three-Column Law | 14877 | 14913 | 37 |
| 4.1 | The Build Card | 14914 | 14941 | 28 |
| 4.1 | "What does this let me charge for?" | 14942 | 14947 | 6 |
| 4.1 | Every buildable is a toy first, a stat block second | 14948 | 14960 | 13 |
| 4.1 | Universal visual grammar for buildables | 14961 | 14977 | 17 |
| 4.1 | The Exposure Chevron Count | 14978 | 14985 | 8 |
| 4.1 | The Exposure Ring | 14986 | 14993 | 8 |
| 4.1 | The Attack Surface Rose | 14994 | 15001 | 8 |
| 4.1 | The Upkeep Drip | 15002 | 15008 | 7 |
| 4.1 | The Truth/Face Pair Law | 15009 | 15020 | 12 |
| 4.1 | The Idle Animation Catalogue | 15021 | 15030 | 10 |
| 4.1 | The Wear Channel Triad | 15031 | 15038 | 8 |
| 4.1 | The Faceplate Contract | 15039 | 15045 | 7 |
| 4.1 | LED Grammar | 15046 | 15053 | 8 |
| 4.1 | The Locate Beacon | 15054 | 15060 | 7 |
| 4.1 | U-Height Silhouettes | 15061 | 15067 | 7 |
| 4.1 | Cable Colour Code | 15068 | 15074 | 7 |
| 4.1 | Cable Physics | 15075 | 15081 | 7 |
| 4.1 | The Vendor House Styles | 15082 | 15091 | 10 |
| 4.1 | The Golden Image Tint | 15092 | 15098 | 7 |
| 4.1 | Build Ghost | 15099 | 15105 | 7 |
| 4.1 | The Placement Refusal Icon Set | 15106 | 15113 | 8 |
| 4.1 | The Rack Elevation as a Buy Screen | 15114 | 15121 | 8 |
| 4.1 | Construction Animation | 15122 | 15129 | 8 |
| 4.1 | Decommission Animation | 15130 | 15136 | 7 |
| 4.1 | Build time and cold start | 15137 | 15156 | 20 |
| 4.1 | The Surface Budget | 15157 | 15177 | 21 |
| 4.1 | The Build Role Taxonomy (nine roles) | 15178 | 15190 | 13 |
| 4.1 | The Platform Chassis | 15191 | 15203 | 13 |
| 4.1 | The Instance-Size Slider | 15204 | 15212 | 9 |
| 4.1 | The Two Jobs Rule | 15213 | 15224 | 12 |
| 4.1 | Warm-up and wind-down curves | 15225 | 15237 | 13 |
| 4.1 | The Warm Bench | 15238 | 15253 | 16 |
| 4.1 | Headroom as an explicit, purchasable, visible stat | 15254 | 15263 | 10 |
| 4.1 | The Capacity Reservation (for yourself) | 15264 | 15274 | 11 |
| 4.1 | Policies as a buildable class | 15275 | 15286 | 12 |
| 4.1 | The Standard Build (templates with a doctrine bonus) | 15287 | 15299 | 13 |
| 4.1 | The Dependency Contract | 15300 | 15313 | 14 |
| 4.2 | Web Server (the 1U pizza box) | 15316 | 15333 | 18 |
| 4.2 | The Monolith (scale-up server) | 15334 | 15340 | 7 |
| 4.2 | App Server / Worker Pool | 15341 | 15349 | 9 |
| 4.2 | Shared Web Node (control-panel style) | 15350 | 15359 | 10 |
| 4.2 | VPS / KVM Node (hypervisor) | 15360 | 15378 | 19 |
| 4.2 | Dedicated Server | 15379 | 15388 | 10 |
| 4.2 | Bare-Metal-as-a-Service / Provisioning System (PXE/iPXE/Foreman-alike) | 15389 | 15397 | 9 |
| 4.2 | Container Host / Orchestrator (Kubernetes-alike) | 15398 | 15413 | 16 |
| 4.2 | Hypervisor Host — "The Tray" | 15414 | 15424 | 11 |
| 4.2 | Serverless / Edge Function Tier | 15425 | 15434 | 10 |
| 4.2 | Warm Pool / Chrysalis Pool *(serverless)* | 15435 | 15440 | 6 |
| 4.2 | Worker / Queue Pool | 15441 | 15451 | 11 |
| 4.2 | Cron / Scheduler Node | 15452 | 15458 | 7 |
| 4.2 | Batch / HPC Job Scheduler (Slurm-alike) | 15459 | 15466 | 8 |
| 4.2 | Bare-Metal Build Box / CI Runner | 15467 | 15472 | 6 |
| 4.2 | Staging Environment | 15473 | 15486 | 14 |
| 4.2 | Connection Pooler (pgbouncer-alike) | 15487 | 15493 | 7 |
| 4.2 | Keepalived / VRRP Floating IP | 15494 | 15499 | 6 |
| 4.2 | Bare-Metal Beast (GPU box) | 15500 | 15512 | 13 |
| 4.2 | FPGA / ASIC Shelf | 15513 | 15518 | 6 |
| 4.2 | The Legacy Box You Can't Turn Off | 15519 | 15526 | 8 |
| 4.2 | Cell-Based Architecture / Shuffle Sharding | 15527 | 15548 | 22 |
| 4.2 | The Bulkhead / Resource Pool Partition | 15549 | 15559 | 11 |
| 4.3 | Database Primary (the Vault / "The Drum") | 15562 | 15581 | 20 |
| 4.3 | Read Replica | 15582 | 15593 | 12 |
| 4.3 | Automatic Failover / Cluster Manager | 15594 | 15601 | 8 |
| 4.3 | Cache Layer (Redis / Memcached / Varnish) — "The Coil" | 15602 | 15626 | 25 |
| 4.3 | Local Disk | 15627 | 15632 | 6 |
| 4.3 | RAID Array | 15633 | 15639 | 7 |
| 4.3 | Erasure-Coded Pool / Erasure Coding Policy | 15640 | 15649 | 10 |
| 4.3 | NVMe Cache Tier | 15650 | 15656 | 7 |
| 4.3 | Object / Blob Storage — "The Comb Cell Block" | 15657 | 15669 | 13 |
| 4.3 | NFS / SAN / Shared Storage | 15670 | 15679 | 10 |
| 4.3 | Search Index / Search Cluster — "The Card Index Whirl" | 15680 | 15687 | 8 |
| 4.3 | Snapshot Layer / Snapshot Scheduler | 15688 | 15695 | 8 |
| 4.3 | Immutable / WORM Storage | 15696 | 15702 | 7 |
| 4.3 | Backup System / Backup Vault | 15703 | 15749 | 47 |
| 4.3 | Backup Agent — "The Little Robot" | 15750 | 15756 | 7 |
| 4.3 | Restore Drill / Restore Test Runner / Restore Test Harness | 15757 | 15768 | 12 |
| 4.3 | Data Warehouse / Analytics Store | 15769 | 15775 | 7 |
| 4.3 | Log Aggregator / SIEM | 15776 | 15789 | 14 |
| 4.3 | Tape Library / Robot — "The Vault Wall + Arm" | 15790 | 15800 | 11 |
| 4.3 | Cold Archive Vault (offsite) | 15801 | 15806 | 6 |
| 4.3 | Secrets Manager / Vault — "The Safe" | 15807 | 15815 | 9 |
| 4.3 | The Read-Only Mode Switch | 15816 | 15826 | 11 |
| 4.4 | Reverse Proxy / Edge Tier — "The Mirror" / "The Gatehouse" | 15829 | 15841 | 13 |
| 4.4 | Load Balancer (L4 and L7 as separate builds) — "The Prism" | 15842 | 15872 | 31 |
| 4.4 | LB Pair (HA) | 15873 | 15878 | 6 |
| 4.4 | Firewall — "The Portcullis" | 15879 | 15897 | 19 |
| 4.4 | Switch (top-of-rack) — "The Comb" | 15898 | 15913 | 16 |
| 4.4 | Core / Aggregation Switch + Router — "The Junction" / "The Roundabout" | 15914 | 15923 | 10 |
| 4.4 | Redundant Pair + VRRP / MLAG | 15924 | 15929 | 6 |
| 4.4 | The Witness / Tiebreaker Node | 15930 | 15939 | 10 |
| 4.4 | Transit Link / Transit Contract — "The Big Ribbon" | 15940 | 15950 | 11 |
| 4.4 | Second Transit Provider (multihoming) | 15951 | 15961 | 11 |
| 4.4 | IX / Peering Port — "The Handshake Bridge" | 15962 | 15973 | 12 |
| 4.4 | BGP Speaker + RPKI / "The Lighthouse" | 15974 | 15983 | 10 |
| 4.4 | IRR / RPKI Publication and Peering Hygiene | 15984 | 15992 | 9 |
| 4.4 | Anycast Network / Anycast Constellation — "The Tuning Fork" | 15993 | 16003 | 11 |
| 4.4 | Anycast Health Withdrawal Controller + Withdrawal Policy | 16004 | 16013 | 10 |
| 4.4 | Private Interconnect / Dark Fiber | 16014 | 16018 | 5 |
| 4.4 | Cross-Connect — "The Violet Run" | 16019 | 16037 | 19 |
| 4.4 | CDN Contract / Edge PoP — "The Star" | 16038 | 16052 | 15 |
| 4.4 | DDoS Scrubbing Service — "The Comb" | 16053 | 16078 | 26 |
| 4.4 | Upstream Blackhole Signalling (RTBH) + Flowspec | 16079 | 16094 | 16 |
| 4.4 | Network Segmentation / VLANs — "The Coloured Floor Paint" | 16095 | 16108 | 14 |
| 4.4 | Microsegmentation — "The Grid Lines" | 16109 | 16114 | 6 |
| 4.4 | Egress Filtering | 16115 | 16122 | 8 |
| 4.4 | VPN / Bastion / Jump Host / Zero-Trust Access — "The Gatehouse" / "The Tunnel Mouth" | 16123 | 16134 | 12 |
| 4.4 | Out-of-Band Management (IPMI/iDRAC/iLO) + Console Server — "The Grey Shadow Network" | 16135 | 16154 | 20 |
| 4.4 | Out-of-Band LTE/5G Modem (per site) | 16155 | 16161 | 7 |
| 4.4 | IPv6 Deployment | 16162 | 16168 | 7 |
| 4.4 | IP Space (owned vs leased) | 16169 | 16182 | 14 |
| 4.4 | Flow Telemetry (NetFlow / sFlow / IPFIX) | 16183 | 16192 | 10 |
| 4.4 | Network Config Backup + Diff | 16193 | 16202 | 10 |
| 4.4 | Tap / Port Mirror — "The Periscope" | 16203 | 16208 | 6 |
| 4.4 | Patch Panel — "The Jack Field" | 16209 | 16219 | 11 |
| 4.4 | Looking Glass / Public Route Server / Public Speed Test | 16220 | 16227 | 8 |
| 4.4 | QoS / Traffic Shaping Policy | 16228 | 16243 | 16 |
| 4.4 | Load Shedding by Priority | 16244 | 16252 | 9 |
| 4.4 | Admission Control and Bounded Queues | 16253 | 16260 | 8 |
| 4.4 | The Queue Dial | 16261 | 16276 | 16 |
| 4.4 | Structured Cabling Tray / Overhead Ladder Racking | 16277 | 16284 | 8 |
| 4.5 | The Nine Defense Roles | 16291 | 16318 | 28 |
| 4.5 | The Coverage Grid | 16319 | 16330 | 12 |
| 4.5 | Defense-in-Depth stacking rules | 16331 | 16349 | 19 |
| 4.5 | Defenses live on edges, not on the board | 16350 | 16361 | 12 |
| 4.5 | Every defense has an aggression slider | 16362 | 16372 | 11 |
| 4.5 | The Defense Off-State and the Mis-Tune State | 16373 | 16382 | 10 |
| 4.5 | WAF (Web Application Firewall) — "The Sieve" | 16383 | 16410 | 28 |
| 4.5 | Rate Limiter (per-IP / per-endpoint / per-ASN) — "The Turnstile" | 16411 | 16430 | 20 |
| 4.5 | CAPTCHA Gate / Challenge Gate | 16431 | 16446 | 16 |
| 4.5 | Bot Fingerprinter / Behavioural Analysis | 16447 | 16467 | 21 |
| 4.5 | MFA / Auth Hardening | 16468 | 16474 | 7 |
| 4.5 | fail2ban / Dynamic Blocklist | 16475 | 16481 | 7 |
| 4.5 | IDS / IPS Sentry — "The Radar Dish" | 16482 | 16499 | 18 |
| 4.5 | Honeypot | 16500 | 16515 | 16 |
| 4.5 | The Decoy and the Sacrificial Service (the Divert family) | 16516 | 16531 | 16 |
| 4.5 | The Tarpit | 16532 | 16537 | 6 |
| 4.5 | The Sinkhole | 16538 | 16543 | 6 |
| 4.5 | The Canary | 16544 | 16555 | 12 |
| 4.5 | Canary Credentials / Honeytokens | 16556 | 16567 | 12 |
| 4.5 | File Integrity Monitoring | 16568 | 16573 | 6 |
| 4.5 | SBOM / Software Inventory | 16574 | 16583 | 10 |
| 4.5 | Patch Cart / Patch Management | 16584 | 16595 | 12 |
| 4.5 | Golden Image Bakery | 16596 | 16607 | 12 |
| 4.5 | Immutable Rebuild Pipeline | 16608 | 16613 | 6 |
| 4.5 | Circuit Breaker | 16614 | 16626 | 13 |
| 4.5 | Canary Deploy Rig / Blue-Green / Gradual Rollout | 16627 | 16635 | 9 |
| 4.5 | Feature Flags / Kill Switches | 16636 | 16642 | 7 |
| 4.5 | Chaos Monkey / Chaos Engineering Lab / GameDay | 16643 | 16653 | 11 |
| 4.5 | Load Testing Rig | 16654 | 16659 | 6 |
| 4.5 | Tabletop Exercise | 16660 | 16667 | 8 |
| 4.5 | The Break-Glass Safe | 16668 | 16676 | 9 |
| 4.5 | Abuse Detection Pipeline | 16677 | 16685 | 9 |
| 4.5 | Rate Limiting / Quota Engine (per-account resource caps) | 16686 | 16695 | 10 |
| 4.6 | Monitoring Stack (purchased in layers) — "The Watchtower" | 16698 | 16751 | 54 |
| 4.6 | External / Synthetic Monitoring | 16752 | 16758 | 7 |
| 4.6 | External Vantage Fleet | 16759 | 16769 | 11 |
| 4.6 | The Synthetic Customer | 16770 | 16778 | 9 |
| 4.6 | Alerting / Pager / On-call Rotation | 16779 | 16795 | 17 |
| 4.6 | Tracing | 16796 | 16801 | 6 |
| 4.6 | Status Page | 16802 | 16827 | 26 |
| 4.6 | Runbook Library / Documentation | 16828 | 16842 | 15 |
| 4.6 | Postmortem Process (blameless) | 16843 | 16852 | 10 |
| 4.6 | Runbook Automation | 16853 | 16861 | 9 |
| 4.6 | Incident Command Structure | 16862 | 16877 | 16 |
| 4.6 | The Escalation Matrix | 16878 | 16885 | 8 |
| 4.6 | The MOP and the Go/No-Go | 16886 | 16895 | 10 |
| 4.6 | The Error Budget Policy | 16896 | 16909 | 14 |
| 4.6 | Auto-Scaler / Auto-Scaling Policy | 16910 | 16917 | 8 |
| 4.6 | Config Management (Ansible/Puppet-alike) — "The Stencil" | 16918 | 16926 | 9 |
| 4.6 | Deploy Pipeline / CI-CD | 16927 | 16934 | 8 |
| 4.6 | Container Registry / Package Mirror | 16935 | 16940 | 6 |
| 4.6 | Certificate Automation (ACME) | 16941 | 16946 | 6 |
| 4.6 | Asset Inventory / CMDB | 16947 | 16953 | 7 |
| 4.6 | The Secondary Everything Register | 16954 | 16961 | 8 |
| 4.6 | Capacity Planning / Forecasting Model | 16962 | 16971 | 10 |
| 4.7 | The Facility Section Cut | 16977 | 16984 | 8 |
| 4.7 | Rack / Cabinet | 16985 | 16999 | 15 |
| 4.7 | Rails, Cage Nuts, Depth Adapters and the Cable Comb | 17000 | 17011 | 12 |
| 4.7 | The Tool Crib and the Torque Standard | 17012 | 17018 | 7 |
| 4.7 | PDU / Busway — "The Spine" | 17019 | 17030 | 12 |
| 4.7 | Switched PDU (per-outlet power control) | 17031 | 17040 | 10 |
| 4.7 | The Breaker Panel | 17041 | 17046 | 6 |
| 4.7 | The Circuit Colour Band | 17047 | 17054 | 8 |
| 4.7 | A+B Power Feeds / Dual Cording | 17055 | 17071 | 17 |
| 4.7 | UPS — "The Battery Ziggurat" | 17072 | 17093 | 22 |
| 4.7 | Flywheel UPS — "The Spinner" | 17094 | 17099 | 6 |
| 4.7 | Generator + Fuel Contract — "The Barn" | 17100 | 17139 | 40 |
| 4.7 | Diesel Tank + Fuel Delivery Contract | 17140 | 17145 | 6 |
| 4.7 | ATS / Static Transfer Switch — "The Big Lever" | 17146 | 17153 | 8 |
| 4.7 | Load Bank | 17154 | 17159 | 6 |
| 4.7 | Battery Capacity Tester | 17160 | 17162 | 3 |
| 4.7 | Utility Feed / Service Entrance | 17163 | 17170 | 8 |
| 4.7 | Second Utility Feed from a Different Substation | 17171 | 17176 | 6 |
| 4.7 | Substation / Utility Yard — "The Yard" | 17177 | 17179 | 3 |
| 4.7 | On-Site Generation and Storage (solar, BESS, fuel cell, microgrid) | 17180 | 17189 | 10 |
| 4.7 | CRAC / CRAH Cooling Unit (N+1) — "The Cold Breath" | 17190 | 17200 | 11 |
| 4.7 | Chilled Water Plant (chillers, pumps, cooling towers, water treatment) | 17201 | 17215 | 15 |
| 4.7 | Free Cooling Economizer / Dry Cooler / Evaporative / Adiabatic | 17216 | 17222 | 7 |
| 4.7 | Thermal Storage / Thermal Ride-Through (ice bank, chilled-water buffer tank) | 17223 | 17236 | 14 |
| 4.7 | Hot/Cold Aisle Containment + Blanking Panels — "The Glass Roof" | 17237 | 17251 | 15 |
| 4.7 | In-Row Cooling — "The Slot Unit" | 17252 | 17256 | 5 |
| 4.7 | Rear-Door Heat Exchanger | 17257 | 17261 | 5 |
| 4.7 | Liquid Cooling (direct-to-chip loop / CDU / immersion tank) | 17262 | 17269 | 8 |
| 4.7 | The Spill Kit, the Drip Tray and the Isolation Valve | 17270 | 17278 | 9 |
| 4.7 | Raised Floor + Tile Puller | 17279 | 17287 | 9 |
| 4.7 | Airflow Streamers | 17288 | 17293 | 6 |
| 4.7 | Environmental Sensor Mesh | 17294 | 17302 | 9 |
| 4.7 | DCIM (the facility's monitoring stack) | 17303 | 17312 | 10 |
| 4.7 | BMS / SCADA and OT Security | 17313 | 17324 | 12 |
| 4.7 | Fire Detection (VESDA) — "The Sniffers" | 17325 | 17330 | 6 |
| 4.7 | Fire Suppression | 17331 | 17347 | 17 |
| 4.7 | The EPO Guard | 17348 | 17351 | 4 |
| 4.7 | Water Leak Detection Cable / Thermal Imaging Survey | 17352 | 17357 | 6 |
| 4.7 | Physical Security: Fence, Bollards, Gate, Mantrap, Badge, Biometrics, Cameras, Guard Post | 17358 | 17373 | 16 |
| 4.7 | Cable Management / Cable Tray / Patch Panel / Overhead Ladder Racking | 17374 | 17394 | 21 |
| 4.7 | Cable Label Printer | 17395 | 17403 | 9 |
| 4.7 | Spare Parts Inventory / Spares Bin / Crash Cart | 17404 | 17415 | 12 |
| 4.7 | The Crash Cart (and the Crash Cart as Console) | 17416 | 17427 | 12 |
| 4.7 | Loading Dock / Staging Area / Freight Elevator | 17428 | 17442 | 15 |
| 4.7 | The Anteroom / Dust Lock | 17443 | 17449 | 7 |
| 4.7 | The Burn-In Bench | 17450 | 17459 | 10 |
| 4.7 | The Lab Rack / Reference Rack | 17460 | 17472 | 13 |
| 4.7 | Diverse Fiber Entry | 17473 | 17478 | 6 |
| 4.7 | Meet-Me Room — "The Cathedral" | 17479 | 17488 | 10 |
| 4.7 | Carrier Diversity | 17489 | 17494 | 6 |
| 4.7 | Cabinet / Cage / Private Suite *(colo)* | 17495 | 17497 | 3 |
| 4.7 | Building Shell Expansion / Build-to-Suit / Build-Out Shell Space | 17498 | 17503 | 6 |
| 4.7 | On-Site Water / Chiller Plant Politics | 17504 | 17508 | 5 |
| 4.7 | Waste Heat Recovery | 17509 | 17516 | 8 |
| 4.7 | Seismic Bracing / Raised Floor vs Slab / Roof Condition / Overhead Tray | 17517 | 17523 | 7 |
| 4.7 | The Office | 17524 | 17535 | 12 |
| 4.7 | NOC / Operations Floor | 17536 | 17543 | 8 |
| 4.8 | The Team Model (four sub-stats, one owner each) | 17551 | 17567 | 17 |
| 4.8 | Role compression: five roles × three seniorities | 17568 | 17581 | 14 |
| 4.8 | Staff Shifts as a Placement Puzzle | 17582 | 17590 | 9 |
| 4.8 | Staff as Rendering Modifiers | 17591 | 17599 | 9 |
| 4.8 | The Hands Dock | 17600 | 17610 | 11 |
| 4.8 | The Staff Silhouette Set | 17611 | 17622 | 12 |
| 4.8 | The Fatigue Posture Ladder | 17623 | 17632 | 10 |
| 4.8 | Morale / Burnout (the playable states) | 17633 | 17646 | 14 |
| 4.8 | Staff Skill Pips | 17647 | 17652 | 6 |
| 4.8 | The Bus-Factor Halo | 17653 | 17660 | 8 |
| 4.8 | The Pager (as an object) | 17661 | 17666 | 6 |
| 4.8 | The Follow-the-Sun Band | 17667 | 17672 | 6 |
| 4.8 | Junior Sysadmin | 17673 | 17679 | 7 |
| 4.8 | The Sysadmin (generalist) | 17680 | 17682 | 3 |
| 4.8 | Senior SRE / Greybeard | 17683 | 17693 | 11 |
| 4.8 | The Legend | 17694 | 17699 | 6 |
| 4.8 | Network Engineer | 17700 | 17709 | 10 |
| 4.8 | DBA | 17710 | 17715 | 6 |
| 4.8 | Security Engineer / Security Analyst / SOC | 17716 | 17729 | 14 |
| 4.8 | Automation Engineer | 17730 | 17735 | 6 |
| 4.8 | Support Tier 1 / Tier 2 / Tier 3 | 17736 | 17747 | 12 |
| 4.8 | 24/7 Coverage | 17748 | 17752 | 5 |
| 4.8 | Offshore / Follow-the-Sun Support Pod | 17753 | 17761 | 9 |
| 4.8 | Sales Rep / SDR / AE / Sales Engineer | 17762 | 17774 | 13 |
| 4.8 | Account Manager / Customer Success Manager | 17775 | 17786 | 12 |
| 4.8 | Marketing Lead | 17787 | 17792 | 6 |
| 4.8 | Abuse / Trust & Safety | 17793 | 17804 | 12 |
| 4.8 | The Developer | 17805 | 17809 | 5 |
| 4.8 | The Intern | 17810 | 17815 | 6 |
| 4.8 | Datacenter Tech / Remote Hands | 17816 | 17829 | 14 |
| 4.8 | The Contractor / Consultant | 17830 | 17836 | 7 |
| 4.8 | Contractor Surge | 17837 | 17842 | 6 |
| 4.8 | The Contractor's Contractor | 17843 | 17848 | 6 |
| 4.8 | The Greybeard Consultant (rentable) | 17849 | 17853 | 5 |
| 4.8 | The Night-Shift Tech | 17854 | 17858 | 5 |
| 4.8 | The On-Call Rotation | 17859 | 17874 | 16 |
| 4.8 | Training / Certification Budget | 17875 | 17880 | 6 |
| 4.8 | Documentation Culture | 17881 | 17886 | 6 |
| 4.8 | Background-Checked Staff Pool | 17887 | 17893 | 7 |
| 4.8 | The Distributed-Team Toggle | 17894 | 17902 | 9 |
| 4.8 | Additional roles with real mechanics | 17903 | 17937 | 35 |
| 4.9 | Scoping rule: six departments, not forty buildings | 17944 | 17952 | 9 |
| 4.9 | Reveal schedule: nothing appears before its tier | 17953 | 17965 | 13 |
| 4.9 | The Rate Card / Price Book | 17966 | 17975 | 10 |
| 4.9 | Pricing Engine / The Plan Builder | 17976 | 18007 | 32 |
| 4.9 | Order Form / Storefront | 18008 | 18017 | 10 |
| 4.9 | Payment Gateway (primary + redundant) | 18018 | 18038 | 21 |
| 4.9 | Billing Platform / Billing Engine (WHMCS-alike) | 18039 | 18047 | 9 |
| 4.9 | Metering & Rating Engine | 18048 | 18062 | 15 |
| 4.9 | Revenue Assurance | 18063 | 18071 | 9 |
| 4.9 | Dunning Engine | 18072 | 18085 | 14 |
| 4.9 | Fraud / Risk Screening | 18086 | 18098 | 13 |
| 4.9 | Quote & Contract Desk / CPQ | 18099 | 18109 | 11 |
| 4.9 | Deal Desk / Discount Authority | 18110 | 18117 | 8 |
| 4.9 | Sales Compensation Plan (a tunable object, not a salary) | 18118 | 18129 | 12 |
| 4.9 | The Sales Floor | 18130 | 18135 | 6 |
| 4.9 | Win/Loss Interview Program | 18136 | 18143 | 8 |
| 4.9 | Customer Advisory Board / Reference Program | 18144 | 18156 | 13 |
| 4.9 | Customer Health Score Engine | 18157 | 18166 | 10 |
| 4.9 | The Trust Center / Security Portal | 18167 | 18177 | 11 |
| 4.9 | The Upsell Shelf | 18178 | 18198 | 21 |
| 4.9 | Self-Serve Portal / Customer Control Panel | 18199 | 18207 | 9 |
| 4.9 | API / Terraform Provider | 18208 | 18213 | 6 |
| 4.9 | Marketplace / App Store / Add-on Catalog | 18214 | 18219 | 6 |
| 4.9 | Affiliate Portal / Partner Program | 18220 | 18227 | 8 |
| 4.9 | Reseller / White-Label Portal | 18228 | 18232 | 5 |
| 4.9 | Partner Portal with Deal Registration | 18233 | 18242 | 10 |
| 4.9 | Partner Certification Program | 18243 | 18249 | 7 |
| 4.9 | Multi-Brand Storefronts | 18250 | 18260 | 11 |
| 4.9 | The Brand Building | 18261 | 18266 | 6 |
| 4.9 | Content Engine / SEO Rig | 18267 | 18269 | 3 |
| 4.9 | Ad Console | 18270 | 18275 | 6 |
| 4.9 | Knowledge Base / Docs | 18276 | 18282 | 7 |
| 4.9 | Social / Community Desk | 18283 | 18288 | 6 |
| 4.9 | PR / Comms Desk | 18289 | 18298 | 10 |
| 4.9 | Case Study Factory | 18299 | 18303 | 5 |
| 4.9 | Trust Badge Row | 18304 | 18310 | 7 |
| 4.9 | Ticketing / Helpdesk System | 18311 | 18314 | 4 |
| 4.9 | Live Chat | 18315 | 18323 | 9 |
| 4.9 | Phone Support | 18324 | 18327 | 4 |
| 4.9 | Follow-the-Sun NOC | 18328 | 18335 | 8 |
| 4.9 | Ticket Router / Triage AI | 18336 | 18338 | 3 |
| 4.9 | AI Support Agent | 18339 | 18349 | 11 |
| 4.9 | Onboarding / Migrations Team | 18350 | 18355 | 6 |
| 4.9 | Account Management / Renewals Desk | 18356 | 18360 | 5 |
| 4.9 | Collections Desk | 18361 | 18373 | 13 |
| 4.9 | Collections Agency Contract / Factoring Facility | 18374 | 18382 | 9 |
| 4.9 | The Retrieval / Egress Policy Desk | 18383 | 18389 | 7 |
| 4.9 | QA / Change-Management Board / Internal Audit | 18390 | 18396 | 7 |
| 4.9 | Compliance Vault / Compliance Office | 18397 | 18411 | 15 |
| 4.9 | The Subprocessor Register and DPA Desk | 18412 | 18419 | 8 |
| 4.9 | Legal Retainer | 18420 | 18427 | 8 |
| 4.9 | Cyber-Insurance Policy | 18428 | 18446 | 19 |
| 4.9 | Insurance Broker (the wider policy set) | 18447 | 18452 | 6 |
| 4.9 | E&O / SLA Reserve | 18453 | 18458 | 6 |
| 4.9 | Accounting / FP&A / Finance | 18459 | 18472 | 14 |
| 4.9 | Tax Engine / Nexus Monitor | 18473 | 18480 | 8 |
| 4.9 | Entity & Ring-Fence Structure | 18481 | 18492 | 12 |
| 4.9 | Transfer Pricing / Internal Chargeback | 18493 | 18501 | 9 |
| 4.9 | The Board / Investor Relations | 18502 | 18511 | 10 |
| 4.9 | Procurement Desk | 18512 | 18521 | 10 |
| 4.9 | Vendor Exit Plans | 18522 | 18528 | 7 |
| 4.9 | Vendor Diversity | 18529 | 18533 | 5 |
| 4.9 | Hardware Support Tier | 18534 | 18542 | 9 |
| 4.9 | OEM Capacity Reservation | 18543 | 18551 | 9 |
| 4.9 | ITAD Contract + Certificate of Destruction | 18552 | 18561 | 10 |
| 4.9 | Energy Hedge / PPA / Demand-Charge Manager | 18562 | 18571 | 10 |
| 4.9 | Reserved Capacity Contract / Transit Commit | 18572 | 18577 | 6 |
| 4.9 | The Yield Manager | 18578 | 18589 | 12 |
| 4.9 | The Backlog Board | 18590 | 18597 | 8 |
| 4.9 | The Comp-Account Auditor | 18598 | 18605 | 8 |
| 4.9 | The Renewal Calendar | 18606 | 18614 | 9 |
| 4.9 | Localisation and Regional Presence | 18615 | 18622 | 8 |
| 4.9 | Bug Bounty Program | 18623 | 18629 | 7 |
| 4.9 | Source Code / Data Escrow + Business Continuity Agreement | 18630 | 18637 | 8 |
| 4.9 | Business Continuity / DR Plan (the document, not the infrastructure) | 18638 | 18644 | 7 |
| 4.9 | Upstream Abuse Relationship | 18645 | 18651 | 7 |
| 4.9 | SLA Contract Tier (a product you define) | 18652 | 18661 | 10 |
| 4.9 | The Escort Desk | 18662 | 18668 | 7 |
| 4.9 | The Contract Clause Library — the legal tower tree | 18669 | 18705 | 37 |
| 4.10 | Authoring rule: skins on shared mechanics | 18711 | 18726 | 16 |
| 4.10 | Mail Server / MTA Cluster — "The Sorting Table" *(email)* | 18727 | 18734 | 8 |
| 4.10 | Outbound Relay with Per-Account Rate Limits *(email)* | 18735 | 18737 | 3 |
| 4.10 | Reputation Warm-Up IP Pool *(email)* | 18738 | 18743 | 6 |
| 4.10 | DKIM Signer / SPF + DMARC Config / Reverse DNS *(email)* | 18744 | 18747 | 4 |
| 4.10 | Feedback Loop Processor *(email)* | 18748 | 18750 | 3 |
| 4.10 | IP Reputation Manager *(email)* | 18751 | 18753 | 3 |
| 4.10 | Spam Filter Cluster / Mail Sorter *(email)* | 18754 | 18761 | 8 |
| 4.10 | DNS Authoritative Pair — "The Index Card Cabinet" *(any)* | 18762 | 18774 | 13 |
| 4.10 | Recursive Resolver (internal) *(any)* | 18775 | 18781 | 7 |
| 4.10 | NTP Source *(any)* | 18782 | 18784 | 3 |
| 4.10 | Anycast DNS Node / Signpost *(DNS)* | 18785 | 18787 | 3 |
| 4.10 | Response Rate Limiter (RRL) *(DNS)* | 18788 | 18790 | 3 |
| 4.10 | DNSSEC Signer + Expiry Monitor *(DNS)* | 18791 | 18793 | 3 |
| 4.10 | Secondary DNS with a *second provider* *(DNS)* | 18794 | 18796 | 3 |
| 4.10 | Origin Shield / Tiered Cache *(CDN)* | 18797 | 18799 | 3 |
| 4.10 | Purge Control / Rate-Limited Invalidation *(CDN)* | 18800 | 18802 | 3 |
| 4.10 | Cache Key Normalizer *(CDN)* | 18803 | 18805 | 3 |
| 4.10 | Bot Manager *(CDN)* | 18806 | 18808 | 3 |
| 4.10 | Erasure-Coded Pool / Erasure Coding Policy *(object storage)* | 18809 | 18811 | 3 |
| 4.10 | Scrub / Verify Runner *(storage, backup)* | 18812 | 18818 | 7 |
| 4.10 | Object Lock / WORM *(object storage)* | 18819 | 18821 | 3 |
| 4.10 | Lifecycle Tiering to Cold Storage *(object storage)* | 18822 | 18824 | 3 |
| 4.10 | Pull-Based Backup Orchestrator / Immutable Snapshot Vault *(backup)* | 18825 | 18827 | 3 |
| 4.10 | Restore Test Harness *(backup)* | 18828 | 18830 | 3 |
| 4.10 | Seed Drive Shipping *(backup)* | 18831 | 18835 | 5 |
| 4.10 | Tape Library + Robot / Drive Pool / Barcode System / Courier Contract / Media Rotation *(tape vaulting)* | 18836 | 18838 | 3 |
| 4.10 | The Legacy Drive Museum *(tape vaulting)* | 18839 | 18841 | 3 |
| 4.10 | Tick-Rate Optimized Node *(game hosting)* | 18842 | 18848 | 7 |
| 4.10 | Game Server Instance + Per-Instance IP Isolation *(game hosting)* | 18849 | 18851 | 3 |
| 4.10 | Player-Facing Proxy / IP Masking Layer *(game hosting)* | 18852 | 18855 | 4 |
| 4.10 | Matchmaker / Lobby Service *(game hosting)* | 18856 | 18862 | 7 |
| 4.10 | Anti-Cheat Service *(game hosting)* | 18863 | 18868 | 6 |
| 4.10 | One-Click Modpack Provisioner / Instant Server Rollback *(game hosting)* | 18869 | 18871 | 3 |
| 4.10 | Session Border Controller (SBC) *(VoIP)* | 18872 | 18876 | 5 |
| 4.10 | Spend Cap / Destination Whitelist / Fraud Anomaly Monitor *(VoIP)* | 18877 | 18882 | 6 |
| 4.10 | Transcode Farm *(video/streaming)* | 18883 | 18887 | 5 |
| 4.10 | Bitrate Ladder Config / Ingest Redundancy / Low-Latency Delivery Path / DVR Storage *(video)* | 18888 | 18890 | 3 |
| 4.10 | GPU Node / Liquid Cooling Loop / CDU *(GPU)* | 18891 | 18894 | 4 |
| 4.10 | High-Density Busway / Busbar *(GPU, colo)* | 18895 | 18897 | 3 |
| 4.10 | Power Capping Controller *(GPU)* | 18898 | 18900 | 3 |
| 4.10 | GPU Health Telemetry / Tamper-Evident Cabinets + Asset Tracking *(GPU)* | 18901 | 18903 | 3 |
| 4.10 | Job Checkpointing Service *(GPU, HPC)* | 18904 | 18906 | 3 |
| 4.10 | Job Scheduler + Preemption Policy *(GPU, HPC)* | 18907 | 18912 | 6 |
| 4.10 | Spot / Interruptible Tier *(GPU, any)* | 18913 | 18918 | 6 |
| 4.10 | Low-Latency Interconnect Fabric / Parallel Filesystem *(HPC)* | 18919 | 18921 | 3 |
| 4.10 | Node Health Check + Auto-Drain *(HPC)* | 18922 | 18924 | 3 |
| 4.10 | Control Plane HA / etcd Quorum / Admission Policy Engine / Resource Quotas / Progressive Delivery *(Kubernetes / PaaS)* | 18925 | 18927 | 3 |
| 4.10 | Chrysalis Pool / Warm Pool *(serverless)* | 18928 | 18930 | 3 |
| 4.10 | Cabinet / Cage / Private Suite *(colo)* | 18931 | 18933 | 3 |
| 4.10 | Metered PDU + Circuit Enforcement *(colo)* | 18934 | 18938 | 5 |
| 4.10 | Meet-Me Room + Cross Connect Panel *(colo)* | 18939 | 18941 | 3 |
| 4.10 | Carrier Diversity *(colo)* | 18942 | 18944 | 3 |
| 4.10 | Customer Portal with Power Graphs *(colo)* | 18945 | 18947 | 3 |
| 4.10 | Tour Route *(colo)* | 18948 | 18951 | 4 |
| 4.10 | Office / Customer Lounge *(colo)* | 18952 | 18954 | 3 |
| 4.10 | Escort Policy / Badge System / Lockable Cabinet Doors *(colo)* | 18955 | 18957 | 3 |
| 4.10 | Remote Hands (as a sellable product) *(colo)* | 18958 | 18960 | 3 |
| 4.10 | Compliance Boundary Paint *(regulated)* | 18961 | 18969 | 9 |
| 4.10 | Faraday Cage / SCIF *(regulated, government)* | 18970 | 18972 | 3 |
| 4.10 | Evidence Collection System / Quarterly Scan Vendor *(regulated)* | 18973 | 18975 | 3 |
| 4.10 | Residency Fence *(GDPR, data sovereignty)* | 18976 | 18978 | 3 |
| 4.10 | Abuse Desk *(shared, seedbox, bulletproof, email)* | 18979 | 18985 | 7 |
| 4.10 | Modem Bank / RAS / Terminal Server / RADIUS Auth *(dial-up)* | 18986 | 18989 | 4 |
| 4.10 | News Spool / Mail Spool / Shell Server / Web Ring Node / Telco PRI Lines *(period)* | 18990 | 18992 | 3 |
| 4.10 | The Dish *(satellite ground station)* | 18993 | 18995 | 3 |
| 4.10 | The Street Cabinet *(edge / MEC)* | 18996 | 18999 | 4 |
| 4.10 | Provisioning Automation *(shared, VPS, any volume business)* | 19000 | 19019 | 20 |
| 4.10 | Control Panel *(shared, VPS)* | 19020 | 19031 | 12 |
| 4.11 | Graceful Degradation | 19040 | 19045 | 6 |
| 4.11 | Backpressure / The Waiting Room | 19046 | 19052 | 7 |
| 4.11 | Load Shedding Policy | 19053 | 19056 | 4 |
| 4.11 | Change Review / Change Control | 19057 | 19063 | 7 |
| 4.11 | Change Freeze | 19064 | 19070 | 7 |
| 4.11 | Capacity Planning Policy | 19071 | 19075 | 5 |
| 4.11 | Auto-Scaling Policy | 19076 | 19079 | 4 |
| 4.11 | Terms of Service / Acceptable Use Policy | 19080 | 19086 | 7 |
| 4.11 | SLA Tier Definition | 19087 | 19089 | 3 |
| 4.11 | Compliance Package | 19090 | 19092 | 3 |
| 4.11 | Documentation | 19093 | 19096 | 4 |
| 4.11 | The Offboarding Checklist | 19097 | 19103 | 7 |
| 4.11 | The Escort Policy | 19104 | 19109 | 6 |
| 4.11 | The Abuse Triage Dial | 19110 | 19112 | 3 |
| 4.11 | The Refund Policy | 19113 | 19118 | 6 |
| 4.11 | Discount Authority | 19119 | 19121 | 3 |
| 4.11 | Mixed-Vendor Procurement Policy | 19122 | 19124 | 3 |
| 4.11 | The Company Handbook | 19125 | 19131 | 7 |
| 4.11 | Retention Schedule / Legal Hold | 19132 | 19134 | 3 |
| 4.11 | Anycast Withdrawal Policy · Escalation Matrix · MOP and Go/No-Go · Error Budget Policy | 19135 | 19139 | 5 |
| 4.12 | Managed Services Tier | 19146 | 19150 | 5 |
| 4.12 | Premium Support SLA | 19151 | 19156 | 6 |
| 4.12 | Backup-as-an-Add-on | 19157 | 19161 | 5 |
| 4.12 | DDoS Protection Tier | 19162 | 19164 | 3 |
| 4.12 | Monitoring as a Product | 19165 | 19167 | 3 |
| 4.12 | Migration Services | 19168 | 19170 | 3 |
| 4.12 | Dedicated IP / SSL / Domain Registration | 19171 | 19174 | 4 |
| 4.12 | Compliance-Ready Hosting | 19175 | 19177 | 3 |
| 4.12 | Reserved Capacity / Committed-Use Discounts | 19178 | 19181 | 4 |
| 4.12 | Spot / Preemptible Capacity | 19182 | 19185 | 4 |
| 4.12 | Colo Cross-Connect | 19186 | 19188 | 3 |
| 4.12 | IPv4 Leasing | 19189 | 19191 | 3 |
| 4.12 | Bandwidth Resale / Transit | 19192 | 19194 | 3 |
| 4.12 | White-Label Everything | 19195 | 19199 | 5 |
| 4.12 | Remote Hands / Smart Hands | 19200 | 19202 | 3 |
| 4.12 | Escrow, Evidence Packs and Audit Artifacts | 19203 | 19207 | 5 |
| 4.13 | Emergency Scrubbing Activation | 19216 | 19220 | 5 |
| 4.13 | Burst Transit | 19221 | 19226 | 6 |
| 4.13 | Rented Hands | 19227 | 19229 | 3 |
| 4.13 | Competitor Capacity | 19230 | 19235 | 6 |
| 4.13 | Emergency Courier / Expedited Freight | 19236 | 19238 | 3 |
| 4.13 | Emergency Fuel Delivery | 19239 | 19242 | 4 |
| 4.13 | The Rule | 19243 | 19249 | 7 |
| 4.14 | The Back Office Mezzanine | 19255 | 19271 | 17 |
| 4.14 | The Desk Grammar | 19272 | 19281 | 10 |
| 5.1 | Scar-driven progression (the core principle) | 19286 | 19298 | 13 |
| 5.1 | Postmortem Research (the primary engine) | 19299 | 19327 | 29 |
| 5.1 | The three acquisition paths (Scar / Foresight / Testimony) | 19328 | 19345 | 18 |
| 5.1 | Earn the right to be trusted (the CEO framing) | 19346 | 19355 | 10 |
| 5.1 | Three unlock currencies, three feelings | 19356 | 19366 | 11 |
| 5.1 | The Anticipation Track (unlocking by prediction, not only by suffering) | 19367 | 19381 | 15 |
| 5.1 | Seeded threat introduction order | 19382 | 19388 | 7 |
| 5.1 | The Second Answer rule (every threat has ≥2 counters at different prices) | 19389 | 19404 | 16 |
| 5.1 | The Scar Tree | 19405 | 19425 | 21 |
| 5.1 | Postmortem → Prevention, and Unlock Drafts (pick one of three) | 19426 | 19437 | 12 |
| 5.1 | The Postmortem minigame | 19438 | 19444 | 7 |
| 5.1 | Symptom → Hypothesis → Tool | 19445 | 19451 | 7 |
| 5.1 | Teach through loss, never through text (and the Near-Miss clause) | 19452 | 19464 | 13 |
| 5.1 | Discovery, not just purchase | 19465 | 19472 | 8 |
| 5.1 | The unlock trigger taxonomy | 19473 | 19494 | 22 |
| 5.2 | Certificate expiry ladder | 19503 | 19512 | 10 |
| 5.2 | First "everything is green but customers are down" | 19513 | 19519 | 7 |
| 5.2 | First backup restore failure — *and the earlier, kinder trigger* | 19520 | 19534 | 15 |
| 5.2 | First Slowloris | 19535 | 19541 | 7 |
| 5.2 | First OOM kill of the database | 19542 | 19544 | 3 |
| 5.2 | First cache stampede | 19545 | 19550 | 6 |
| 5.2 | First correlated batch drive failure | 19551 | 19554 | 4 |
| 5.2 | First rebuild failure during a degraded RAID | 19555 | 19560 | 6 |
| 5.2 | First breach | 19561 | 19566 | 6 |
| 5.2 | First blocklist listing | 19567 | 19573 | 7 |
| 5.2 | First alert-fatigue-induced miss | 19574 | 19576 | 3 |
| 5.2 | First bad fleet-wide config run | 19577 | 19579 | 3 |
| 5.2 | First time a firewall rule locked you out of your own estate | 19580 | 19587 | 8 |
| 5.2 | First split-brain | 19588 | 19590 | 3 |
| 5.2 | First BGP incident | 19591 | 19593 | 3 |
| 5.2 | First BGP dampening event | 19594 | 19599 | 6 |
| 5.2 | First health-check flap cascade | 19600 | 19602 | 3 |
| 5.2 | First retry storm you caused yourself | 19603 | 19608 | 6 |
| 5.2 | First time you lost a whole rack to a single PDU | 19609 | 19612 | 4 |
| 5.2 | First gray failure discovered the hard way | 19613 | 19616 | 4 |
| 5.2 | First unidirectional link failure | 19617 | 19619 | 3 |
| 5.2 | First microburst-caused drop with a flat graph | 19620 | 19625 | 6 |
| 5.2 | First thin-pool exhaustion | 19626 | 19628 | 3 |
| 5.2 | First "nothing changed" incident | 19629 | 19634 | 6 |
| 5.2 | First time your alerting path was down with the service | 19635 | 19637 | 3 |
| 5.2 | First time you needed a switch config you didn't have | 19638 | 19640 | 3 |
| 5.2 | First incident where three engineers duplicated each other's work | 19641 | 19643 | 3 |
| 5.2 | First RFO demanded by a customer | 19644 | 19646 | 3 |
| 5.2 | First time a customer's pentest found something you didn't | 19647 | 19650 | 4 |
| 5.2 | First break-glass need | 19651 | 19653 | 3 |
| 5.2 | First counterfeit / grey-market part failure | 19654 | 19656 | 3 |
| 5.2 | First decommission that broke something | 19657 | 19659 | 3 |
| 5.2 | First warranty-expiry incident | 19660 | 19662 | 3 |
| 5.2 | First DR declaration you could not honour | 19663 | 19668 | 6 |
| 5.2 | First time the lab became production | 19669 | 19671 | 3 |
| 5.2 | First chargeback | 19672 | 19675 | 4 |
| 5.2 | First key employee quits | 19676 | 19679 | 4 |
| 5.2 | First traffic spike survived | 19680 | 19682 | 3 |
| 5.2 | First DB built | 19683 | 19685 | 3 |
| 5.2 | First hardware failure | 19686 | 19688 | 3 |
| 5.2 | First customer churn | 19689 | 19691 | 3 |
| 5.2 | First low-and-slow attack detected | 19692 | 19694 | 3 |
| 5.2 | First chaos test run | 19695 | 19697 | 3 |
| 5.2 | First abuse complaint received | 19698 | 19702 | 5 |
| 5.2 | First refund demanded | 19703 | 19705 | 3 |
| 5.2 | First outage with customers on it | 19706 | 19708 | 3 |
| 5.2 | First SLA credit paid | 19709 | 19711 | 3 |
| 5.2 | First churn survey response | 19712 | 19714 | 3 |
| 5.2 | First customer who came from another customer | 19715 | 19717 | 3 |
| 5.2 | First enterprise prospect | 19718 | 19722 | 5 |
| 5.2 | First month where support cost > 30% of revenue | 19723 | 19726 | 4 |
| 5.2 | First cash crunch | 19727 | 19729 | 3 |
| 5.2 | First annual prepay | 19730 | 19732 | 3 |
| 5.2 | First employee / first employee quitting | 19733 | 19735 | 3 |
| 5.2 | First acquisition offer received / first acquisition made | 19736 | 19738 | 3 |
| 5.2 | Lose a whale | 19739 | 19741 | 3 |
| 5.2 | Running out of IPv4 | 19742 | 19745 | 4 |
| 5.2 | Overheating a rack | 19746 | 19749 | 4 |
| 5.2 | Surviving a full power outage on generator | 19750 | 19753 | 4 |
| 5.2 | A customer's ransomware event | 19754 | 19757 | 4 |
| 5.2 | Firing an abusive customer | 19758 | 19761 | 4 |
| 5.2 | Handling a security Researcher well | 19762 | 19764 | 3 |
| 5.2 | Winning a bidding war against The Competitor | 19765 | 19767 | 3 |
| 5.2 | Completing a no-downtime migration | 19768 | 19771 | 4 |
| 5.2 | Passing an audit | 19772 | 19775 | 4 |
| 5.2 | Peering at an IX | 19776 | 19778 | 3 |
| 5.2 | Business scars (the commercial half of the table) | 19779 | 19804 | 26 |
| 5.2 | Failure-Only Nodes | 19805 | 19817 | 13 |
| 5.3 | The milestone law (the threshold is the consequence, not the count) | 19820 | 19831 | 12 |
| 5.3 | Scale milestones (infrastructure) | 19832 | 19850 | 19 |
| 5.3 | Operational-threshold milestones (the numbers that change how the job *feels*) | 19851 | 19869 | 19 |
| 5.3 | Commercial-threshold milestones | 19870 | 19885 | 16 |
| 5.3 | Invisible-save milestones (the achievements nobody else can see) | 19886 | 19901 | 16 |
| 5.4 | The Threat Codex / Bestiary (fill-in-the-blank) | 19904 | 19939 | 36 |
| 5.4 | Progressive Icon Disclosure | 19940 | 19950 | 11 |
| 5.4 | Asset Discovery Scan / The Audit Sweep | 19951 | 19959 | 9 |
| 5.4 | The Discovery Ledger (making the scan a recurring, positive action) | 19960 | 19973 | 14 |
| 5.4 | The External Attack Surface Scan | 19974 | 19985 | 12 |
| 5.4 | Certificate Inventory Discovery | 19986 | 19992 | 7 |
| 5.4 | Growth Ceiling Discovery | 19993 | 20001 | 9 |
| 5.4 | Change Correlation ("What changed?") | 20002 | 20011 | 10 |
| 5.4 | The Scream Test (an unlockable verb) | 20012 | 20022 | 11 |
| 5.4 | Bisection (an unlockable verb) | 20023 | 20029 | 7 |
| 5.4 | The Depth Test | 20030 | 20037 | 8 |
| 5.4 | Packet Capture (the expensive, definitive, late-game tool) | 20038 | 20048 | 11 |
| 5.4 | Flow Records and Traffic Archaeology | 20049 | 20057 | 9 |
| 5.4 | Traffic Analysis | 20058 | 20064 | 7 |
| 5.4 | Cable Tracing / Cable Archaeology | 20065 | 20072 | 8 |
| 5.4 | The Undocumented Dependency | 20073 | 20079 | 7 |
| 5.4 | The Undocumented Machine | 20080 | 20086 | 7 |
| 5.4 | The Forgotten Subnet | 20087 | 20092 | 6 |
| 5.4 | The Ghost Customer | 20093 | 20099 | 7 |
| 5.4 | The Inherited Estate | 20100 | 20106 | 7 |
| 5.4 | Log Archaeology / Log Reading (active discovery) | 20107 | 20116 | 10 |
| 5.4 | Threat Hunting | 20117 | 20123 | 7 |
| 5.4 | Hardware Autopsy | 20124 | 20130 | 7 |
| 5.4 | Honeypot Intel | 20131 | 20137 | 7 |
| 5.4 | Reverse-Engineering an Attack | 20138 | 20147 | 10 |
| 5.4 | Boss Blueprints | 20148 | 20154 | 7 |
| 5.4 | Blueprint Fragments (repurposed as partial intelligence) | 20155 | 20167 | 13 |
| 5.4 | The Runbook Ladder | 20168 | 20195 | 28 |
| 5.4 | The Runbook Library | 20196 | 20205 | 10 |
| 5.4 | Post-Mortem Writeup (blameless postmortems as an XP mechanic) | 20206 | 20214 | 9 |
| 5.4 | The Post-Mortem Photo | 20215 | 20225 | 11 |
| 5.4 | The Graph You Didn't Have | 20226 | 20231 | 6 |
| 5.4 | The Fog of Instrumentation | 20232 | 20245 | 14 |
| 5.4 | X-Ray Inspector | 20246 | 20255 | 10 |
| 5.4 | Chaos Engineering Lab | 20256 | 20259 | 4 |
| 5.4 | Load Testing Rig | 20260 | 20263 | 4 |
| 5.4 | Tabletop Exercise | 20264 | 20267 | 4 |
| 5.4 | Postcard from the Future / Capacity Forecast | 20268 | 20274 | 7 |
| 5.4 | Vendor Advisory Feed | 20275 | 20281 | 7 |
| 5.4 | The Vendor's Own RFO | 20282 | 20290 | 9 |
| 5.4 | The Reading Room | 20291 | 20298 | 8 |
| 5.4 | The Competitor's Postmortem | 20299 | 20306 | 8 |
| 5.4 | The Customer's Pentest Report | 20307 | 20314 | 8 |
| 5.4 | Threat Intel Sharing / Peer Network | 20315 | 20319 | 5 |
| 5.4 | The Escalation Ladder (vendor relationship as a mechanic) | 20320 | 20328 | 9 |
| 5.4 | Vendor Demo / The Vendor Trial | 20329 | 20337 | 9 |
| 5.4 | Vendor Relationships | 20338 | 20350 | 13 |
| 5.4 | Job Applicant Skills / Staff-Carried Knowledge | 20351 | 20362 | 12 |
| 5.4 | The Conference Talk | 20363 | 20373 | 11 |
| 5.4 | The Field Trip | 20374 | 20380 | 7 |
| 5.4 | The Standards Body | 20381 | 20389 | 9 |
| 5.4 | Research Papers / Conference Talks (the library path) | 20390 | 20393 | 4 |
| 5.4 | The Mentor | 20394 | 20399 | 6 |
| 5.4 | Reading the Docs | 20400 | 20406 | 7 |
| 5.4 | The Scale Threshold Reveal | 20407 | 20413 | 7 |
| 5.4 | The Mystery Box Reverse-Engineer | 20414 | 20419 | 6 |
| 5.4 | Competitor Intel | 20420 | 20425 | 6 |
| 5.4 | The Competitor Teardown | 20426 | 20431 | 6 |
| 5.4 | Trade Show Serendipity | 20432 | 20435 | 4 |
| 5.4 | Customer Conversations / Discovery by Customer Request | 20436 | 20444 | 9 |
| 5.4 | The Accidental Niche | 20445 | 20450 | 6 |
| 5.4 | The Feature You Built for One Customer | 20451 | 20456 | 6 |
| 5.4 | The Support Macro That Became a Product | 20457 | 20459 | 3 |
| 5.4 | The Log That Told You Something | 20460 | 20465 | 6 |
| 5.4 | Business discoveries (the economics you learn by running into them) | 20466 | 20504 | 39 |
| 5.4 | Discovery by Incident Adjacency (near misses teach too) | 20505 | 20512 | 8 |
| 5.4 | The Rumor Board | 20513 | 20519 | 7 |
| 5.4 | The Acquisition Folder | 20520 | 20526 | 7 |
| 5.4 | The Overlay Unlocks (new ways to see) | 20527 | 20534 | 8 |
| 5.4 | Open Source Contribution | 20535 | 20542 | 8 |
| 5.5 | The six-branch spine (Serve / Shield / Scale / Sustain / Sell / Sense) | 20545 | 20571 | 27 |
| 5.5 | The shared tree, the per-type Loadout | 20572 | 20580 | 9 |
| 5.5 | Crossover Nodes ("Transferred Knowledge") | 20581 | 20589 | 9 |
| 5.5 | The CEO branches | 20590 | 20611 | 22 |
| 5.5 | Branch ladders (the concrete step sequences) | 20612 | 20658 | 47 |
| 5.5 | Cross-Branch Synergy Nodes | 20659 | 20669 | 11 |
| 5.5 | Mutually Exclusive Forks | 20670 | 20678 | 9 |
| 5.5 | Mutually Exclusive Doctrines (one per campaign act) | 20679 | 20686 | 8 |
| 5.5 | The Doctrine card (a loadout you declare before a level) | 20687 | 20702 | 16 |
| 5.5 | Regret Nodes | 20703 | 20718 | 16 |
| 5.5 | Certification Gates | 20719 | 20726 | 8 |
| 5.5 | Rival Tech / Espionage | 20727 | 20732 | 6 |
| 5.5 | Rediscovery / Prestige | 20733 | 20739 | 7 |
| 5.5 | Retired Tech (the tree keeps moving) | 20740 | 20746 | 7 |
| 5.5 | The Whiteboard Tree (the tree is a diegetic object) | 20747 | 20755 | 9 |
| 5.6 | The prerequisite lattice | 20762 | 20788 | 27 |
| 5.6 | The commercial prerequisites | 20789 | 20807 | 19 |
| 5.6 | Alternative prerequisite sets (two or three routes into every line) | 20808 | 20818 | 11 |
| 5.6 | The visible lattice, with readable locks | 20819 | 20827 | 9 |
| 5.6 | The playable 12 months (making the best gate interactive) | 20828 | 20836 | 9 |
| 5.6 | The Pivot Lattice (what a pivot actually costs) | 20837 | 20852 | 16 |
| 5.6 | The line catalogue (every pivot, its gate, and what it does to you) | 20853 | 20917 | 65 |
| 5.6 | The Adjacent Opportunity | 20918 | 20924 | 7 |
| 5.6 | Discovery by Customer Request (the customer is the tech tree) | 20925 | 20931 | 7 |
| 5.6 | Repurposing | 20932 | 20943 | 12 |
| 5.6 | Type Mastery / cross-line buffs | 20944 | 20951 | 8 |
| 5.6 | Retiring a line, and the knowledge you keep (the distillate) | 20952 | 20962 | 11 |
| 5.6 | The Certification Ladder | 20963 | 20970 | 8 |
| 5.6 | Carrier & Peering unlocks | 20971 | 20978 | 8 |
| 5.6 | The Era Unlock | 20979 | 20986 | 8 |
| 5.6 | Geography unlocks | 20987 | 20993 | 7 |
| 5.6 | The Reputation Gate (both directions) | 20994 | 21001 | 8 |
| 5.6 | Portfolio unlocks | 21002 | 21009 | 8 |
| 5.7 | The Deprecation Mechanic | 21012 | 21036 | 25 |
| 5.7 | Concerns ratchet, implementations rot, eras gate | 21037 | 21045 | 9 |
| 5.7 | Product rot (commercial deprecation, which is worse) | 21046 | 21055 | 10 |
| 5.7 | The accreditation-loss rule | 21056 | 21064 | 9 |
| 5.7 | Lapsed certification | 21065 | 21072 | 8 |
| 5.7 | Losing insurability | 21073 | 21079 | 7 |
| 5.7 | Losing peering | 21080 | 21085 | 6 |
| 5.7 | Losing a brand | 21086 | 21091 | 6 |
| 5.7 | Losing the recommended-host slot | 21092 | 21097 | 6 |
| 5.7 | Losing your acquirer relationship | 21098 | 21104 | 7 |
| 5.7 | The commission residual you can never stop paying | 21105 | 21112 | 8 |
| 5.7 | Three SLA breaches | 21113 | 21118 | 6 |
| 5.7 | Burned affiliate relationships | 21119 | 21124 | 6 |
| 5.7 | Fired the CSM / cut the content team | 21125 | 21132 | 8 |
| 5.7 | Knowledge decay | 21133 | 21141 | 9 |
| 5.7 | The Abandoned Wing | 21142 | 21151 | 10 |
| 5.7 | The Rot Materials | 21152 | 21163 | 12 |
| 5.8 | The Unlock Ceremony Tiers | 21169 | 21181 | 13 |
| 5.8 | The Whiteboard Tree / The Tech Wall | 21182 | 21191 | 10 |
| 5.8 | The Marker Colour Code | 21192 | 21199 | 8 |
| 5.8 | The Whiteboard at Scale | 21200 | 21209 | 10 |
| 5.8 | Blueprint Export as a Reward | 21210 | 21216 | 7 |
| 5.8 | The Blueprint Tube | 21217 | 21223 | 7 |
| 5.8 | Rack Elevation Catalog | 21224 | 21231 | 8 |
| 5.8 | Rack Mail — "The Catalog" | 21232 | 21237 | 6 |
| 5.8 | The Trade Show Floor | 21238 | 21244 | 7 |
| 5.8 | The Lab Bench / Research Bench | 21245 | 21252 | 8 |
| 5.8 | Floorplan Blueprint | 21253 | 21259 | 7 |
| 5.8 | The Pegboard (specified) | 21260 | 21267 | 8 |
| 5.8 | The PCB Trace Tree (alternate unlock skin) | 21268 | 21275 | 8 |
| 5.8 | Censored Silhouettes | 21276 | 21281 | 6 |
| 5.8 | The Confidence Stroke Law | 21282 | 21293 | 12 |
| 5.8 | Certification Wall / Trophy Rack / The Seal Wall | 21294 | 21301 | 8 |
| 5.8 | The Sticker Progression | 21302 | 21308 | 7 |
| 5.8 | The Patch Jacket | 21309 | 21316 | 8 |
| 5.8 | The Dead Drive Shelf (prestige) | 21317 | 21322 | 6 |
| 5.8 | The Hiring Board | 21323 | 21328 | 6 |
| 5.8 | The Vendor Rolodex | 21329 | 21335 | 7 |
| 5.8 | The Delivery | 21336 | 21343 | 8 |
| 5.8 | Faceplate Reveal / Blueprint Stamp | 21344 | 21350 | 7 |
| 5.8 | The Lights Come On | 21351 | 21357 | 7 |
| 5.8 | Zoom Tier as an Unlock | 21358 | 21363 | 6 |
| 5.8 | Tier-Up Title Card | 21364 | 21369 | 6 |
| 5.8 | The Overlay Reveal | 21370 | 21374 | 5 |
| 5.8 | Business License Board / Pivot Blueprint / The Sign-Bolt | 21375 | 21386 | 12 |
| 5.8 | The Wing Build-Out | 21387 | 21392 | 6 |
| 5.8 | The Business Licence Wall (with a lifecycle) | 21393 | 21400 | 8 |
| 5.8 | Cross-Line Synergy Glyphs | 21401 | 21406 | 6 |
| 5.8 | Whiteboard Redraw | 21407 | 21412 | 6 |
| 5.8 | The Runbook Binder Tabs | 21413 | 21418 | 6 |
| 5.8 | The Post-Mortem Polaroid wall | 21419 | 21426 | 8 |
| 5.8 | The Conference Talk (as a presentation beat) | 21427 | 21431 | 5 |
| 5.9 | Capability vs Permission (the shape) | 21438 | 21448 | 11 |
| 5.9 | Payment and processing unlocks | 21449 | 21459 | 11 |
| 5.9 | Working-capital unlocks | 21460 | 21478 | 19 |
| 5.9 | Vendor and supply-chain unlocks | 21479 | 21489 | 11 |
| 5.9 | Network and numbering unlocks | 21490 | 21504 | 15 |
| 5.9 | Compliance and audit unlocks | 21505 | 21523 | 19 |
| 5.9 | Facility and jurisdiction unlocks | 21524 | 21534 | 11 |
| 5.9 | Channel and marketplace unlocks | 21535 | 21549 | 15 |
| 5.10 | First Case Study | 21555 | 21560 | 6 |
| 5.10 | Three Logos | 21561 | 21567 | 7 |
| 5.10 | Community Standing | 21568 | 21573 | 6 |
| 5.10 | Analyst Coverage | 21574 | 21579 | 6 |
| 5.10 | Uptime Streak | 21580 | 21586 | 7 |
| 5.10 | Published Post-Mortem Credibility | 21587 | 21593 | 7 |
| 5.10 | Open-Source Sponsorship | 21594 | 21600 | 7 |
| 5.10 | Conference Speaking Slot | 21601 | 21606 | 6 |
| 5.10 | The "we've been through it" modifier | 21607 | 21615 | 9 |
| 5.11 | First Hire | 21621 | 21626 | 6 |
| 5.11 | The First Salesperson | 21627 | 21633 | 7 |
| 5.11 | The First Accountant / Controller | 21634 | 21640 | 7 |
| 5.11 | A Real CTO | 21641 | 21646 | 6 |
| 5.11 | A COO | 21647 | 21652 | 6 |
| 5.11 | An Abuse / Trust & Safety Lead | 21653 | 21658 | 6 |
| 5.11 | A CFO | 21659 | 21661 | 3 |
| 5.11 | A Board | 21662 | 21665 | 4 |
| 5.11 | On-Call Rotation | 21666 | 21671 | 6 |
| 5.11 | Runbook Library (as an org unlock) | 21672 | 21674 | 3 |
| 5.11 | The Apprenticeship (growing your own) | 21675 | 21683 | 9 |
| 5.11 | Knowledge as a transferable asset (the staff carry the tree) | 21684 | 21697 | 14 |
| 5.11 | The Wiki | 21698 | 21704 | 7 |
| 5.11 | The Mentor relationship (NPC) | 21705 | 21708 | 4 |
| 5.11 | The Conference / Community channel | 21709 | 21714 | 6 |
| 5.12 | The Research Queue (how research actually happens) | 21720 | 21729 | 10 |
| 5.12 | The Spike | 21730 | 21738 | 9 |
| 5.12 | Negative Discovery (learning what you don't need) | 21739 | 21746 | 8 |
| 5.12 | The Debt Unlock (borrow a capability now, pay interest) | 21747 | 21756 | 10 |
| 5.12 | Sealed Capability (you own it, but it doesn't work until you drill it) | 21757 | 21770 | 14 |
| 5.12 | Unlock cadence spec (how often, and what kind) | 21771 | 21784 | 14 |
| 5.12 | Unlock Rationing (the hard cap) | 21785 | 21797 | 13 |
| 5.12 | Hardware Generation Unlocks (time, not achievement) | 21798 | 21807 | 10 |
| 5.12 | The Debt-to-Capability Conversion (refactoring as research) | 21808 | 21815 | 8 |
| 5.12 | Unlock by Decommission | 21816 | 21824 | 9 |
| 5.12 | The Deprecation Notice You Wrote | 21825 | 21832 | 8 |
| 5.12 | Intel as a spendable currency | 21833 | 21843 | 11 |
| 6.1 | Cash (the survival currency) | 21859 | 21868 | 10 |
| 6.1 | The Runway Bar (the actual health bar) | 21869 | 21882 | 14 |
| 6.1 | MRR (the growth currency) | 21883 | 21897 | 15 |
| 6.1 | Revenue Quality — colour the money (T2) | 21898 | 21918 | 21 |
| 6.1 | Error Budget (the spendable in-combat currency) | 21919 | 21953 | 35 |
| 6.1 | Reputation split into Visibility and Trust | 21954 | 21975 | 22 |
| 6.1 | Intel / Knowledge | 21976 | 21982 | 7 |
| 6.1 | Hands / Attention (staff-time) | 21983 | 21990 | 8 |
| 6.1 | Trust-with-upstreams (the hidden fifth, made real) | 21991 | 22007 | 17 |
| 6.1 | Power and space (physical currencies) | 22008 | 22015 | 8 |
| 6.1 | Lead time (the currency you cannot buy with money) | 22016 | 22025 | 10 |
| 6.1 | Receivables (money that is real and unspendable) | 22026 | 22032 | 7 |
| 6.1 | The Heat meter (the grey-play currency) | 22033 | 22043 | 11 |
| 6.1 | EBITDA / contribution margin (the quality meter) | 22044 | 22052 | 9 |
| 6.1 | The Three-Bucket Budget (Grow / Defend / Sustain) | 22053 | 22066 | 14 |
| 6.1 | The Three Budgets (capex / opex / hands, with lossy conversion) | 22067 | 22080 | 14 |
| 6.2 | The recurring core (MRR) | 22086 | 22096 | 11 |
| 6.2 | Annual and multi-year prepay | 22097 | 22106 | 10 |
| 6.2 | Setup, provisioning, and one-time fees | 22107 | 22116 | 10 |
| 6.2 | Overage and usage billing (metered) | 22117 | 22128 | 12 |
| 6.2 | 95th-percentile bandwidth revenue (selling what you buy) | 22129 | 22136 | 8 |
| 6.2 | Add-ons, upsells, and the attach-rate economy | 22137 | 22148 | 12 |
| 6.2 | Managed services and support plans | 22149 | 22155 | 7 |
| 6.2 | Professional services and migrations | 22156 | 22164 | 9 |
| 6.2 | Premium support tiers | 22165 | 22170 | 6 |
| 6.2 | Cross-connect fees | 22171 | 22176 | 6 |
| 6.2 | Remote hands / smart hands | 22177 | 22184 | 8 |
| 6.2 | Power resale (colo) | 22185 | 22194 | 10 |
| 6.2 | Space rent (colo) | 22195 | 22197 | 3 |
| 6.2 | Reserved / committed / prepaid capacity | 22198 | 22207 | 10 |
| 6.2 | Spot / preemptible sales | 22208 | 22216 | 9 |
| 6.2 | Domain registration and renewal | 22217 | 22223 | 7 |
| 6.2 | SSL, licences, and third-party resale | 22224 | 22230 | 7 |
| 6.2 | Marketplace and platform revenue | 22231 | 22236 | 6 |
| 6.2 | Reseller and white-label programs | 22237 | 22243 | 7 |
| 6.2 | Wholesale / peering / transit resale | 22244 | 22253 | 10 |
| 6.2 | Transit blend tiering (premium network as a SKU) | 22254 | 22260 | 7 |
| 6.2 | IPv4 address leasing | 22261 | 22267 | 7 |
| 6.2 | Data egress (the villain revenue) | 22268 | 22276 | 9 |
| 6.2 | Retrieval and early-deletion fees (archive tiers) | 22277 | 22282 | 6 |
| 6.2 | Backup / DR retainer | 22283 | 22288 | 6 |
| 6.2 | Demand-response and grid-services payments | 22289 | 22299 | 11 |
| 6.2 | Heat reuse | 22300 | 22305 | 6 |
| 6.2 | Threat Intel feed | 22306 | 22311 | 6 |
| 6.2 | MDF and vendor co-op marketing | 22312 | 22317 | 6 |
| 6.2 | Referral income and overflow monetization | 22318 | 22323 | 6 |
| 6.2 | Termination and early-exit fees (ETF) | 22324 | 22330 | 7 |
| 6.2 | Asset resale and scrap recovery | 22331 | 22338 | 8 |
| 6.2 | Sale-leaseback | 22339 | 22345 | 7 |
| 6.2 | SLA credits (negative revenue) | 22346 | 22352 | 7 |
| 6.2 | Referral and affiliate payouts (negative revenue) | 22353 | 22359 | 7 |
| 6.2 | The whale contract | 22360 | 22365 | 6 |
| 6.2 | Margin ranking (the honest hierarchy) | 22366 | 22382 | 17 |
| 6.3 | Hardware (capex) and the depreciation curve | 22391 | 22406 | 16 |
| 6.3 | Bandwidth: the 95th-percentile bill | 22407 | 22446 | 40 |
| 6.3 | Power, PUE, and cooling | 22447 | 22463 | 17 |
| 6.3 | The Demand Charge (the 95th percentile of electricity) | 22464 | 22483 | 20 |
| 6.3 | kVA vs kW, power factor, and the 80% you can actually sell | 22484 | 22496 | 13 |
| 6.3 | Power purchase structures | 22497 | 22506 | 10 |
| 6.3 | Space and facility | 22507 | 22515 | 9 |
| 6.3 | Licensing | 22516 | 22525 | 10 |
| 6.3 | The true-up | 22526 | 22533 | 8 |
| 6.3 | Payroll and the true cost of people | 22534 | 22543 | 10 |
| 6.3 | Support cost-to-serve | 22544 | 22563 | 20 |
| 6.3 | Customer acquisition cost (CAC) | 22564 | 22577 | 14 |
| 6.3 | Transaction and payment costs | 22578 | 22593 | 16 |
| 6.3 | Abuse cost | 22594 | 22603 | 10 |
| 6.3 | Compliance and audit cost | 22604 | 22609 | 6 |
| 6.3 | Insurance, legal, and the SLA reserve | 22610 | 22625 | 16 |
| 6.3 | Support contracts and warranties | 22626 | 22633 | 8 |
| 6.3 | The RMA pipeline | 22634 | 22643 | 10 |
| 6.3 | The Truck Roll | 22644 | 22650 | 7 |
| 6.3 | Circuit contract liabilities (NRC, MRC, term, ETL) | 22651 | 22661 | 11 |
| 6.3 | Egress to your own DR site | 22662 | 22669 | 8 |
| 6.3 | Transit commits and take-or-pay | 22670 | 22676 | 7 |
| 6.3 | Double-running during migration | 22677 | 22680 | 4 |
| 6.3 | Marketing spend (as a cost with a lag) | 22681 | 22683 | 3 |
| 6.3 | Bad debt, chargebacks, and fraud loss | 22684 | 22692 | 9 |
| 6.3 | Decommissioning and e-waste disposal | 22693 | 22699 | 7 |
| 6.3 | Interest and debt service | 22700 | 22705 | 6 |
| 6.3 | Toil (the staff-hour cost of every shortcut) | 22706 | 22712 | 7 |
| 6.3 | Technical debt interest | 22713 | 22728 | 16 |
| 6.3 | Churn (the cost that isn't a cost) | 22729 | 22735 | 7 |
| 6.3 | The trap list (costs that look like nothing and eat you) | 22736 | 22749 | 14 |
| 6.4 | Cash vs Profit (the two ledgers) | 22756 | 22779 | 24 |
| 6.4 | Net-30 / 60 / 90 — and why net-60 is really net-75 | 22780 | 22792 | 13 |
| 6.4 | Deferred revenue | 22793 | 22801 | 9 |
| 6.4 | Annual prepay discount | 22802 | 22809 | 8 |
| 6.4 | The refund window and the money-back guarantee | 22810 | 22815 | 6 |
| 6.4 | Involuntary churn and dunning | 22816 | 22832 | 17 |
| 6.4 | The invoice calendar | 22833 | 22848 | 16 |
| 6.4 | The Payroll Clock | 22849 | 22855 | 7 |
| 6.4 | Seasonality | 22856 | 22864 | 9 |
| 6.4 | Capex lead time | 22865 | 22873 | 9 |
| 6.4 | Working capital in hardware | 22874 | 22880 | 7 |
| 6.4 | Vendor terms (AP as a lever) | 22881 | 22884 | 4 |
| 6.4 | Deposits and prepay requirements | 22885 | 22891 | 7 |
| 6.4 | The credit line | 22892 | 22899 | 8 |
| 6.4 | Runway | 22900 | 22913 | 14 |
| 6.4 | The working-capital squeeze (you can lose by winning) | 22914 | 22921 | 8 |
| 6.4 | The cash conversion cycle | 22922 | 22931 | 10 |
| 6.4 | Capital injection events | 22932 | 22939 | 8 |
| 6.5 | The price slider (difficulty as a dial the player sets) | 22942 | 22960 | 19 |
| 6.5 | The Margin Death Zone | 22961 | 22973 | 13 |
| 6.5 | The Pricing Floor Calculator | 22974 | 22982 | 9 |
| 6.5 | The Unit Economics Card | 22983 | 22991 | 9 |
| 6.5 | The oversell ratio | 22992 | 23041 | 50 |
| 6.5 | Grandfathering | 23042 | 23063 | 22 |
| 6.5 | The Price Increase (the four-parameter decision) | 23064 | 23076 | 13 |
| 6.5 | Intro pricing and the renewal cliff | 23077 | 23087 | 11 |
| 6.5 | Term discounting and commit discounts | 23088 | 23095 | 8 |
| 6.5 | Volume and committed-use discounts | 23096 | 23102 | 7 |
| 6.5 | Tier design and the good-better-best ladder | 23103 | 23112 | 10 |
| 6.5 | Cost-plus vs value pricing | 23113 | 23119 | 7 |
| 6.5 | Usage-based vs flat | 23120 | 23126 | 7 |
| 6.5 | Metered vs unmetered vs "unlimited" | 23127 | 23134 | 8 |
| 6.5 | Overage policy | 23135 | 23141 | 7 |
| 6.5 | SLA tier pricing and the true shape of a credit | 23142 | 23154 | 13 |
| 6.5 | The Cost of a Nine (an explicit, visible cost curve) | 23155 | 23166 | 12 |
| 6.5 | Segmented pricing | 23167 | 23174 | 8 |
| 6.5 | Yield management | 23175 | 23181 | 7 |
| 6.5 | Regional pricing / PPP | 23182 | 23187 | 6 |
| 6.5 | Bundling | 23188 | 23194 | 7 |
| 6.5 | Free tier and free trial | 23195 | 23203 | 9 |
| 6.5 | Loss leaders and attach rate | 23204 | 23210 | 7 |
| 6.5 | The Promo Engine | 23211 | 23217 | 7 |
| 6.5 | The discounting spiral and discount authority | 23218 | 23224 | 7 |
| 6.5 | Elasticity testing | 23225 | 23232 | 8 |
| 6.5 | The race to the bottom | 23233 | 23243 | 11 |
| 6.5 | Custom enterprise pricing (the quote) | 23244 | 23250 | 7 |
| 6.5 | The Margin Tint (pricing made ambient) | 23251 | 23260 | 10 |
| 6.6 | The fundamental hosting economic truth | 23266 | 23281 | 16 |
| 6.6 | The revenue-shape table | 23282 | 23323 | 42 |
| 6.6 | Companion table A — term, churn, and cash conversion | 23324 | 23345 | 22 |
| 6.6 | Companion table B — acquisition and support load | 23346 | 23361 | 16 |
| 6.6 | Companion table C — what a bad month looks like | 23362 | 23388 | 27 |
| 6.6 | Data gravity | 23389 | 23399 | 11 |
| 6.6 | Lease terms and the colo cash profile | 23400 | 23408 | 9 |
| 6.6 | Occupancy, stranded capacity, and absorption rate | 23409 | 23431 | 23 |
| 6.6 | Power as a product | 23432 | 23440 | 9 |
| 6.6 | Cross-connects: the best line item in hosting | 23441 | 23459 | 19 |
| 6.6 | Peering ratio as a cost driver (and a diversification payoff) | 23460 | 23470 | 11 |
| 6.6 | Deliverability as revenue (email) | 23471 | 23478 | 8 |
| 6.6 | Per-query and per-invocation pricing (DNS, serverless, IoT) | 23479 | 23486 | 8 |
| 6.6 | Restore-SLA pricing (backup/DR) | 23487 | 23495 | 9 |
| 6.6 | Deadline premiums (HPC / render) | 23496 | 23502 | 7 |
| 6.6 | GPU price volatility — and the financing mismatch underneath it | 23503 | 23519 | 17 |
| 6.6 | The abuse cost line | 23520 | 23526 | 7 |
| 6.6 | The obsolescence clock and the cascade down-tier | 23527 | 23537 | 11 |
| 6.6 | Demand response and time-of-use | 23538 | 23548 | 11 |
| 6.6 | Contract length as per-type personality | 23549 | 23561 | 13 |
| 6.6 | Internal transfer pricing (once you run more than one line) | 23562 | 23566 | 5 |
| 6.7 | The governing rule for this subsection | 23571 | 23580 | 10 |
| 6.7 | The whale signs | 23581 | 23595 | 15 |
| 6.7 | The whale leaves | 23596 | 23603 | 8 |
| 6.7 | SLA credit event | 23604 | 23613 | 10 |
| 6.7 | The chargeback wave | 23614 | 23621 | 8 |
| 6.7 | Bill shock | 23622 | 23629 | 8 |
| 6.7 | The vendor renewal price increase | 23630 | 23637 | 8 |
| 6.7 | The true-up | 23638 | 23641 | 4 |
| 6.7 | The invoice that doesn't get paid | 23642 | 23649 | 8 |
| 6.7 | The audit finding | 23650 | 23657 | 8 |
| 6.7 | The lawsuit / the legal letter | 23658 | 23664 | 7 |
| 6.7 | The acquisition offer | 23665 | 23672 | 8 |
| 6.7 | The acquisition opportunity | 23673 | 23679 | 7 |
| 6.7 | The customer-book purchase | 23680 | 23685 | 6 |
| 6.7 | The grant / the tax credit / the utility rebate | 23686 | 23692 | 7 |
| 6.7 | The viral moment | 23693 | 23700 | 8 |
| 6.7 | Marketing spend | 23701 | 23713 | 13 |
| 6.7 | The insurance payout | 23714 | 23719 | 6 |
| 6.7 | The refund wave | 23720 | 23725 | 6 |
| 6.7 | The processor's rolling reserve is imposed | 23726 | 23732 | 7 |
| 6.7 | The distributor credit hold | 23733 | 23739 | 7 |
| 6.7 | Covenant breach | 23740 | 23746 | 7 |
| 6.7 | The double-carry begins (a pivot event) | 23747 | 23751 | 5 |
| 6.8 | The three-tier restructure (the fix that makes the metric wealth playable) | 23757 | 23784 | 28 |
| 6.8 | The growth block | 23785 | 23793 | 9 |
| 6.8 | The margin block | 23794 | 23799 | 6 |
| 6.8 | The acquisition block | 23800 | 23804 | 5 |
| 6.8 | The cash block | 23805 | 23810 | 6 |
| 6.8 | The risk block | 23811 | 23816 | 6 |
| 6.8 | The obligation block | 23817 | 23823 | 7 |
| 6.8 | The operations block | 23824 | 23831 | 8 |
| 6.8 | The revenue-quality block (new) | 23832 | 23837 | 6 |
| 6.8 | The satisfaction block | 23838 | 23841 | 4 |
| 6.8 | The rule of the HUD | 23842 | 23847 | 6 |
| 6.8 | The Death-Spiral Diagram (a HUD element that draws the loop) | 23848 | 23857 | 10 |
| 6.8 | The Concentration Donut (and its agreement with the floor) | 23858 | 23865 | 8 |
| 6.8 | The Cohort Wall | 23866 | 23873 | 8 |
| 6.8 | The Obligation Rail | 23874 | 23883 | 10 |
| 6.9 | The four-axis scorecard — and the reweighting that makes it teach the pillar | 23886 | 23921 | 36 |
| 6.9 | Score the conversion rate first | 23922 | 23929 | 8 |
| 6.9 | The Nines | 23930 | 23940 | 11 |
| 6.9 | Perceived vs actual reliability | 23941 | 23948 | 8 |
| 6.9 | Detection quality | 23949 | 23955 | 7 |
| 6.9 | The Uptime Ribbon | 23956 | 23964 | 9 |
| 6.9 | The Incident Timeline Strip | 23965 | 23970 | 6 |
| 6.9 | The Traffic Sankey | 23971 | 23980 | 10 |
| 6.9 | The Attacker Ledger | 23981 | 23994 | 14 |
| 6.9 | Money Left On The Table (three columns, not one number) | 23995 | 24011 | 17 |
| 6.9 | The Leak Report | 24012 | 24019 | 8 |
| 6.9 | Blast Radius Rating | 24020 | 24026 | 7 |
| 6.9 | The "Would You Have Survived" Simulator | 24027 | 24035 | 9 |
| 6.9 | Preparedness score | 24036 | 24043 | 8 |
| 6.9 | Rebuildability index | 24044 | 24049 | 6 |
| 6.9 | Near-miss ledger | 24050 | 24057 | 8 |
| 6.9 | Toil hours | 24058 | 24061 | 4 |
| 6.9 | Par time to detect / par time to repair | 24062 | 24068 | 7 |
| 6.9 | Cost per served unit | 24069 | 24074 | 6 |
| 6.9 | Revenue per kW, per rack unit, and per engineer | 24075 | 24084 | 10 |
| 6.9 | The Externality Score | 24085 | 24092 | 8 |
| 6.9 | The Decision Audit | 24093 | 24100 | 8 |
| 6.9 | The Attribution Ledger | 24101 | 24115 | 15 |
| 6.9 | The letter grade and the derived flavour title | 24116 | 24131 | 16 |
| 6.9 | The Report Card | 24132 | 24137 | 6 |
| 6.9 | Four analog dials — and the sequencing that resolves the three-presentation conflict | 24138 | 24146 | 9 |
| 6.9 | The Instrument Cluster (one bezel, many faces) | 24147 | 24158 | 12 |
| 6.9 | Per-line scorecard reweighting | 24159 | 24168 | 10 |
| 6.9 | The Board Review (the alternative framing) | 24169 | 24183 | 15 |
| 6.9 | The postmortem screen | 24184 | 24192 | 9 |
| 6.9 | The Efficiency Frontier | 24193 | 24200 | 8 |
| 6.9 | Par and efficiency medals | 24201 | 24206 | 6 |
| 6.9 | The medal / star roster | 24207 | 24220 | 14 |
| 6.9 | Scored Retreats | 24221 | 24228 | 8 |
| 6.9 | The Streak Ladder | 24229 | 24237 | 9 |
| 6.9 | The Customer's Scorecard | 24238 | 24245 | 8 |
| 6.9 | Star ratings as real reviews | 24246 | 24256 | 11 |
| 6.9 | The Wall of Ghosts | 24257 | 24264 | 8 |
| 6.9 | The Blueprint Card | 24265 | 24270 | 6 |
| 6.9 | The Grade Curve Portrait | 24271 | 24277 | 7 |
| 6.9 | The Sankey Payoff | 24278 | 24281 | 4 |
| 6.9 | The Trophy Shelf | 24282 | 24287 | 6 |
| 6.9 | The comparative ghost run / Par Ghost | 24288 | 24294 | 7 |
| 6.9 | Company Valuation (the campaign meta-score) | 24295 | 24302 | 8 |
| 6.9 | Per-line valuation bases (because real buyers don't use one multiple) | 24303 | 24319 | 17 |
| 6.9 | The valuation modifiers that actually move a hosting price | 24320 | 24332 | 13 |
| 6.9 | Adjusted EBITDA and the addback game | 24333 | 24342 | 10 |
| 6.9 | Escrow, holdback, and the working-capital adjustment | 24343 | 24351 | 9 |
| 6.9 | The diligence report / The Diligence Memo | 24352 | 24363 | 12 |
| 6.9 | Concentration Risk Penalty | 24364 | 24371 | 8 |
| 6.9 | Scoring additions worth calling out separately | 24372 | 24385 | 14 |
| 6.10 | The soft-over-hard rule (the governing principle) | 24388 | 24396 | 9 |
| 6.10 | The Goal Card — declare your win condition at the start | 24397 | 24411 | 15 |
| 6.10 | Win conditions, with stated thresholds | 24412 | 24432 | 21 |
| 6.10 | Bankruptcy / cash zero (Insolvency) | 24433 | 24439 | 7 |
| 6.10 | Growth Death | 24440 | 24446 | 7 |
| 6.10 | Concentration Collapse | 24447 | 24453 | 7 |
| 6.10 | Churn Spiral / Mass churn cascade | 24454 | 24462 | 9 |
| 6.10 | Reputation Collapse / the empty lane | 24463 | 24471 | 9 |
| 6.10 | Total / partial data loss | 24472 | 24487 | 16 |
| 6.10 | Upstream termination | 24488 | 24494 | 7 |
| 6.10 | Payment processor termination | 24495 | 24501 | 7 |
| 6.10 | Debanked (new) | 24502 | 24508 | 7 |
| 6.10 | Regulatory shutdown | 24509 | 24515 | 7 |
| 6.10 | Deplatforming | 24516 | 24518 | 3 |
| 6.10 | Uninsurable (new) | 24519 | 24525 | 7 |
| 6.10 | Covenant Default | 24526 | 24532 | 7 |
| 6.10 | Team collapse / total staff burnout | 24533 | 24539 | 7 |
| 6.10 | Facility loss | 24540 | 24546 | 7 |
| 6.10 | Obsolescence | 24547 | 24552 | 6 |
| 6.10 | The Zombie Host (a soft fail you inhabit) | 24553 | 24564 | 12 |
| 6.10 | Acquisition at a bad multiple (a soft loss/win) | 24565 | 24573 | 9 |
| 6.11 | The instrument table (cost, speed, and failure mode) | 24576 | 24596 | 21 |
| 6.11 | Bootstrap | 24597 | 24600 | 4 |
| 6.11 | Customer-financed growth (the elegant one) | 24601 | 24607 | 7 |
| 6.11 | Revolving credit line | 24608 | 24614 | 7 |
| 6.11 | Equipment financing / leasing — **the defining instrument of hosting** | 24615 | 24628 | 14 |
| 6.11 | Vendor / OEM financing | 24629 | 24634 | 6 |
| 6.11 | Term loan | 24635 | 24637 | 3 |
| 6.11 | Invoice factoring / AR financing | 24638 | 24645 | 8 |
| 6.11 | Merchant cash advance (the labelled trap) | 24646 | 24652 | 7 |
| 6.11 | Venture capital | 24653 | 24659 | 7 |
| 6.11 | Private equity / roll-up | 24660 | 24666 | 7 |
| 6.11 | Seller financing and earnouts | 24667 | 24673 | 7 |
| 6.11 | The shrinking instruments (the dignified retreat) | 24674 | 24692 | 19 |
| 6.11 | Loans priced by your uptime streak — and the operational credit rating beneath it | 24693 | 24709 | 17 |
| 6.11 | Grants, incentives, and rebates | 24710 | 24712 | 3 |
| 6.11 | Covenant breach | 24713 | 24717 | 5 |
| 6.12 | The contract is a tower | 24726 | 24757 | 32 |
| 6.12 | The contract as the difficulty selector | 24758 | 24767 | 10 |
| 6.12 | The term-length matrix | 24768 | 24785 | 18 |
| 6.12 | The renewal cliff as a scheduled event | 24786 | 24796 | 11 |
| 6.12 | Ramp schedules and the revenue start date | 24797 | 24805 | 9 |
| 6.12 | Take-or-pay and commit burn-down (both directions) | 24806 | 24817 | 12 |
| 6.12 | Reserved vs. spot (the GPU/compute term structure) | 24818 | 24830 | 13 |
| 6.12 | MRC + NRC + settlement (the three-component bill) | 24831 | 24840 | 10 |
| 6.12 | Circuit and cross-connect contract liabilities (NRC, MRC, term, ETL) | 24841 | 24845 | 5 |
| 6.12 | The ETF Buyout (contract buyout as an offensive weapon) | 24846 | 24858 | 13 |
| 6.12 | Escalators, pass-throughs, and the fixed-price trap | 24859 | 24867 | 9 |
| 6.12 | Auto-renew, notice periods, and the evergreen clause | 24868 | 24875 | 8 |
| 6.12 | Contract assignability (consent to assignment) | 24876 | 24884 | 9 |
| 6.12 | WARCT and contracted revenue % (the two numbers that make revenue an asset) | 24885 | 24892 | 8 |
| 6.12 | The Contract Term Ribbon (visual) | 24893 | 24901 | 9 |
| 6.13 | The six cash buckets | 24908 | 24926 | 19 |
| 6.13 | The Balance Sheet (assets, liabilities, equity) | 24927 | 24941 | 15 |
| 6.13 | The Rolling Reserve | 24942 | 24952 | 11 |
| 6.13 | Escrow holdbacks and the working-capital adjustment | 24953 | 24956 | 4 |
| 6.13 | Security deposits and letters of credit (both directions) | 24957 | 24966 | 10 |
| 6.13 | Deferred revenue, spent | 24967 | 24973 | 7 |
| 6.13 | AR aging and DSO | 24974 | 24985 | 12 |
| 6.13 | Bad debt and the write-off (with provisioning) | 24986 | 24996 | 11 |
| 6.13 | Revenue leakage and Revenue Assurance | 24997 | 25005 | 9 |
| 6.13 | Backlog (signed, not installed, not billing) | 25006 | 25012 | 7 |
| 6.13 | Committed out (take-or-pay, leases, open POs) | 25013 | 25015 | 3 |
| 6.13 | AP as a lever (and a trap) | 25016 | 25026 | 11 |
| 6.13 | Capitalized fit-out | 25027 | 25034 | 8 |
| 6.13 | The decommissioning obligation | 25035 | 25042 | 8 |
| 6.13 | The cash conversion cycle (as a balance-sheet readout) | 25043 | 25046 | 4 |
| 6.13 | The cash-flow waterfall | 25047 | 25052 | 6 |
| 6.14 | The pivot double-carry | 25058 | 25076 | 19 |
| 6.14 | The Line J-Curve | 25077 | 25087 | 11 |
| 6.14 | The dual-run cost | 25088 | 25098 | 11 |
| 6.14 | Internal transfer pricing | 25099 | 25109 | 11 |
| 6.14 | Revenue per rack unit, per kW, and per engineer | 25110 | 25114 | 5 |
| 6.14 | The Secondary Market | 25115 | 25127 | 13 |
| 6.14 | Portfolio synergies that pay actual bills | 25128 | 25139 | 12 |
| 6.14 | Carbon and water accounting | 25140 | 25150 | 11 |
| 6.14 | Insurance vs redundancy as an explicit decision curve | 25151 | 25162 | 12 |
| 6.14 | The meta-economy across the campaign | 25163 | 25183 | 21 |
| 6.15 | Gold Is Reserved | 25190 | 25195 | 6 |
| 6.15 | Money Always Moves | 25196 | 25202 | 7 |
| 6.15 | Money at Three Scales (the LOD system) | 25203 | 25212 | 10 |
| 6.15 | Per-Type Currency Glyphs | 25213 | 25221 | 9 |
| 6.15 | The Per-Visitor Coin (value as physical size) | 25222 | 25228 | 7 |
| 6.15 | The Revenue Gutter | 25229 | 25235 | 7 |
| 6.15 | The MRR Spine | 25236 | 25243 | 8 |
| 6.15 | The Recurring Pulse | 25244 | 25247 | 4 |
| 6.15 | The Ledger Tape | 25248 | 25254 | 7 |
| 6.15 | The Ledger Drawer, specified | 25255 | 25265 | 11 |
| 6.15 | The Gap Bar | 25266 | 25269 | 4 |
| 6.15 | The Burn Candle | 25270 | 25276 | 7 |
| 6.15 | The Drain Choir | 25277 | 25286 | 10 |
| 6.15 | Capex vs Opex Split Bar | 25287 | 25291 | 5 |
| 6.15 | The Two-Pan Scale | 25292 | 25301 | 10 |
| 6.15 | The Invoice Bird and the Dunning Ladder | 25302 | 25304 | 3 |
| 6.15 | The Invoice Calendar Strip | 25305 | 25308 | 4 |
| 6.15 | The AR Aging Shelf | 25309 | 25311 | 3 |
| 6.15 | The Overage Meter | 25312 | 25315 | 4 |
| 6.15 | Setup Fee Confetti | 25316 | 25319 | 4 |
| 6.15 | The Upsell Handshake | 25320 | 25323 | 4 |
| 6.15 | The Marketplace Shelf | 25324 | 25327 | 4 |
| 6.15 | The Cross-Connect Faucet | 25328 | 25331 | 4 |
| 6.15 | The Power Resale Meter | 25332 | 25334 | 3 |
| 6.15 | The Upkeep Drip | 25335 | 25338 | 4 |
| 6.15 | The Power Bill Dial | 25339 | 25344 | 6 |
| 6.15 | PUE as a Leak | 25345 | 25349 | 5 |
| 6.15 | The 95th-Percentile Graph, specified | 25350 | 25355 | 6 |
| 6.15 | Payroll Pulse | 25356 | 25359 | 4 |
| 6.15 | The Lease Stamp | 25360 | 25363 | 4 |
| 6.15 | The Depreciation Fade | 25364 | 25368 | 5 |
| 6.15 | Shipping & Lead Time | 25369 | 25372 | 4 |
| 6.15 | The Remote Hands Clock | 25373 | 25376 | 4 |
| 6.15 | The Incident Cost Meter | 25377 | 25382 | 6 |
| 6.15 | The Technical Debt Ledger | 25383 | 25387 | 5 |
| 6.15 | The Price Dial + Demand Ghost | 25388 | 25391 | 4 |
| 6.15 | The Competitor Price Tag | 25392 | 25395 | 4 |
| 6.15 | The Margin Tint | 25396 | 25399 | 4 |
| 6.15 | The Oversubscription Slider | 25400 | 25403 | 4 |
| 6.15 | The SLA Tier Stripe | 25404 | 25408 | 5 |
| 6.15 | The Contract Term Ribbon | 25409 | 25412 | 4 |
| 6.15 | The Three-Clock Cluster | 25413 | 25423 | 11 |
| 6.15 | The Runway Tone Shift | 25424 | 25426 | 3 |
| 6.15 | The Instrument Cluster (one bezel, many faces) | 25427 | 25430 | 4 |
| 6.15 | The Report Card, the Grade Stamp, and the Diligence Memo | 25431 | 25434 | 4 |
| 6.15 | The Sankey Payoff and Money Left On The Table as negative space | 25435 | 25438 | 4 |
| 6.15 | The Trophy Shelf and the Grade Curve Portrait | 25439 | 25441 | 3 |
| 6.15 | The Dust Sheet Ending | 25442 | 25445 | 4 |
| 6.15 | Bankruptcy Cascade | 25446 | 25450 | 5 |
| 6.15 | The Acquisition Ending (good) | 25451 | 25454 | 4 |
| 6.15 | Par Ghost | 25455 | 25460 | 6 |
| 6.16 | Sheet A — the starting-position baseline | 25477 | 25527 | 51 |
| 6.16 | Sheet B — the opening tuning spine (with time, pressure, and patience) | 25528 | 25580 | 53 |
| 6.16 | Sheet C — the real-market number sheet | 25581 | 25625 | 45 |
| 6.16 | Derived tuning constants worth stating once | 25626 | 25650 | 25 |
| 7.1 | The dependency graph IS the map | 25655 | 25672 | 18 |
| 7.1 | Two-directional flow (the core tension) | 25673 | 25687 | 15 |
| 7.1 | The Funnel (depth is a resource) | 25688 | 25695 | 8 |
| 7.1 | The Return Path | 25696 | 25704 | 9 |
| 7.1 | The mixed lane | 25705 | 25714 | 10 |
| 7.1 | Service lanes (isolation as a purchasable property) | 25715 | 25724 | 10 |
| 7.1 | Capacity as concurrency slots, not HP | 25725 | 25748 | 24 |
| 7.1 | The queueing hockey-stick | 25749 | 25758 | 10 |
| 7.1 | Backpressure and the red tide | 25759 | 25770 | 12 |
| 7.1 | Blast radius as a first-class concept | 25771 | 25783 | 13 |
| 7.1 | The Blast Radius of a Person | 25784 | 25793 | 10 |
| 7.1 | Effective vs nominal redundancy | 25794 | 25816 | 23 |
| 7.1 | Bottleneck highlight | 25817 | 25829 | 13 |
| 7.1 | Topology matters: chokepoints vs meshes | 25830 | 25836 | 7 |
| 7.1 | Multiple valid paths, and the routing rule that chooses between them | 25837 | 25846 | 10 |
| 7.1 | Path preference and failover order | 25847 | 25853 | 7 |
| 7.1 | Traffic steering (routing is still a choice, even without mazing) | 25854 | 25863 | 10 |
| 7.1 | Saturation cascade (emergent, not scripted) | 25864 | 25873 | 10 |
| 7.1 | The entrance and the goal | 25874 | 25881 | 8 |
| 7.1 | DNS is the first hop | 25882 | 25890 | 9 |
| 7.1 | Out-of-band entry points (threats that don't use the front door) | 25891 | 25900 | 10 |
| 7.1 | Capacity as terrain | 25901 | 25909 | 9 |
| 7.2 | Drag-a-cable (the recommended primary interaction) | 25918 | 25941 | 24 |
| 7.2 | Click-to-link (the accessibility fallback, never second-class) | 25942 | 25948 | 7 |
| 7.2 | Wiring Mode | 25949 | 25959 | 11 |
| 7.2 | The Port Row (shape-coded sockets) | 25960 | 25966 | 7 |
| 7.2 | Ports as a finite resource — with type and speed | 25967 | 25980 | 14 |
| 7.2 | Link Objects Are First-Class (the connection is a game object, not a line) | 25981 | 25991 | 11 |
| 7.2 | Connection contracts (the link carries the policy) and the Policy Bead Set | 25992 | 26018 | 27 |
| 7.2 | Contracts are cables (one gesture for technical and commercial links) | 26019 | 26030 | 12 |
| 7.2 | Contract-driven pathing (contracts as level geometry) | 26031 | 26041 | 11 |
| 7.2 | Link health rendering (and the non-colour channels) | 26042 | 26052 | 11 |
| 7.2 | The Packet Bead Simulation | 26053 | 26060 | 8 |
| 7.2 | Logical links are dashed; physical links are solid | 26061 | 26068 | 8 |
| 7.2 | Physical vs logical vs documented: three views that can disagree | 26069 | 26094 | 26 |
| 7.2 | Two Boards, Two Scales (Rack View and Topology View) | 26095 | 26104 | 10 |
| 7.2 | Typed sockets: `needs` and `provides` | 26105 | 26113 | 9 |
| 7.2 | Four topologies, one board — and how much of each you actually wire | 26114 | 26131 | 18 |
| 7.2 | Adjacency bonuses, not adjacency requirements | 26132 | 26143 | 12 |
| 7.2 | Adjacency auto-link (tutorial-only, then taken away) | 26144 | 26152 | 9 |
| 7.2 | Cable types and length costs | 26153 | 26168 | 16 |
| 7.2 | Bundling and the trunk | 26169 | 26177 | 9 |
| 7.2 | Auto-route vs hand-route, and the Ugly Auto-Route | 26178 | 26190 | 13 |
| 7.2 | Declared intent (the endgame of wiring) | 26191 | 26201 | 11 |
| 7.2 | Firewall rules as gates on the cable | 26202 | 26208 | 7 |
| 7.2 | VLAN painting / segmentation | 26209 | 26219 | 11 |
| 7.2 | Dependency ghosting / the Dependency Reveal | 26220 | 26227 | 8 |
| 7.2 | Dependency auto-discovery (fog over your own topology) | 26228 | 26235 | 8 |
| 7.2 | Miswiring is allowed | 26236 | 26243 | 8 |
| 7.2 | The Patch Panel and the Patch Panel Widget | 26244 | 26253 | 10 |
| 7.2 | Bus Mode | 26254 | 26259 | 6 |
| 7.2 | Templates, snap groups, blueprints and the stamp | 26260 | 26268 | 9 |
| 7.2 | Auto-Cable (pay a tech to do it) | 26269 | 26275 | 7 |
| 7.2 | Disconnect is dangerous; drain is the verb | 26276 | 26291 | 16 |
| 7.2 | Cable management score | 26292 | 26303 | 12 |
| 7.2 | The Mystery Cable and the toner probe | 26304 | 26311 | 8 |
| 7.2 | Collapse to meta-node (readability at wiring scale) | 26312 | 26319 | 8 |
| 7.2 | Cross-connect wiring as revenue | 26320 | 26328 | 9 |
| 7.3 | Nested grids (floor → row → rack → U) | 26331 | 26339 | 9 |
| 7.3 | Rack U Tetris — made strategic by conflicting constraints | 26340 | 26354 | 15 |
| 7.3 | Power budget per circuit | 26355 | 26363 | 9 |
| 7.3 | The placement loop (ghost, refusal icon, and live preview as one interaction) | 26364 | 26379 | 16 |
| 7.3 | The Blast Radius Preview (hover-before-you-buy) | 26380 | 26388 | 9 |
| 7.3 | The Fit Check (why the thing didn't go in the rack) | 26389 | 26398 | 10 |
| 7.3 | Thermal map / hot aisle management | 26399 | 26408 | 10 |
| 7.3 | Airflow arrows and light airflow simulation | 26409 | 26416 | 8 |
| 7.3 | Adjacency effects | 26417 | 26424 | 8 |
| 7.3 | Zones and blast domains | 26425 | 26432 | 8 |
| 7.3 | Weight, floor loading and centre of gravity | 26433 | 26441 | 9 |
| 7.3 | The Floor Tile Grid, the Row Stamp and the Rack Template | 26442 | 26451 | 10 |
| 7.3 | Latency geometry (when the board is a map) | 26452 | 26459 | 8 |
| 7.3 | Placement is a commercial decision too | 26460 | 26467 | 8 |
| 7.3 | Move cost, downtime and legacy placement debt | 26468 | 26475 | 8 |
| 7.3 | Undo ghost | 26476 | 26484 | 9 |
| 7.4 | Upgrade paths, not upgrade levels | 26487 | 26493 | 7 |
| 7.4 | Upgrades as sidegrades: every capability has a cost somewhere else | 26494 | 26508 | 15 |
| 7.4 | Upgrades improve the ROC curve, not the damage number | 26509 | 26517 | 9 |
| 7.4 | Scale up vs scale out | 26518 | 26524 | 7 |
| 7.4 | Tuning instead of levels | 26525 | 26549 | 25 |
| 7.4 | Config snapshot and restore (as a gameplay verb) | 26550 | 26559 | 10 |
| 7.4 | Tuning cost | 26560 | 26566 | 7 |
| 7.4 | Soft caps and diminishing returns | 26567 | 26572 | 6 |
| 7.4 | Retrofit vs rebuild | 26573 | 26578 | 6 |
| 7.4 | In-place vs replace (the downtime question) | 26579 | 26588 | 10 |
| 7.4 | Firmware and patch cadence | 26589 | 26597 | 9 |
| 7.4 | Efficiency upgrades | 26598 | 26604 | 7 |
| 7.4 | Cross-building buffs | 26605 | 26611 | 7 |
| 7.4 | Physical module insertion (bolt-on upgrades are the upgrade UI) | 26612 | 26620 | 9 |
| 7.4 | The Plating Pass and tier rim-lights | 26621 | 26629 | 9 |
| 7.4 | Upgrade regret and the parts bin | 26630 | 26638 | 9 |
| 7.5 | Pause with orders | 26641 | 26655 | 15 |
| 7.5 | Speed controls, with a catch | 26656 | 26679 | 24 |
| 7.5 | Auto-pause on severity | 26680 | 26686 | 7 |
| 7.5 | Hands as action slots | 26687 | 26701 | 15 |
| 7.5 | Actions cost time, not mana — split into duration and attendance | 26702 | 26717 | 16 |
| 7.5 | The pager and triage | 26718 | 26725 | 8 |
| 7.5 | Severity classification as a player choice | 26726 | 26733 | 8 |
| 7.5 | Incident Mode | 26734 | 26746 | 13 |
| 7.5 | Communicate is an action | 26747 | 26754 | 8 |
| 7.5 | The Runbook Quick-Bar | 26755 | 26761 | 7 |
| 7.5 | Maintenance windows | 26762 | 26782 | 21 |
| 7.5 | The Settling Window and Change Interference | 26783 | 26797 | 15 |
| 7.5 | The Change Budget | 26798 | 26805 | 8 |
| 7.5 | The Change object (risk, window, rollback plan, freeze, commit-confirm) | 26806 | 26816 | 11 |
| 7.5 | The Change Request Flow | 26817 | 26825 | 9 |
| 7.5 | The Verification Step | 26826 | 26837 | 12 |
| 7.5 | The Pre-Mortem | 26838 | 26846 | 9 |
| 7.5 | Drills and rehearsals as a scored action type | 26847 | 26861 | 15 |
| 7.5 | Change freeze | 26862 | 26872 | 11 |
| 7.5 | Drain before reboot | 26873 | 26875 | 3 |
| 7.5 | The Big Red Button — with a scope selector | 26876 | 26891 | 16 |
| 7.5 | Degraded-mode toggles and the Degraded-Mode Console | 26892 | 26906 | 15 |
| 7.5 | Active abilities with cooldowns (the "spell" layer) | 26907 | 26915 | 9 |
| 7.5 | Ship-It-Friday | 26916 | 26921 | 6 |
| 7.5 | Undo window / rollback | 26922 | 26928 | 7 |
| 7.5 | Capacity ordering with lead times | 26929 | 26938 | 10 |
| 7.5 | The Inbox: decisions as cards | 26939 | 26963 | 25 |
| 7.5 | The Lag Table (formerly "the 90-day lag") | 26964 | 26984 | 21 |
| 7.5 | The month as the tick | 26985 | 26993 | 9 |
| 7.5 | Autopilot and delegation policies | 26994 | 27007 | 14 |
| 7.5 | Executive attention as a tiny pool, and the CEO Override | 27008 | 27032 | 25 |
| 7.5 | Chair switching with a cost | 27033 | 27041 | 9 |
| 7.5 | Night shift / the on-call clock / the 2am multiplier | 27042 | 27052 | 11 |
| 7.5 | Patch lag | 27053 | 27059 | 7 |
| 7.5 | Toil accumulation | 27060 | 27066 | 7 |
| 7.5 | Slow-mo incident cam | 27067 | 27078 | 12 |
| 7.6 | Ground Truth vs Observed Truth (the engine rule beneath this whole section) | 27081 | 27097 | 17 |
| 7.6 | Fog of infrastructure | 27098 | 27112 | 15 |
| 7.6 | Bounded Fog (the fairness contract) | 27113 | 27125 | 13 |
| 7.6 | Telemetry Resolution | 27126 | 27147 | 22 |
| 7.6 | Symptom vs cause | 27148 | 27155 | 8 |
| 7.6 | The two diagnostic modes: "What changed?" vs "What grew?" | 27156 | 27164 | 9 |
| 7.6 | Confidence as a diagnostic resource | 27165 | 27174 | 10 |
| 7.6 | Red herrings | 27175 | 27190 | 16 |
| 7.6 | Alert fatigue as a mechanic | 27191 | 27201 | 11 |
| 7.6 | MTTD and MTTR as separate stats | 27202 | 27207 | 6 |
| 7.6 | The "everything is green" trap — and its two siblings | 27208 | 27223 | 16 |
| 7.6 | The dashboard as a weapon | 27224 | 27232 | 9 |
| 7.6 | The overlay wheel, specified | 27233 | 27247 | 15 |
| 7.6 | The overlay palette table | 27248 | 27256 | 9 |
| 7.6 | Security-surface overlay as literal brightness | 27257 | 27267 | 11 |
| 7.6 | Capacity headroom overlay | 27268 | 27273 | 6 |
| 7.6 | Maintenance debt overlay, split into three wear channels | 27274 | 27282 | 9 |
| 7.6 | The log panel | 27283 | 27294 | 12 |
| 7.6 | The in-game terminal | 27295 | 27322 | 28 |
| 7.6 | The "Is It Actually Down?" check | 27323 | 27329 | 7 |
| 7.6 | The Change Log (documentation as a mechanic) | 27330 | 27338 | 9 |
| 7.6 | The Decision Highlight (making the board's *choices* legible) | 27339 | 27349 | 11 |
| 7.6 | The Board Diff (what changed since you last looked) | 27350 | 27359 | 10 |
| 7.6 | The Watchlist (pin what you're worried about) | 27360 | 27369 | 10 |
| 7.6 | The Attention Heatmap (a post-level self-portrait) | 27370 | 27379 | 10 |
| 7.7 | Degradation, not destruction (the anti-tower-defense principle) | 27382 | 27390 | 9 |
| 7.7 | Graceful degradation, pre-configured — and the Degradation Ladder editor | 27391 | 27409 | 19 |
| 7.7 | Load shedding (and why it requires peacetime work) | 27410 | 27416 | 7 |
| 7.7 | Granularity of sacrifice (the triage ladder) | 27417 | 27428 | 12 |
| 7.7 | Circuit breakers | 27429 | 27439 | 11 |
| 7.7 | Cascades with a visible fuse | 27440 | 27452 | 13 |
| 7.7 | Brownouts over blackouts | 27453 | 27460 | 8 |
| 7.7 | Partial failure states (enumerated and rendered) | 27461 | 27478 | 18 |
| 7.7 | Gray failure (the component that is 40% working) | 27479 | 27486 | 8 |
| 7.7 | Failure states worth explicitly modelling | 27487 | 27497 | 11 |
| 7.7 | The Second Failure Window | 27498 | 27507 | 10 |
| 7.7 | The Failover Handoff | 27508 | 27514 | 7 |
| 7.7 | Recovery is gameplay (and recovery order matters) | 27515 | 27533 | 19 |
| 7.7 | The cold-start dependency cycle | 27534 | 27545 | 12 |
| 7.7 | Restore service or restore redundancy? (the recovery decision nobody states) | 27546 | 27553 | 8 |
| 7.7 | The cold-cache thundering herd | 27554 | 27561 | 8 |
| 7.7 | Degradation Debt | 27562 | 27570 | 9 |
| 7.7 | The Blast Door | 27571 | 27580 | 10 |
| 7.7 | Data loss is permanent | 27581 | 27588 | 8 |
| 7.7 | The Corruption Horizon | 27589 | 27596 | 8 |
| 7.7 | Partial restore and prioritised recovery | 27597 | 27604 | 8 |
| 7.7 | The Failback Problem | 27605 | 27613 | 9 |
| 7.7 | The Reboot Roulette (state you didn't know you had) | 27614 | 27627 | 14 |
| 7.7 | The rollback, one-way doors, and the third category | 27628 | 27651 | 24 |
| 7.7 | Salvage and the rebuild | 27652 | 27658 | 7 |
| 7.7 | The Post-Mortem (screen, sheet, and progression hook) | 27659 | 27671 | 13 |
| 7.7 | Root cause vs band-aid | 27672 | 27678 | 7 |
| 7.7 | The technical debt meters (four, not one) | 27679 | 27705 | 27 |
| 7.7 | The Blame vs Blameless choice | 27706 | 27708 | 3 |
| 7.7 | The death spiral and its three exits | 27709 | 27720 | 12 |
| 7.7 | The grace timer / the landlord at the door | 27721 | 27727 | 7 |
| 7.7 | The repair loop: the Walk and the minigames | 27728 | 27738 | 11 |
| 7.8 | The Three-to-Five Change Rule (the variety budget, stated) | 27744 | 27753 | 10 |
| 7.8 | The scarce-resource meter swaps | 27754 | 27763 | 10 |
| 7.8 | The commercial slider swaps (the fourth axis) | 27764 | 27772 | 9 |
| 7.8 | Per-type sliders (the operational signature dial) | 27773 | 27779 | 7 |
| 7.8 | Time granularity changes | 27780 | 27787 | 8 |
| 7.8 | What "pathing" means changes | 27788 | 27796 | 9 |
| 7.8 | Control granularity as a difficulty axis — across four independent scales | 27797 | 27812 | 16 |
| 7.8 | Keyhole mode | 27813 | 27820 | 8 |
| 7.8 | The Window mechanic (backup, maintenance, satellite) | 27821 | 27826 | 6 |
| 7.8 | The Queue mechanic (HPC, render, transcode, GPU) | 27827 | 27833 | 7 |
| 7.8 | The Geography mechanic (CDN, game, edge, DNS anycast) | 27834 | 27839 | 6 |
| 7.8 | The Floor Plan mechanic (colo, wholesale) | 27840 | 27846 | 7 |
| 7.8 | The Durability mechanic (backup, archive, object storage) | 27847 | 27853 | 7 |
| 7.8 | The Reputation mechanic (email, bulletproof) | 27854 | 27859 | 6 |
| 7.8 | Concurrency slots (VoIP, game servers) | 27860 | 27866 | 7 |
| 7.8 | Unmanaged tenant objects | 27867 | 27873 | 7 |
| 7.8 | Remote-site delay | 27874 | 27880 | 7 |
| 7.8 | Era-locked tech | 27881 | 27886 | 6 |
| 7.8 | Multi-line tabs and the portfolio altitude | 27887 | 27894 | 8 |
| 7.8 | Time-axis connections (backup, archive) | 27895 | 27901 | 7 |
| 7.8 | Contract drag (colo, wholesale, enterprise) | 27902 | 27907 | 6 |
| 7.8 | The ticket-driven verb (colo cross-connects, remote hands, managed) | 27908 | 27914 | 7 |
| 7.8 | Per-type QoS answers | 27915 | 27923 | 9 |
| 7.9 | Calm / storm rhythm | 27926 | 27939 | 14 |
| 7.9 | The weather forecast / threat radar | 27940 | 27949 | 10 |
| 7.9 | The seasonality calendar | 27950 | 27958 | 9 |
| 7.9 | Opportunity events | 27959 | 27974 | 16 |
| 7.9 | Reputation as a slow resource | 27975 | 27981 | 7 |
| 7.9 | The three-clock rule | 27982 | 27997 | 16 |
| 7.9 | The Difficulty Director with an honest face | 27998 | 28008 | 11 |
| 7.9 | The month-end sequence as the business heartbeat | 28009 | 28016 | 8 |
| 7.10 | The Millisecond Budget (your real health bar) | 28027 | 28048 | 22 |
| 7.10 | Inspection Depth (the per-node ladder) | 28049 | 28066 | 18 |
| 7.10 | Suspicion Routing — the Two Lanes | 28067 | 28106 | 40 |
| 7.10 | The Suspicion Dial (every defense is a classifier with a false-positive rate) | 28107 | 28119 | 13 |
| 7.10 | Classification confidence, not a boolean | 28120 | 28133 | 14 |
| 7.10 | Threat units: Volume, Sophistication, Signature, Persistence | 28134 | 28143 | 10 |
| 7.10 | Aggro shaping (the player's control over threat pathing) | 28144 | 28161 | 18 |
| 7.10 | The Attack Surface Ledger (capability and risk are the same purchase) | 28162 | 28178 | 17 |
| 7.11 | QoS Classes and the Priority Ladder | 28186 | 28216 | 31 |
| 7.11 | Every hosting type has a different correct answer | 28217 | 28228 | 12 |
| 7.11 | Selling the ladder (priority as a product) | 28229 | 28238 | 10 |
| 7.11 | Fairness vs value (the visible, uncomfortable dial) | 28239 | 28250 | 12 |
| 7.12 | The eleven resources | 28256 | 28281 | 26 |
| 7.12 | Uptime Nines — the error budget as a spendable in-combat resource | 28282 | 28302 | 21 |
| 7.12 | Capacity as the exchange rate between the two boards (the Bridge) | 28303 | 28310 | 8 |
| 7.12 | Staff-hours as the universal drain | 28311 | 28321 | 11 |
| 7.13 | The tick, step by step | 28328 | 28365 | 38 |
| 7.13 | Ground truth vs observed truth | 28366 | 28370 | 5 |
| 7.13 | The Time Model (one coherent clock scheme) | 28371 | 28384 | 14 |
| 7.13 | The Dual Clock rule (and the thing it prevents) | 28385 | 28396 | 12 |
| 7.13 | The Wave Envelope (reconciling waves with continuous flow) | 28397 | 28413 | 17 |
| 7.13 | The Determinism and Fairness Contract | 28414 | 28427 | 14 |
| 7.13 | The correlated-event rule | 28428 | 28440 | 13 |
| 7.14 | The Policy Book (standing rules as a first-class object) | 28447 | 28470 | 24 |
| 7.14 | Ghost Hands (rendering automation) | 28471 | 28481 | 11 |
| 7.14 | The Dry-Run Toggle | 28482 | 28488 | 7 |
| 7.14 | Pre-authorized changes (planning as a buildable) | 28489 | 28496 | 8 |
| 7.14 | The Kill Switch / Stop The Robots | 28497 | 28510 | 14 |
| 7.14 | Delegation Bands | 28511 | 28521 | 11 |
| 7.14 | Delegation and subsystem ownership | 28522 | 28529 | 8 |
| 7.14 | The Handoff (what the player must say to the machine) | 28530 | 28540 | 11 |
| 7.14 | Runbook Cards | 28541 | 28549 | 9 |
| 7.14 | Alert routing | 28550 | 28556 | 7 |
| 7.14 | Batch and Fleet operations — as an earned capability, not a UI feature | 28557 | 28573 | 17 |
| 7.14 | Policy authoring as the late-game verb | 28574 | 28585 | 12 |
| 7.15 | The Pipeline Board | 28595 | 28609 | 15 |
| 7.15 | The Contract Card | 28610 | 28618 | 9 |
| 7.15 | The Deal Sheet (negotiation as clause-level trading) | 28619 | 28628 | 10 |
| 7.15 | The Renewal Window | 28629 | 28635 | 7 |
| 7.15 | The Invoice Run | 28636 | 28642 | 7 |
| 7.15 | The Churn Queue | 28643 | 28649 | 7 |
| 7.15 | The Abuse Queue | 28650 | 28655 | 6 |
| 7.15 | The Ticket Queue | 28656 | 28663 | 8 |
| 7.15 | The Phone | 28664 | 28670 | 7 |
| 7.15 | The Capacity Planner | 28671 | 28678 | 8 |
| 7.15 | The Oversell Dial | 28679 | 28686 | 8 |
| 7.15 | The Pricing Console and the Rate Card as a live object | 28687 | 28695 | 9 |
| 7.15 | Discount authority as a delegation slider | 28696 | 28702 | 7 |
| 7.15 | The Two Books toggle | 28703 | 28711 | 9 |
| 7.15 | The Commit Ledger | 28712 | 28718 | 7 |
| 7.15 | The Quarter Close | 28719 | 28726 | 8 |
| 7.15 | The Forecast Commit | 28727 | 28734 | 8 |
| 7.15 | The Board Meeting and the Advisor | 28735 | 28742 | 8 |
| 7.15 | The Org Chart | 28743 | 28749 | 7 |
| 7.15 | The Budget Allocator | 28750 | 28756 | 7 |
| 7.15 | Delayed damage and the churn forecast | 28757 | 28764 | 8 |
| 7.15 | Insurance and hedges (things that do nothing until they do everything) | 28765 | 28773 | 9 |
| 7.15 | Business-shaped difficulty levers | 28774 | 28785 | 12 |
| 7.16 | Everything Is a Thing | 28791 | 28799 | 9 |
| 7.16 | The Two-Action Rule | 28800 | 28810 | 11 |
| 7.16 | The Selection Grammar | 28811 | 28821 | 11 |
| 7.16 | The Squint Test (a design rule for every screen) | 28822 | 28825 | 4 |
| 7.16 | The Icon Budget | 28826 | 28832 | 7 |
| 7.16 | Clustering with Intent | 28833 | 28839 | 7 |
| 7.16 | The Exception Spotlight | 28840 | 28846 | 7 |
| 7.16 | Motion as the Last Channel | 28847 | 28854 | 8 |
| 7.16 | Alert Taxonomy — exactly three tiers, three distinct looks | 28855 | 28860 | 6 |
| 7.16 | The Vignette Language | 28861 | 28867 | 7 |
| 7.16 | The Rack Ribbon | 28868 | 28874 | 7 |
| 7.16 | Quiet Mode | 28875 | 28881 | 7 |
| 7.16 | Colourblind shape-coding (every semantic colour also has a shape) | 28882 | 28887 | 6 |
| 7.16 | Text Scale Independence and the Label Budget | 28888 | 28896 | 9 |
| 8.1 | A. Clean Isometric Diorama (the recommended world layer) | 28930 | 28952 | 23 |
| 8.1 | B. Technical Blueprint / Schematic (cyanotype) | 28953 | 28964 | 12 |
| 8.1 | C. CRT / Terminal Retro (diegetic terminal) | 28965 | 28976 | 12 |
| 8.1 | D. Cozy Miniature / Tilt-Shift | 28977 | 28985 | 9 |
| 8.1 | E. Gritty Industrial Realism | 28986 | 28991 | 6 |
| 8.1 | F. Cutaway Dollhouse 2.5D | 28992 | 29001 | 10 |
| 8.1 | G. Paper Diorama / Craft | 29002 | 29008 | 7 |
| 8.1 | H. The Isometric Ledger | 29009 | 29019 | 11 |
| 8.1 | The recommended shipping combination | 29020 | 29038 | 19 |
| 8.1 | The Style Allocation Table | 29039 | 29056 | 18 |
| 8.1 | The Two-Palette Discipline | 29057 | 29067 | 11 |
| 8.1 | The Two-Tone Rule (the money reading of the same discipline) | 29068 | 29077 | 10 |
| 8.1 | Utilization Glow | 29078 | 29089 | 12 |
| 8.1 | Grain and Materiality | 29090 | 29097 | 8 |
| 8.1 | The Lighting Model | 29098 | 29106 | 9 |
| 8.1 | The Practical Lights List | 29107 | 29114 | 8 |
| 8.1 | Depth of Field, Sparingly | 29115 | 29119 | 5 |
| 8.1 | "State is colour, identity is silhouette" | 29120 | 29128 | 9 |
| 8.2 | The Layer Law (Three layers, plus Intent, plus Attachment) | 29135 | 29171 | 37 |
| 8.2 | The Emissive Allowance | 29172 | 29185 | 14 |
| 8.2 | The Diegetic Annotation Exception ("Objects of Record") | 29186 | 29202 | 17 |
| 8.2 | The Hue Ledger | 29203 | 29232 | 30 |
| 8.2 | Gold moves, amber fills, orange is a lens, red is final | 29233 | 29247 | 15 |
| 8.2 | Saturation, value, and temperature — the three state axes, reconciled | 29248 | 29258 | 11 |
| 8.2 | Money has colour and weight (revenue quality, rendered) | 29259 | 29269 | 11 |
| 8.2 | Self-inflicted failure: white-cored red | 29270 | 29285 | 16 |
| 8.2 | Purple means "we don't know yet" | 29286 | 29298 | 13 |
| 8.2 | The Confidence Blur | 29299 | 29313 | 15 |
| 8.2 | The Alert Triad Rule | 29314 | 29326 | 13 |
| 8.2 | The Ring Taxonomy | 29327 | 29347 | 21 |
| 8.2 | The Instrument Design Language | 29348 | 29382 | 35 |
| 8.2 | Stroke Weight as Certainty | 29383 | 29393 | 11 |
| 8.2 | Shape tokens | 29394 | 29416 | 23 |
| 8.2 | The Two-Channel Law (formerly the Diamond/Circle/Triangle law) | 29417 | 29435 | 19 |
| 8.2 | Decision-cost colour: spending vs committing | 29436 | 29446 | 11 |
| 8.2 | Player-authored vs system-default rendering | 29447 | 29459 | 13 |
| 8.2 | Motion language | 29460 | 29472 | 13 |
| 8.2 | The Readability Budget | 29473 | 29489 | 17 |
| 8.2 | The Motion Budget per Altitude | 29490 | 29499 | 10 |
| 8.2 | The Chroma Meter | 29500 | 29508 | 9 |
| 8.2 | Per-line tint vs alert colour arbitration | 29509 | 29518 | 10 |
| 8.2 | The Foreignness Budget | 29519 | 29533 | 15 |
| 8.2 | Status Chips | 29534 | 29542 | 9 |
| 8.2 | The Handmade Layer | 29543 | 29554 | 12 |
| 8.2 | Zero-State Art | 29555 | 29570 | 16 |
| 8.3 | The Four Altitudes | 29573 | 29598 | 26 |
| 8.3 | The altitude transition rules | 29599 | 29612 | 14 |
| 8.3 | Per-Line Default Altitude | 29613 | 29625 | 13 |
| 8.3 | Alarm propagation up the altitudes | 29626 | 29633 | 8 |
| 8.3 | Iconographic LOD and the Density Ramp | 29634 | 29646 | 13 |
| 8.3 | Semantic zoom | 29647 | 29654 | 8 |
| 8.3 | Depth fog and focus | 29655 | 29663 | 9 |
| 8.3 | Camera bookmarks | 29664 | 29669 | 6 |
| 8.3 | Smart Focus | 29670 | 29676 | 7 |
| 8.3 | The Camera Grammar | 29677 | 29694 | 18 |
| 8.3 | The Establishing Shot | 29695 | 29698 | 4 |
| 8.3 | The Tour Camera / The Tenant's-Eye Walkthrough | 29699 | 29708 | 10 |
| 8.3 | The Ceiling Cam | 29709 | 29713 | 5 |
| 8.3 | The Security Camera Feed | 29714 | 29718 | 5 |
| 8.3 | The Ghost Facility | 29719 | 29725 | 7 |
| 8.3 | The Nobody-Is-Watching Frame | 29726 | 29734 | 9 |
| 8.3 | Sort-by-Risk Camera | 29735 | 29740 | 6 |
| 8.4 | The universal object grammar | 29746 | 29754 | 9 |
| 8.4 | Servers by shape | 29755 | 29766 | 12 |
| 8.4 | The object catalogue (shared visual grammar per family) | 29767 | 29801 | 35 |
| 8.4 | Racks, front and back | 29802 | 29812 | 11 |
| 8.4 | The back-of-rack detail set | 29813 | 29830 | 18 |
| 8.4 | Blinkenlights as primary telemetry | 29831 | 29871 | 41 |
| 8.4 | Link LED colour language | 29872 | 29879 | 8 |
| 8.4 | The half-dead link | 29880 | 29887 | 8 |
| 8.4 | Health as flow, not bars | 29888 | 29894 | 7 |
| 8.4 | Airflow direction as a visible object property | 29895 | 29903 | 9 |
| 8.4 | Cable colour coding | 29904 | 29921 | 18 |
| 8.4 | Cable archaeology | 29922 | 29928 | 7 |
| 8.4 | Progressive disclosure of cables | 29929 | 29934 | 6 |
| 8.4 | The power tree as a visible circulatory system | 29935 | 29945 | 11 |
| 8.4 | Cooling, CRAC units, and airflow | 29946 | 29957 | 12 |
| 8.4 | The heat bloom | 29958 | 29964 | 7 |
| 8.4 | Thermal ride-through as a draining reservoir | 29965 | 29970 | 6 |
| 8.4 | The generator and the lighting shift | 29971 | 29983 | 13 |
| 8.4 | The facility exterior | 29984 | 29989 | 6 |
| 8.4 | The Window | 29990 | 29996 | 7 |
| 8.4 | The internet cloud / spawn edge | 29997 | 30002 | 6 |
| 8.4 | Cross-connect ladder racking | 30003 | 30009 | 7 |
| 8.4 | Labels, and label quality as a visible investment | 30010 | 30020 | 11 |
| 8.4 | Wear, grime, and dust | 30021 | 30035 | 15 |
| 8.4 | Cable management debt as a rendering penalty | 30036 | 30044 | 9 |
| 8.4 | Cables tell your story | 30045 | 30049 | 5 |
| 8.4 | The rack as a progress bar | 30050 | 30055 | 6 |
| 8.4 | Auto-generated rack elevations | 30056 | 30060 | 5 |
| 8.4 | The elevation-vs-reality diff | 30061 | 30066 | 6 |
| 8.4 | The cage nut | 30067 | 30071 | 5 |
| 8.4 | Cold-aisle breath and the hoodie | 30072 | 30076 | 5 |
| 8.4 | The Scar Map | 30077 | 30087 | 11 |
| 8.4 | Sticker archaeology | 30088 | 30092 | 5 |
| 8.4 | The phantom cabinet | 30093 | 30096 | 4 |
| 8.4 | The Fresnel zone | 30097 | 30101 | 5 |
| 8.4 | The two registers: Room vs Board | 30102 | 30117 | 16 |
| 8.5 | The threat visual contract | 30124 | 30133 | 10 |
| 8.5 | Motion as behaviour (the seven motion primitives) | 30134 | 30149 | 16 |
| 8.5 | Silhouette rule for threats | 30150 | 30157 | 8 |
| 8.5 | Threat class marks | 30158 | 30165 | 8 |
| 8.5 | The Counter Match | 30166 | 30175 | 10 |
| 8.5 | Telegraphs | 30176 | 30195 | 20 |
| 8.5 | The unidentified state | 30196 | 30205 | 10 |
| 8.5 | Attack landing (the impact language) | 30206 | 30219 | 14 |
| 8.5 | Persistence and infestation | 30220 | 30226 | 7 |
| 8.5 | The Poisoned Tint | 30227 | 30236 | 10 |
| 8.5 | The Threat Gantry | 30237 | 30243 | 7 |
| 8.5 | Attack telegraphs and the radar sweep | 30244 | 30249 | 6 |
| 8.5 | The threat catalogue — technical threats | 30250 | 30297 | 48 |
| 8.5 | The threat catalogue — business, financial, legal and commercial threats | 30298 | 30334 | 37 |
| 8.6 | The patience ring | 30340 | 30353 | 14 |
| 8.6 | Aggregate Patience | 30354 | 30361 | 8 |
| 8.6 | Segment-coded appearance | 30362 | 30369 | 8 |
| 8.6 | Client avatars and the Suit Gradient | 30370 | 30380 | 11 |
| 8.6 | The Whale | 30381 | 30387 | 7 |
| 8.6 | Customer faces | 30388 | 30394 | 7 |
| 8.6 | The conversion moment | 30395 | 30402 | 8 |
| 8.6 | The bounce | 30403 | 30420 | 18 |
| 8.6 | The false-positive flash | 30421 | 30437 | 17 |
| 8.6 | Word-of-mouth tokens | 30438 | 30445 | 8 |
| 8.6 | Crowd density as a particle field | 30446 | 30455 | 10 |
| 8.6 | Latency as literal drag | 30456 | 30461 | 6 |
| 8.6 | The queue made visible | 30462 | 30468 | 7 |
| 8.6 | Session and duration classes | 30469 | 30477 | 9 |
| 8.6 | The visitor catalogue | 30478 | 30521 | 44 |
| 8.7 | Traffic as light | 30524 | 30532 | 9 |
| 8.7 | The queue as physical stacking | 30533 | 30539 | 7 |
| 8.7 | The red tide / backpressure | 30540 | 30543 | 4 |
| 8.7 | Health as colour temperature | 30544 | 30550 | 7 |
| 8.7 | Money as motion | 30551 | 30588 | 38 |
| 8.7 | Coin trails follow cables | 30589 | 30596 | 8 |
| 8.7 | Costs as drips | 30597 | 30601 | 5 |
| 8.7 | Depreciation fade | 30602 | 30608 | 7 |
| 8.7 | Upsell pop | 30609 | 30613 | 5 |
| 8.7 | SLA credit | 30614 | 30618 | 5 |
| 8.7 | Price increase ripple | 30619 | 30622 | 4 |
| 8.7 | Invoice Run Confetti | 30623 | 30629 | 7 |
| 8.7 | The business machine, rendered | 30630 | 30695 | 66 |
| 8.7 | Upgrades visible on the object | 30696 | 30708 | 13 |
| 8.7 | The connection-made click | 30709 | 30720 | 12 |
| 8.7 | Defense firing | 30721 | 30748 | 28 |
| 8.7 | The sieve | 30749 | 30754 | 6 |
| 8.7 | Recovery | 30755 | 30762 | 8 |
| 8.7 | Degraded mode | 30763 | 30771 | 9 |
| 8.7 | Failure feedback, in three tiers | 30772 | 30781 | 10 |
| 8.7 | Damage feedback on infrastructure | 30782 | 30788 | 7 |
| 8.7 | Breaker trip and power events | 30789 | 30792 | 4 |
| 8.7 | Data loss and corruption | 30793 | 30798 | 6 |
| 8.7 | The blast-radius preview | 30799 | 30807 | 9 |
| 8.7 | Before/After overlay for any change | 30808 | 30814 | 7 |
| 8.7 | The Consequence Fuse | 30815 | 30823 | 9 |
| 8.7 | The "It Was Fine" replay stamp | 30824 | 30834 | 11 |
| 8.7 | The status page as an in-game object | 30835 | 30839 | 5 |
| 8.7 | Alert escalation visuals | 30840 | 30848 | 9 |
| 8.7 | The de-escalation animation | 30849 | 30857 | 9 |
| 8.7 | The quiet moment | 30858 | 30865 | 8 |
| 8.7 | The empty lane | 30866 | 30872 | 7 |
| 8.7 | Build satisfaction and the boot sequence | 30873 | 30879 | 7 |
| 8.7 | Money number feel | 30880 | 30888 | 9 |
| 8.8 | The HUD skeleton | 30891 | 30905 | 15 |
| 8.8 | The Screen Budget | 30906 | 30919 | 14 |
| 8.8 | The Bezel HUD / the Instrument Bezel | 30920 | 30930 | 11 |
| 8.8 | The Panic Layout | 30931 | 30939 | 9 |
| 8.8 | The Top Bar — the Vitals | 30940 | 30957 | 18 |
| 8.8 | The Bottom Dock — the build bar | 30958 | 30967 | 10 |
| 8.8 | The Tradeoff Bar on every build card | 30968 | 30973 | 6 |
| 8.8 | The Cost Ghost (lifetime cost, not sticker price) | 30974 | 30979 | 6 |
| 8.8 | The Compare Tray | 30980 | 30984 | 5 |
| 8.8 | The Right Panel — the Inspector Faceplate | 30985 | 30996 | 12 |
| 8.8 | The Left Rail — the Alert Stack | 30997 | 31010 | 14 |
| 8.8 | The Bottom Strip — the Rack Ribbon and the Ledger Tape | 31011 | 31015 | 5 |
| 8.8 | The Site Preview Window | 31016 | 31049 | 34 |
| 8.8 | The Pulse Strip | 31050 | 31059 | 10 |
| 8.8 | The Hum Bar | 31060 | 31071 | 12 |
| 8.8 | The overlay wheel and its discipline | 31072 | 31094 | 23 |
| 8.8 | The Policy Layer view | 31095 | 31103 | 9 |
| 8.8 | Visual grammar for "not built" | 31104 | 31112 | 9 |
| 8.8 | The incident ticker | 31113 | 31117 | 5 |
| 8.8 | The Unified Clock Ribbon (Timeline + Obligation Rail, merged) | 31118 | 31138 | 21 |
| 8.8 | The graph drawer and the Graph Specification | 31139 | 31153 | 15 |
| 8.8 | The Telemetry Resolution zoom | 31154 | 31162 | 9 |
| 8.8 | The Demand Ratchet marker | 31163 | 31167 | 5 |
| 8.8 | "Explain This Number" | 31168 | 31176 | 9 |
| 8.8 | The Diff View | 31177 | 31186 | 10 |
| 8.8 | The dependency map | 31187 | 31191 | 5 |
| 8.8 | Sparklines everywhere | 31192 | 31195 | 4 |
| 8.8 | Group / meta-nodes | 31196 | 31199 | 4 |
| 8.8 | Growing tooltips | 31200 | 31209 | 10 |
| 8.8 | The hover-card contract | 31210 | 31218 | 9 |
| 8.8 | The "Why Did I Lose Money" button | 31219 | 31223 | 5 |
| 8.8 | The minimap, the NOC wall, and the Money Minimap | 31224 | 31236 | 13 |
| 8.8 | The Ledger Drawer | 31237 | 31240 | 4 |
| 8.8 | The Drawer System | 31241 | 31245 | 5 |
| 8.8 | The MRR Waterfall Widget | 31246 | 31250 | 5 |
| 8.8 | The Cash Calendar | 31251 | 31255 | 5 |
| 8.8 | The Runway Bar | 31256 | 31261 | 6 |
| 8.8 | The Funnel Column | 31262 | 31266 | 5 |
| 8.8 | The Cohort Wall / Cohort Grid | 31267 | 31271 | 5 |
| 8.8 | The Contract Gantt | 31272 | 31276 | 5 |
| 8.8 | The Renewal Calendar | 31277 | 31280 | 4 |
| 8.8 | The SLA Meter | 31281 | 31290 | 10 |
| 8.8 | The Concentration Donut | 31291 | 31296 | 6 |
| 8.8 | The Obligation Rail / the Commit Ledger | 31297 | 31302 | 6 |
| 8.8 | View filters: Money / Risk / Customer | 31303 | 31309 | 7 |
| 8.8 | The ticket queue panel | 31310 | 31313 | 4 |
| 8.8 | The DR Declaration board | 31314 | 31318 | 5 |
| 8.8 | Dead Air | 31319 | 31324 | 6 |
| 8.8 | Time-of-day lighting and the Diegetic Clock | 31325 | 31330 | 6 |
| 8.8 | Diegetic meters | 31331 | 31339 | 9 |
| 8.8 | Notification discipline | 31340 | 31348 | 9 |
| 8.8 | Tutorial-free onboarding | 31349 | 31358 | 10 |
| 8.8 | The Attention Heatmap | 31359 | 31366 | 8 |
| 8.8 | The Regret Marker | 31367 | 31372 | 6 |
| 8.8 | The Scale Bar and the Unit Stamp | 31373 | 31380 | 8 |
| 8.8 | Quiet Mode and Packet Mode | 31381 | 31387 | 7 |
| 8.8 | The Player Character Question | 31388 | 31397 | 10 |
| 8.8 | Diagram export | 31398 | 31401 | 4 |
| 8.8 | The Two-Second Rule for Every Screen | 31402 | 31411 | 10 |
| 8.9 | Aggregate, don't shrink | 31414 | 31429 | 16 |
| 8.9 | The Aggregate Glyph | 31430 | 31436 | 7 |
| 8.9 | Heat Tiles over Sprites | 31437 | 31442 | 6 |
| 8.9 | The Fleet Sparkline Wall | 31443 | 31448 | 6 |
| 8.9 | Anomaly highlighting, not status highlighting | 31449 | 31457 | 9 |
| 8.9 | Roll-Up Rendering | 31458 | 31462 | 5 |
| 8.9 | Aggregation badges | 31463 | 31465 | 3 |
| 8.9 | The colour budget | 31466 | 31469 | 4 |
| 8.9 | Alarm propagation and worst-state-wins | 31470 | 31472 | 3 |
| 8.9 | Row rhythm and floor signage | 31473 | 31479 | 7 |
| 8.9 | Tenant tinting | 31480 | 31492 | 13 |
| 8.9 | The Heartbeat Sync | 31493 | 31501 | 9 |
| 8.9 | The Cadence — rendering "nothing is happening" as an achievement | 31502 | 31512 | 11 |
| 8.9 | The Quiet Frame Test | 31513 | 31519 | 7 |
| 8.9 | The Loud Frame Test | 31520 | 31528 | 9 |
| 8.9 | The Thumbnail Test | 31529 | 31535 | 7 |
| 8.9 | Auto-LOD collapse and label culling | 31536 | 31542 | 7 |
| 8.9 | The readability targets | 31543 | 31551 | 9 |
| 8.9 | Zoom tiers change the metaphor | 31552 | 31560 | 9 |
| 8.10 | The Business-Line Skin System — the Five-Asset Skin Kit | 31566 | 31615 | 50 |
| 8.10 | The required five-field catalogue format | 31616 | 31626 | 11 |
| 8.10 | The Hero Object Rule | 31627 | 31631 | 5 |
| 8.10 | The HUD Swap Per Type | 31632 | 31643 | 12 |
| 8.10 | The Cross-Business Facility | 31644 | 31650 | 7 |
| 8.10 | Multi-line districts | 31651 | 31655 | 5 |
| 8.10 | The Business Line Placard | 31656 | 31659 | 4 |
| 8.10 | Cross-line collision control | 31660 | 31669 | 10 |
| 8.10 | Density signature | 31670 | 31676 | 7 |
| 8.10 | Visitor rhythm signature | 31677 | 31684 | 8 |
| 8.10 | Material and lighting language per line | 31685 | 31696 | 12 |
| 8.10 | Per-line visual identities — the catalogue | 31697 | 31809 | 113 |
| 8.10 | Era presentation shifts | 31810 | 31819 | 10 |
| 8.10 | The Chrome Skin Token Set | 31820 | 31836 | 17 |
| 8.10 | Era UI skins, enumerated | 31837 | 31841 | 5 |
| 8.10 | The era kits (art bible notes) | 31842 | 31866 | 25 |
| 8.10 | The Era Transition Animation | 31867 | 31874 | 8 |
| 8.10 | The signature-motion set | 31875 | 31885 | 11 |
| 8.10 | The Skin Preview Room | 31886 | 31890 | 5 |
| 8.10 | The Signature Frame | 31891 | 31895 | 5 |
| 8.10 | Weather and place at Z4 | 31896 | 31901 | 6 |
| 8.10 | The Two-Screenshot Test | 31902 | 31912 | 11 |
| 8.11 | The three-bus rule | 31918 | 31930 | 13 |
| 8.11 | The datacenter hum | 31931 | 31944 | 14 |
| 8.11 | The fan-row unison ramp | 31945 | 31953 | 9 |
| 8.11 | The silence of power loss | 31954 | 31960 | 7 |
| 8.11 | Fan spin-up and thermal audio | 31961 | 31964 | 4 |
| 8.11 | The drive click of death | 31965 | 31972 | 8 |
| 8.11 | The beep | 31973 | 31977 | 5 |
| 8.11 | The breaker snap | 31978 | 31981 | 4 |
| 8.11 | The relay clack and the genset | 31982 | 31986 | 5 |
| 8.11 | Drive seek chatter | 31987 | 31990 | 4 |
| 8.11 | Pager tones and severity | 31991 | 31997 | 7 |
| 8.11 | The noise problem | 31998 | 32005 | 8 |
| 8.11 | The cash register rhythm | 32006 | 32014 | 9 |
| 8.11 | Threat audio signatures | 32015 | 32023 | 9 |
| 8.11 | Per-line sound palettes | 32024 | 32034 | 11 |
| 8.11 | The other named sounds | 32035 | 32040 | 6 |
| 8.11 | Audio as visual redundancy, and visual as audio redundancy | 32041 | 32052 | 12 |
| 8.12 | The Cold Open | 32055 | 32063 | 9 |
| 8.12 | The Wave Telegraph | 32064 | 32070 | 7 |
| 8.12 | The Save | 32071 | 32081 | 11 |
| 8.12 | The 100% Uptime Stamp | 32082 | 32089 | 8 |
| 8.12 | The Night Shot | 32090 | 32095 | 6 |
| 8.12 | Loading screens as rack diagrams | 32096 | 32104 | 9 |
| 8.12 | The Credits Rack | 32105 | 32108 | 4 |
| 8.12 | Transition wipes by meaning | 32109 | 32114 | 6 |
| 8.12 | The juice moments worth budgeting for | 32115 | 32123 | 9 |
| 8.12 | The particle vocabulary | 32124 | 32131 | 8 |
| 8.12 | The FX catalogue | 32132 | 32169 | 38 |
| 8.13 | The Breathing LED | 32175 | 32185 | 11 |
| 8.13 | Fan Blur Ramp | 32186 | 32190 | 5 |
| 8.13 | Idle Fidgets | 32191 | 32199 | 9 |
| 8.13 | The Anticipation Budget | 32200 | 32206 | 7 |
| 8.13 | Screen Shake Budget | 32207 | 32213 | 7 |
| 8.13 | The Flash Language | 32214 | 32221 | 8 |
| 8.13 | Motion identity beats colour identity | 32222 | 32228 | 7 |
| 8.13 | The de-escalation language | 32229 | 32232 | 4 |
| 8.13 | Animation as the explanation | 32233 | 32241 | 9 |
| 8.14 | The Two-Channel Law, enforced | 32247 | 32254 | 8 |
| 8.14 | Contrast Audit Mode | 32255 | 32259 | 5 |
| 8.14 | Three colour-blind palettes, named | 32260 | 32271 | 12 |
| 8.14 | Colour-blind-safe money | 32272 | 32276 | 5 |
| 8.14 | The Strobe Budget | 32277 | 32286 | 10 |
| 8.14 | Reduced Motion mode | 32287 | 32296 | 10 |
| 8.14 | The Hum Bar | 32297 | 32300 | 4 |
| 8.14 | The visual EQ strip | 32301 | 32305 | 5 |
| 8.14 | Diagnostic audio captions, with location | 32306 | 32315 | 10 |
| 8.14 | Readout Mode | 32316 | 32320 | 5 |
| 8.14 | UI scale and the collapse behaviours | 32321 | 32325 | 5 |
| 8.14 | The full accessibility affordance list | 32326 | 32336 | 11 |
| 8.14 | The mimic exemption, written down | 32337 | 32345 | 9 |
| 8.15 | The Type System | 32351 | 32365 | 15 |
| 8.15 | Era display faces | 32366 | 32373 | 8 |
| 8.15 | The Number Law | 32374 | 32389 | 16 |
| 8.15 | The Big Number Rule | 32390 | 32395 | 6 |
| 8.15 | Three icon tiers | 32396 | 32402 | 7 |
| 8.15 | The icon family rules | 32403 | 32413 | 11 |
| 8.15 | Status Chips | 32414 | 32418 | 5 |
| 8.15 | The Label Plate Aesthetic | 32419 | 32423 | 5 |
| 8.15 | The Player Company Mark Generator | 32424 | 32441 | 18 |
| 8.15 | The Company Letterhead | 32442 | 32448 | 7 |
| 8.16 | The LOD Contract — every entity declares five things | 32454 | 32467 | 14 |
| 8.16 | The Silhouette Sheet (production gate) | 32468 | 32477 | 10 |
| 8.16 | The silhouette-first authoring test | 32478 | 32486 | 9 |
| 8.16 | The Salience Score | 32487 | 32495 | 9 |
| 8.16 | The Zoom Budget | 32496 | 32504 | 9 |
| 8.16 | The acceptance-test roster | 32505 | 32521 | 17 |
| 8.16 | The one-page style guide | 32522 | 32556 | 35 |
| 8.17 | Photo Mode | 32563 | 32572 | 10 |
| 8.17 | Key Art Direction | 32573 | 32580 | 8 |
| 8.17 | The Money Shot | 32581 | 32588 | 8 |
| 8.17 | The Rack Portrait | 32589 | 32593 | 5 |
| 8.17 | The Before/After Slider | 32594 | 32597 | 4 |
| 8.17 | The Incident Poster | 32598 | 32611 | 14 |
| 8.17 | The Screenshot Watermark and the share frame | 32612 | 32617 | 6 |
| 8.17 | The scrapbook wall | 32618 | 32624 | 7 |
| 8.18 | The audit finding | 32631 | 32641 | 11 |
| 8.18 | The hand-wave detector | 32642 | 32651 | 10 |
| 8.18 | The systems still thin, flagged for wave 3 | 32652 | 32667 | 16 |
| 9.1 | Campaign | 32681 | 32693 | 13 |
| 9.1 | Endless / Survival ("The NOC" / "The Long Haul" / "Keep It Running") | 32694 | 32708 | 15 |
| 9.1 | Incident Mode / Blitz Sev-1 | 32709 | 32727 | 19 |
| 9.1 | The Consultant (the 20-minute roguelite this design is secretly perfect for) | 32728 | 32743 | 16 |
| 9.1 | Roguelite Run Mode ("Bootstrapped") | 32744 | 32755 | 12 |
| 9.1 | Puzzle Mode ("Root Cause") and The Postmortem Puzzle | 32756 | 32767 | 12 |
| 9.1 | Daily Outage / Daily Incident / Scenario Weekly | 32768 | 32779 | 12 |
| 9.1 | Sandbox / Architect / Lab / Zen / "Rack Builder" | 32780 | 32796 | 17 |
| 9.1 | Co-op NOC (asymmetric information) | 32797 | 32817 | 21 |
| 9.1 | Co-op: Ops and Commercial ("Two Departments" / "Two-Person On-Call") | 32818 | 32827 | 10 |
| 9.1 | Versus / Red vs Blue (and the drafted-deck version) | 32828 | 32848 | 21 |
| 9.1 | Attacker Mode / Reverse TD interlude | 32849 | 32862 | 14 |
| 9.1 | Async "Attack My Network" | 32863 | 32871 | 9 |
| 9.1 | Competitive Market Mode / Market Share | 32872 | 32881 | 10 |
| 9.1 | Hot-seat: "Two Companies, One Keyboard" | 32882 | 32891 | 10 |
| 9.1 | Historical Scenarios / Historical Reenactments | 32892 | 32904 | 13 |
| 9.1 | Historical Campaign / Through the Eras | 32905 | 32914 | 10 |
| 9.1 | Campaign+ / New Game+ / "The Incumbent" | 32915 | 32922 | 8 |
| 9.1 | Minimalist Mode | 32923 | 32933 | 11 |
| 9.1 | Speedrun ("Zero to Nines" / "Zero to Rack" / "Ship It") | 32934 | 32940 | 7 |
| 9.1 | Hardcore / Ironman / On-Call | 32941 | 32946 | 6 |
| 9.1 | The business modes | 32947 | 32977 | 31 |
| 9.1 | Mode: The Analyst | 32978 | 32987 | 10 |
| 9.1 | Mode: Auditor Mode (post-game) | 32988 | 32994 | 7 |
| 9.1 | Mode: The Agent | 32995 | 33001 | 7 |
| 9.1 | Mode: Quarter Close | 33002 | 33007 | 6 |
| 9.1 | Mode: The Investor Update | 33008 | 33016 | 9 |
| 9.1 | Line Draft | 33017 | 33028 | 12 |
| 9.1 | One Building, Four Lines | 33029 | 33036 | 8 |
| 9.1 | Landlord vs Tenant | 33037 | 33043 | 7 |
| 9.1 | Tenant Mode / The Inverted Level | 33044 | 33053 | 10 |
| 9.1 | The Night Shift / "On-Call Night" | 33054 | 33062 | 9 |
| 9.1 | The Handover | 33063 | 33073 | 11 |
| 9.1 | Chaos Mode | 33074 | 33079 | 6 |
| 9.1 | The Sunset (the decommissioning level) | 33080 | 33089 | 10 |
| 9.1 | Succession / The Handoff | 33090 | 33096 | 7 |
| 9.1 | The Pager Simulator | 33097 | 33104 | 8 |
| 9.1 | Blind Mode | 33105 | 33114 | 10 |
| 9.1 | The Same Outage Six Ways | 33115 | 33121 | 7 |
| 9.1 | Museum Mode / The Era Gallery | 33122 | 33127 | 6 |
| 9.1 | Photo Contest / Rack Gallery | 33128 | 33136 | 9 |
| 9.1 | ⚔️ Mode tiering — twenty-six modes is too many, and none of them are prioritised | 33137 | 33158 | 22 |
| 9.2 | Your Past Self Is The Boss | 33161 | 33179 | 19 |
| 9.2 | The Architectural Bad-Habit library | 33180 | 33196 | 17 |
| 9.2 | The Inherited Mess / The Inherited System | 33197 | 33207 | 11 |
| 9.2 | The Ghost of the Previous Admin | 33208 | 33215 | 8 |
| 9.2 | The Legacy Box / "The Do Not Reboot Machine" | 33216 | 33227 | 12 |
| 9.2 | Documentation as a mechanic | 33228 | 33249 | 22 |
| 9.2 | Technical debt as visible substance | 33250 | 33266 | 17 |
| 9.2 | The Slow Boss | 33267 | 33273 | 7 |
| 9.2 | The On-Call Clock | 33274 | 33279 | 6 |
| 9.2 | The Vacation mechanic | 33280 | 33292 | 13 |
| 9.2 | Career Mode — a life outside the pager | 33293 | 33305 | 13 |
| 9.2 | The 3AM toggle and The 2am Rule | 33306 | 33316 | 11 |
| 9.2 | Rubber Duck and The Second Opinion | 33317 | 33327 | 11 |
| 9.2 | Vendor Personalities — the full counterparty cast | 33328 | 33355 | 28 |
| 9.2 | The vendor prices to your switching cost | 33356 | 33366 | 11 |
| 9.2 | You become the vendor squeezing someone else | 33367 | 33374 | 8 |
| 9.2 | The customer who is also your investor | 33375 | 33381 | 7 |
| 9.2 | The founders' agreement | 33382 | 33388 | 7 |
| 9.2 | The Personal Guarantee | 33389 | 33396 | 8 |
| 9.2 | Regulatory Weather / Regulatory Drift | 33397 | 33406 | 10 |
| 9.2 | Community Bug Reports | 33407 | 33412 | 6 |
| 9.2 | The Threat You Can Hire | 33413 | 33425 | 13 |
| 9.2 | Defend Someone Else | 33426 | 33432 | 7 |
| 9.2 | The Dependency Web | 33433 | 33449 | 17 |
| 9.2 | The Hidden Dependency / The Dependency Nobody Knew About | 33450 | 33458 | 9 |
| 9.2 | Shared World Events | 33459 | 33465 | 7 |
| 9.2 | The Seasonal Calendar / Seasons | 33466 | 33476 | 11 |
| 9.2 | Market Cycles | 33477 | 33485 | 9 |
| 9.2 | "It's Always DNS" (with an honest counter) | 33486 | 33503 | 18 |
| 9.2 | The Unreliable Dashboard | 33504 | 33513 | 10 |
| 9.2 | The Reveal Mechanic (your own infrastructure as fog of war) | 33514 | 33522 | 9 |
| 9.2 | Metric Gaming | 33523 | 33529 | 7 |
| 9.2 | Everything Is Someone's Fault, Nothing Is Simple | 33530 | 33538 | 9 |
| 9.2 | Difficulty via Honesty ("Sysadmin Mode") | 33539 | 33556 | 18 |
| 9.2 | The Pivot | 33557 | 33561 | 5 |
| 9.2 | You Can Fire Customers (and its quieter sibling) | 33562 | 33572 | 11 |
| 9.2 | The One Customer Who Is Always Right / The Unremovable Customer | 33573 | 33580 | 8 |
| 9.2 | The "Unlimited" Trap | 33581 | 33587 | 7 |
| 9.2 | The Legacy Plan | 33588 | 33593 | 6 |
| 9.2 | The Handshake Deal | 33594 | 33599 | 6 |
| 9.2 | Every Decision Has a Receipt / the time-delayed consequence engine | 33600 | 33613 | 14 |
| 9.2 | The Camera Is a Camera | 33614 | 33632 | 19 |
| 9.2 | The Investor Dashboard Lie | 33633 | 33644 | 12 |
| 9.2 | Postmortem Publishing and the Status Page Voice | 33645 | 33661 | 17 |
| 9.2 | The Compliance Theater Meter | 33662 | 33675 | 14 |
| 9.2 | The RFP Minigame | 33676 | 33684 | 9 |
| 9.2 | The Migration Weekend | 33685 | 33691 | 7 |
| 9.2 | Named Disasters | 33692 | 33699 | 8 |
| 9.2 | The Green Dilemma | 33700 | 33710 | 11 |
| 9.2 | Reversible Bad Ideas | 33711 | 33719 | 9 |
| 9.2 | The Ethics Track | 33720 | 33731 | 12 |
| 9.2 | You Are the Attacker's Target Board | 33732 | 33739 | 8 |
| 9.2 | The Conference Talk | 33740 | 33746 | 7 |
| 9.2 | The marketing site on your own infra | 33747 | 33753 | 7 |
| 9.2 | The customer who becomes a competitor | 33754 | 33761 | 8 |
| 9.2 | The acquisition offer you should refuse | 33762 | 33767 | 6 |
| 9.2 | Weather Affects Everything — scoped | 33768 | 33783 | 16 |
| 9.2 | The Hardware Lottery and the Uptime Superstition | 33784 | 33799 | 16 |
| 9.2 | Reputation Has a Face | 33800 | 33812 | 13 |
| 9.2 | The Line That Eats You | 33813 | 33824 | 12 |
| 9.2 | The Hardware Afterlife | 33825 | 33833 | 9 |
| 9.2 | Reverse Colo | 33834 | 33840 | 7 |
| 9.2 | "Works On My Machine" (the card, and the customer) | 33841 | 33851 | 11 |
| 9.2 | The Missing Screw | 33852 | 33862 | 11 |
| 9.2 | The Beeping Server | 33863 | 33874 | 12 |
| 9.2 | The What Would Break tool | 33875 | 33885 | 11 |
| 9.2 | The Long Weekend (an offline/idle layer) | 33886 | 33898 | 13 |
| 9.2 | The Company Handbook | 33899 | 33908 | 10 |
| 9.2 | The Board Meeting | 33909 | 33915 | 7 |
| 9.2 | The "It's Fine" counter | 33916 | 33921 | 6 |
| 9.2 | The Hardest Lesson, Delivered Once | 33922 | 33931 | 10 |
| 9.3 | Recognition comedy, not parody | 33934 | 33951 | 18 |
| 9.3 | The ticket text generator | 33952 | 33978 | 27 |
| 9.3 | Server naming and the label maker | 33979 | 34001 | 23 |
| 9.3 | The label maker that ran out of tape | 34002 | 34007 | 6 |
| 9.3 | The cable colour war | 34008 | 34013 | 6 |
| 9.3 | The sticky note system | 34014 | 34021 | 8 |
| 9.3 | The Intern's Log | 34022 | 34033 | 12 |
| 9.3 | Achievements | 34034 | 34068 | 35 |
| 9.3 | Outage Bingo | 34069 | 34076 | 8 |
| 9.3 | The fictional trade press and the Competitor Obituary Feed | 34077 | 34088 | 12 |
| 9.3 | The industry forum thread | 34089 | 34096 | 8 |
| 9.3 | The Trade Radio | 34097 | 34105 | 9 |
| 9.3 | The status page euphemism ladder — and its commercial twin | 34106 | 34118 | 13 |
| 9.3 | The vendor comedy channel | 34119 | 34128 | 10 |
| 9.3 | The maintenance notification nobody reads | 34129 | 34135 | 7 |
| 9.3 | The office set dressing | 34136 | 34153 | 18 |
| 9.3 | The Office Cat | 34154 | 34160 | 7 |
| 9.3 | The Legacy Server With a Name | 34161 | 34167 | 7 |
| 9.3 | The certificate whose CN is `localhost` | 34168 | 34170 | 3 |
| 9.3 | "Restart it." | 34171 | 34173 | 3 |
| 9.3 | The on-call handoff note that says only "quiet night" | 34174 | 34176 | 3 |
| 9.3 | The Advisor Voicemail | 34177 | 34183 | 7 |
| 9.3 | The corporate comedy set | 34184 | 34194 | 11 |
| 9.3 | Cameo Customers | 34195 | 34204 | 10 |
| 9.3 | The Post-It with the root password | 34205 | 34207 | 3 |
| 9.3 | The RFC 2324 easter egg | 34208 | 34210 | 3 |
| 9.3 | The Cursed Basement | 34211 | 34218 | 8 |
| 9.3 | The Postmortem Blog | 34219 | 34226 | 8 |
| 9.3 | The Ops Diary Comic | 34227 | 34233 | 7 |
| 9.3 | Loading-screen tips that are real advice | 34234 | 34242 | 9 |
| 9.3 | Staff chatter | 34243 | 34248 | 6 |
| 9.3 | The rm -rf moment | 34249 | 34259 | 11 |
| 9.4 | ⚔️ One persistent Company object, four faces | 34262 | 34276 | 15 |
| 9.4 | The Long Save | 34277 | 34285 | 9 |
| 9.4 | The Playbook | 34286 | 34296 | 11 |
| 9.4 | The Company Wiki / Knowledge Base | 34297 | 34303 | 7 |
| 9.4 | The Alumni Network | 34304 | 34311 | 8 |
| 9.4 | Career Mode for Staff | 34312 | 34318 | 7 |
| 9.4 | The Persistent Reputation Ledger | 34319 | 34325 | 7 |
| 9.4 | The Annual Report | 34326 | 34338 | 13 |
| 9.4 | The Anniversary | 34339 | 34345 | 7 |
| 9.4 | The Ops Almanac | 34346 | 34353 | 8 |
| 9.4 | Industry Benchmarks | 34354 | 34359 | 6 |
| 9.4 | The Uptime Streak — one shared, persistent, cross-mode object | 34360 | 34370 | 11 |
| 9.4 | The Postmortem Wall / The Postmortem Reading Room | 34371 | 34383 | 13 |
| 9.4 | The Company Museum | 34384 | 34402 | 19 |
| 9.4 | The Museum Docent | 34403 | 34410 | 8 |
| 9.4 | The Company Wall | 34411 | 34416 | 6 |
| 9.4 | Business Mix Panel | 34417 | 34424 | 8 |
| 9.4 | Procedural label text | 34425 | 34431 | 7 |
| 9.4 | The diegetic settings menu — per era | 34432 | 34442 | 11 |
| 9.4 | Screenshot watermark | 34443 | 34452 | 10 |
| 9.4 | Modding the skin kit — and the Ruleset Card as a shipped editor | 34453 | 34475 | 23 |
| 9.4 | The tutorial is a job | 34476 | 34482 | 7 |
| 9.4 | The Ending camera move | 34483 | 34501 | 19 |
| 9.5 | ⚔️ Teaching is by event; explaining is on demand | 34504 | 34516 | 13 |
| 9.5 | Field Notes | 34517 | 34539 | 23 |
| 9.5 | The hosting glossary | 34540 | 34548 | 9 |
| 9.5 | The "was that real?" tag | 34549 | 34579 | 31 |
| 9.5 | The Order of Operations card | 34580 | 34588 | 9 |
| 9.5 | The Unit Conversion drawer | 34589 | 34597 | 9 |
| 9.5 | The Real Postmortem Library ("this actually happened") | 34598 | 34608 | 11 |
| 9.5 | A real post-level debrief card | 34609 | 34615 | 7 |
| 9.5 | Import Your Own Topology | 34616 | 34636 | 21 |
| 9.5 | Educational mode | 34637 | 34644 | 8 |
| 9.5 | The community scenario editor | 34645 | 34649 | 5 |
| 9.6 | Every tower has a downside — except a small curated set | 34655 | 34671 | 17 |
| 9.6 | No optimal build order | 34672 | 34682 | 11 |
| 9.6 | Lose slowly — with an operational definition | 34683 | 34690 | 8 |
| 9.6 | Teach through loss, never through text | 34691 | 34697 | 7 |
| 9.6 | The three-clock rule | 34698 | 34700 | 3 |
| 9.6 | The player must always be able to answer "what is the worst thing that could happen right now" | 34701 | 34703 | 3 |
| 9.6 | Every number on screen must be explainable | 34704 | 34707 | 4 |
| 9.6 | No mechanic may be invisible in both directions | 34708 | 34711 | 4 |
| 9.6 | Every irreversible action is marked before it is taken, not after | 34712 | 34717 | 6 |
| 9.6 | Revenue is never just a number | 34718 | 34723 | 6 |
| 9.6 | Make the boring thing beautiful — with a budget mechanism | 34724 | 34742 | 19 |
| 9.6 | Asset reuse discipline | 34743 | 34750 | 8 |
| 9.6 | Accessibility as a feature, not a setting | 34751 | 34761 | 11 |
| 9.6 | Pause-and-plan is the default pacing | 34762 | 34766 | 5 |
| 9.6 | Peacetime must be valuable | 34767 | 34770 | 4 |
| 9.6 | The reward is letting things through | 34771 | 34782 | 12 |
| 9.6 | The game must let you be good at this job | 34783 | 34791 | 9 |
| 9.6 | Nothing has an immediate result | 34792 | 34795 | 4 |
| 9.6 | ⚔️ "Ship the real monsters" vs "hosting is flavour for mechanics" — a resolution | 34796 | 34807 | 12 |
| 9.6 | Hosting-type authoring tests (belongs with §0.2) | 34808 | 34816 | 9 |
| 9.6 | Line synergy and antagonism, with numbers (belongs with §0.2) | 34817 | 34835 | 19 |
| 9.7 | Level editor and workshop | 34838 | 34845 | 8 |
| 9.7 | Spectator, replay and the Timeline Scrubber | 34846 | 34859 | 14 |
| 9.7 | The Stream Overlay | 34860 | 34868 | 9 |
| 9.7 | Seasonal live events | 34869 | 34874 | 6 |
| 9.7 | Company culture as a stat | 34875 | 34885 | 11 |
| 9.7 | Real uptime leaderboard | 34886 | 34892 | 7 |
| 9.7 | The screensaver / idle view — "The Aquarium" | 34893 | 34908 | 16 |
| 9.7 | The Whiteboard Mode | 34909 | 34915 | 7 |
| 9.7 | Mobile companion / status page | 34916 | 34922 | 7 |
| 9.7 | Franchise and multi-company play | 34923 | 34933 | 11 |
| 9.8 | The Tutorial Is An Interview | 34939 | 34947 | 9 |
| 9.8 | Systems arrive one per level for the first act | 34948 | 34953 | 6 |
| 9.8 | Assistant modes — three dials on three different axes | 34954 | 34965 | 12 |
| 9.8 | "Explain This Incident" — an accessibility feature that is also a design test | 34966 | 34980 | 15 |
| 9.8 | Readout Mode | 34981 | 34989 | 9 |
| 9.8 | Accessibility Replay | 34990 | 34996 | 7 |
| 9.8 | One-Hand Mode | 34997 | 35002 | 6 |
| 9.8 | Sonified Mode | 35003 | 35010 | 8 |
| 9.8 | The baseline accessibility commitments | 35011 | 35020 | 10 |
| 9.8 | The Cursor | 35021 | 35030 | 10 |
| 9.9 | The Acquisition Endgame | 35036 | 35045 | 10 |
| 9.9 | The Exit Interview (yours) | 35046 | 35054 | 9 |
| 9.9 | The Quiet Handoff | 35055 | 35064 | 10 |
| 9.9 | Becoming the Thing | 35065 | 35073 | 9 |
| 9.9 | Two Companies, One You | 35074 | 35082 | 9 |
| 9.9 | Failure is Narrated, Not Punished | 35083 | 35094 | 12 |
| 9.9 | The end credits roll down a cable tray | 35095 | 35099 | 5 |
| 9.10 | Photo Mode / Rack Portrait Studio | 35105 | 35112 | 8 |
| 9.10 | Blueprint Export | 35113 | 35117 | 5 |
| 9.10 | The Rack Elevation Poster | 35118 | 35124 | 7 |
| 9.10 | The "Everything Is Green" screenshot | 35125 | 35130 | 6 |
| 9.10 | The Logo Generator | 35131 | 35139 | 9 |
| 9.10 | The Customer Logo Generator | 35140 | 35146 | 7 |
| 9.10 | Sticker Pack Cosmetics | 35147 | 35153 | 7 |
| 9.10 | Cosmetic Economy (non-pay) | 35154 | 35161 | 8 |
| 9.10 | The Seasonal Decoration Pack | 35162 | 35166 | 5 |
| 9.10 | Rack Cards (collectibles) | 35167 | 35173 | 7 |
| 9.10 | The Hall of Fame Drive | 35174 | 35180 | 7 |
| 9.10 | The Postmortem Club | 35181 | 35192 | 12 |
| 9.10 | The Failure Hall of Fame | 35193 | 35199 | 7 |
| 9.10 | Scenario sharing (and the interview-practice side effect) | 35200 | 35206 | 7 |
| 9.10 | Real Runbook Export | 35207 | 35214 | 8 |
| 9.10 | The Ledger Export (your P&L) | 35215 | 35222 | 8 |
| 9.10 | The Ops Diary Comic and The Postmortem Blog | 35223 | 35228 | 6 |
| 9.11 | Responsible Depiction Note | 35233 | 35251 | 19 |
| 9.11 | Localisation and ticket packs | 35252 | 35260 | 9 |
| 9.11 | Hosting-Type as Data (the variety engine's architecture) | 35261 | 35272 | 12 |
| 9.11 | Real-World-Shaped Data Mode | 35273 | 35285 | 13 |
| 9.12 | The Crash Cart | 35290 | 35295 | 6 |
| 9.12 | The Blanking Panel | 35296 | 35301 | 6 |
| 9.12 | The Grounding / Bonding check | 35302 | 35307 | 6 |
| 9.12 | The ESD strap | 35308 | 35313 | 6 |
| 9.12 | Spare Parts Cannibalization | 35314 | 35319 | 6 |
| 9.12 | Firmware as a hidden version axis | 35320 | 35325 | 6 |
| 9.12 | Patch Debt | 35326 | 35331 | 6 |
| 9.12 | The Maintenance Window Negotiation | 35332 | 35340 | 9 |
| 9.12 | The Rollback That Isn't | 35341 | 35347 | 7 |
| 9.12 | The Runbook You Wrote At 4am | 35348 | 35354 | 7 |
| 9.12 | IP Reputation as an inherited property of address space | 35355 | 35364 | 10 |
| 9.12 | Latency as a physical constraint on the world map | 35365 | 35374 | 10 |
| 9.12 | The Broker Lunch | 35375 | 35380 | 6 |
| 9.12 | Conference Booth Builder | 35381 | 35386 | 6 |
| 9.12 | Cross-references for small ideas placed elsewhere | 35387 | 35397 | 11 |
| 9.13 | What to prototype first (the game-design lens, in order) | 35405 | 35418 | 14 |
| 9.13 | The six changes the game-design lens would make first | 35419 | 35435 | 17 |
| 9.13 | The ten highest-value items from the operations lens | 35436 | 35458 | 23 |
| 9.13 | The structural fixes the generalist lens would insist on | 35459 | 35470 | 12 |
| 9.13 | What the art lens would fund first | 35471 | 35481 | 11 |
| 9.13 | The single most valuable moment the business lens would build | 35482 | 35489 | 8 |
| 9.13 | ⚔️ Where the priority lists disagree | 35490 | 35507 | 18 |
