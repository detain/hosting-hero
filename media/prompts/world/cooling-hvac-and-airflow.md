# Cooling, HVAC & airflow — the invisible made honest

<!-- spec: hosting_game.md §8.4 (CRAC = big box with airflow arrows, failing arrows fade; cold mist
     from perforated tiles; heat shimmer above hot aisles; containment curtains; thermal overlay:
     cold air blue from tiles through racks exits hot orange; recirculation eddies visible;
     blanking panels click-to-place; heat bloom = expanding orange gradient across floor tiles;
     thermal ride-through = draining blue reservoir sized by thermal mass; rear-door heat
     exchangers and liquid manifolds of the 2020s kit, §8.10), §8.2 (orange = the heat LENS,
     #F0862E, never a fill) -->

Cooling is the game's second circulatory system, and its sprites are the only WORLD objects allowed
a little atmospheric magic — because cold mist and heat shimmer are PHYSICS the player reads. The
discipline: orange is always a lens/film over reality, blue airflow reads through material, and the
machines themselves stay muted steel.

### V1 — the CRAC/CRAH unit family

```
POSITIVE: sprite sheet of three isometric pixel-art air-conditioning units for a datacenter floor
on a flat solid magenta #FF00FF background, 32-bit iso game style, all sharing a big-box domestic-
industrial character: (1) a floor-standing computer-room air conditioner in off-white powder-coat
steel with a tall return grille across its upper face and a wide supply mouth at its base, a small
dark blank control window and two pinprick status LEDs (green hex #4FC46A steady, one amber hex
#F2B133), faint cold mist drawn as two or three low soft wisps pooling at its discharge where it
meets the floor; (2) the same body seen from its back with a heavy condenser coil fin field and a
large slow fan blur behind a wire guard, the blades caught in a soft rotational smear; (3) a
compact in-row cooling unit, narrower and taller like a slim rack twin, designed to stand between
cabinets, with a vertical vent seam and a drip-tray line at its foot; bodies matte painted steel,
slightly yellowed at one unit's corners to suggest age, hard readable silhouettes distinct from
server racks by their vents and proportions, no glow, crisp pixels, even cool room lighting, no
text, no letters, no numbers, no watermark, no UI captions
NEGATIVE: text, letters, numbers, watermark, photorealism, air-conditioner brand logos, dripping
water, ice, snow, neon blue glow, household AC split units, exhaust smoke, rack LEDs confusion
size: 2048x1024
aspect: 2:1
style: pixel-art
background: magenta-key
variations: generate 4; CRAC-vs-rack silhouette confusion is the failure mode — at 24px each unit
must obviously MOVE AIR, not compute
```

### V2 — the thermal overlay study (cold in / hot out)

```
POSITIVE: isometric pixel-art diorama cross-section of a short aisle of three server racks cut away
to show airflow as the game's thermal overlay reads it, on a flat solid magenta #FF00FF background,
32-bit iso style: pale cold air drawn as a soft translucent blue-grey film with small directional
chevron streamlines rising out of a perforated floor tile, flowing forward and being drawn INTO the
front faces of the racks; behind the racks the same streamlines re-emerge as a warm thin orange
LENS film (hex #F0862E used strictly as a translucent heat-haze wash and rising wavy shimmer lines,
never a solid), collecting and rising toward a return vent in the ceiling fragment; one rack shows
a recirculation EDDY — a small curling loop where hot air sneaks back around to its own cold side,
drawn as a tight spiral of the orange film meeting the blue, the visible mistake; blanking panels
fill the rack gaps that aren't leaking; racks themselves muted steel with pinprick LEDs, the AIR
doing all the colour work as thin overlays covering under a fifth of the frame; hard geometry,
crisp pixels, dim even lighting, no text, no letters, no numbers, no watermark, no UI captions
NEGATIVE: text, watermark, photorealism, fire, thick smoke, saturated colour flood covering racks,
glowing energy beams, arrows with labels, blueprint linework replacing the diorama, steam clouds
size: 1536x1024
aspect: 3:2
style: pixel-art
background: scene
variations: generate 4; the eddy must be findable in five seconds — that curl is the object of the
whole teaching image
```

### V3 — ride-through and heat bloom moments

```
POSITIVE: two-panel pixel-art diorama sprite on a flat solid magenta #FF00FF background, 32-bit iso
game style, same short aisle of racks in both panels showing the thermal crisis beat: LEFT panel —
the calm before: a translucent cool blue reservoir form hovering low over the floor like a thin
shallow pool of light between the rack feet, its level high and still, the racks wearing ordinary
green pinprick LEDs; RIGHT panel — five minutes later: the same pool visibly DRAINED to a thin
ripple (thermal ride-through spending its stored cold), and across the floor tiles an expanding
soft orange bloom gradient (hex #F0862E kept as a low film over the floor, brightest at a hotspot
center) with pronounced heat-shimmer wavy lines rising off two rack tops whose LED rows now scatter
amber (hex #F2B133); one rack still green as the honest exception; the story reads as DRAIN versus
SPREAD, two clocks running out at once; muted steel hardware throughout, atmospheric colour only in
the floor films, hard silhouettes, crisp pixels, dimming warm-shifted lighting on the right panel,
no text, no letters, no numbers, no watermark, no UI captions
NEGATIVE: text, watermark, photorealism, fire, flames, melting metal, smoke plumes, red alarm
flood, exploding racks, disaster-movie rubble, saturated orange covering everything
size: 2048x1024
aspect: 2:1
style: pixel-art
background: magenta-key
variations: generate 4; verify the right panel still reads when printed greyscale — bloom must
carry as luminance gradient, shimmer as wave-lines, drain as pool-size, no colour crutches
```

### V4 — the 2020s liquid loop (CDU and manifold detail)

```
POSITIVE: isometric pixel-art close diorama on a flat solid magenta #FF00FF background, 32-bit iso
game style: one modern liquid-cooled rack corner — a black steel rack whose front is partially
replaced by visible COOLING PLUMBING: a compact coolant distribution unit bolted at its base with
two round gauge faces left blank, twin braided hoses in muted teal-grey rising with honest heavy
sag to quick-disconnect fittings at the rack's spine, a slim manifold bar across the top feeding
short drop-loops to three deep GPU-class chassis whose fin fields glint with a faint warm under-
glow of captured heat (amber points only, no flood); a rear-door heat exchanger suggested at the
far side as a second radiator-like door with dense fins and one large fan blur; floor around the
hose landing kept clean with a small drip tray at the CDU foot, one dusty legacy air-cooled unit
visible behind for contrast; palette of matte black steel, muted teal lines, warm copper fittings
(hex #C97A45 on brass fittings only), hard readable silhouette family, crisp pixels, even dim
lighting, no text, no letters, no numbers, no watermark, no UI captions
NEGATIVE: text, watermark, photorealism, leaking coolant puddles, neon glow loops, gamer liquid
cooling with coloured lights, steam, pipes covering the whole rack, futuristic chrome
size: 1536x1024
aspect: 3:2
style: pixel-art
background: magenta-key
variations: generate 4; hose SAG and fitting density are the realism bar — this is the 2020s kit's
signature plumbing, it should look installed, not designed
```

---

**PICK CRITERIA:** orange appears ONLY as lens/film, never solid (form law §8.2); V3 passes full
greyscale beat-legibility (drain vs spread); CRAC family silhouettes never confusable with server
racks at 24px (§8.16 no-two-families rule applied to the world's most similar-looking objects).
