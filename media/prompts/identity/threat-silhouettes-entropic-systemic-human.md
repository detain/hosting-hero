# Threat silhouettes — entropic, systemic, human

<!-- spec: hosting_game.md §8.5 (silhouette rule, class marks, reserved "none" telegraph for
     entropy/hunters, hardware/thermal/power/fire/BGP/insider entries), §8.4 (LED grammar, power
     tree, heat bloom) -->

The quiet half of the bestiary. Entropic threats are deliberately **undramatic** — decay, click,
dust — and their telegraph grade is reserved to "none": their only warning is a wrongness in the
object itself. Systemic threats originate above your perimeter (upstream, supply chain, the wire
between buildings). Human threats look **normal with exactly one subtly wrong property**, and
"physical/environmental" reads as an overlay effect on the board rather than a unit at all.
Environmental mark = wave, physical mark = cracked square, human mark = silhouette head.

### V1 — entropic decay stills (drive-click, heat, dust)

```
POSITIVE: sprite sheet of three quiet pixel-art disaster states of a single server unit on a flat
solid magenta #FF00FF background, 32-bit isometric pixel-art, matte desaturated hardware palette
(black steel, beige plastic, warm grey #9B8A6F wear tones), each state readable in silhouette with
no motion: (1) a failed drive carrier pulled half-out of a slot with a tiny drooping cracked-square
badge plate beside it and one dark dust puff settling — deliberately boring, a dull mechanical
ending, (2) a rack row section with air vents sagging under a faint pale orange heat lens overlay
(hex #F0862E used only as a translucent film over part of the unit, the game's thermal-lens
convention) and dust baked thick on the grille, (3) an unattended corner with a yellowed peeling
label strip, a frayed cable end hanging loose and a fine grey powder drift on top of the chassis;
one-pixel outlines, even dim practical lighting as if lit by its own equipment, no glow, no flames,
no sparks, no drama, crisp pixels, no text, no letters, no numbers, no watermark, no UI captions
NEGATIVE: text, watermark, explosions, fire, dramatic sparks, neon, saturated colours, smoke
plumes, action poses, red washes, cartoon damage stars
size: 1536x1024
aspect: 3:2
style: pixel-art
background: magenta-key
variations: generate 4; the correct emotional read is "the boring killer" — reject any pick that
looks like an action event
```

### V2 — systemic intrusion above the perimeter (supply-chain, hijack)

```
POSITIVE: sprite sheet of three flat vector signal graphics in one family on a clean near-black
ink-blue backdrop (hex #14202E), crisp linework, solid fills, the same lane-and-node diagram
vocabulary: (1) an incoming trunk line from off-frame carrying a package-shaped foreign node spliced
into it — the splice drawn in a visibly alien hue against the honest cyan traffic line (hex
#35E0E6), suggesting tainted upstream supply, (2) a simplified world-map corner where a bundle of
routing arcs that should converge on your marked site instead bends away toward a foreign
unsolicited dot, the stolen arc drawn in hostile magenta (hex #E04FD8) with a thin dotted
ghost-line showing the correct old path, (3) a tall traffic-light totem glyph standing at the top
edge of a lane, three stacked discs with the lowest glowing calm green (hex #4FC46A), presented as
a threatening object of authority above the pipe; all three share one geometric stroke weight, read
in greyscale by shape alone, flat unlit annotation style, no gradients, no text, no letters, no
numbers, no watermark, no UI captions
NEGATIVE: text, letters, watermark, photorealism, globe render, country borders detail, pixel stair
-steps, glow bloom, rainbow, decorative maps
size: 1536x1024
aspect: 3:2
style: vector
background: scene
variations: generate 3; verify the hijack arc reads "my traffic leaving me" without labels — that is
the whole mechanic
```

### V3 — the insider and the human-shaped threats

```
POSITIVE: sprite sheet of four near-identical ordinary worker pawn figures on a flat solid magenta
#FF00FF background, 32-bit isometric pixel-art, muted staff livery (grey-blue coverall, polo,
lanyard), solid readable silhouettes, deliberately unremarkable — but each carries exactly ONE
subtly wrong property that the careful player can find: (1) one figure's badge lanyard hangs at a
slightly impossible angle reversed against its chest, (2) one figure casts its shadow a quarter-turn
off from the shared light direction of the other three, (3) one figure's foot posture is mid-step
while standing still among idle neighbours, (4) one figure carries the standard clipboard prop but
the board's clip faces backwards; the wrongness must be silhouette-visible when colour is drained,
never a hue tell; one-pixel outlines, desaturated palette, even practical lighting, crisp pixels,
no text, no letters, no numbers, no watermark, no UI captions
NEGATIVE: text, watermark, hooded villain cliches, dark aura, glowing red eyes, smoke, dramatic
rim-light, saturated colours, photorealism
size: 1536x1024
aspect: 3:2
style: pixel-art
background: magenta-key
variations: generate 6 — hardest class in the game to prompt; keep only frames where a colleague
shown the sheet for five seconds can circle the wrongness (Two-Second Rule applied to art review)
```

---

**PICK CRITERIA:** entropic stills must pass the Quiet Frame emotion check (dull, not loud, §8.5
hardware-failure spec); insider sheet's single wrong property survives greyscale and 24px
(§8.16); systemic marks keep cyan=honest-traffic and magenta=hostile inversions untouched (Hue
Ledger §8.2).
