# Key Art — Hero / Money Shot (the pullback through the building)

<!-- spec: hosting_game.md §8.17 Key Art (money shot: "camera pulls back through the hot aisle, past the containment glass, out the door, up over the campus, and the sign lights up"), §8.1 style allocation + lighting model, §8.2 form law (gold moves, amber fills, orange is a lens, red is final), docs/adr/0001 iso-diorama world law -->

PROMO family. The single promise image of the game, rendered as one frozen frame of the spec-named pullback: a receding isometric-diorama depth-stack — hot-aisle racks in the immediate foreground, containment glass mid-ground, the exit door beyond, and the campus exterior opening up overhead/behind in one continuous forced-perspective composition. Painterly-editorial concept art at illustration grade, but the world grammar stays the game's: fixed-angle miniature, rooms lit only by their own equipment, a very small human figure for scale (competence under pressure, at night, alone). Hue Ledger is law: amber #F2B133 fills alerts, cyan #35E0E6 moves as legit traffic, green #4FC46A marks served-healthy, gold #E8B23C is money and nothing else, ink-blue #14202E structure. Four lighting variations of the same composition — pick the one that matches the marketing season.

---

### V1 — Dusk Pullback

```
POSITIVE: painterly-editorial concept key art, wide establishing composition built as a receding isometric diorama in forced perspective: in the near foreground the honeycomb end-cap of a hot aisle, matte black rack doors with dense LED combs glowing green #4FC46A in long rows, one rack filled amber #F2B133; the camera line travels past a wall of frosted containment glass with cool cyan #35E0E6 light bleeding through it in moving streaks; beyond, a heavy fire door under a small green exit light; and above/behind it all the exterior of the datacenter campus at dusk, low brick buildings with lit clerestory windows, a sky graded deep violet-free indigo to warm horizon peach, first stars, a faint contrail. One tiny human silhouette with a shoulder bag walking out toward the parking lot, scale-against-cathedral. Practical lighting only: every light source is equipment, exit signage, or dusk ambience; volumetric aisle haze; tilt-shift falloff on the far campus; industrial grit on floors and cable trays; overhead cable plumes like chandelier arms. Muted dominant palette with saturated accents used sparingly as state. No text, no letters, no numbers, no watermark, no UI captions.
NEGATIVE: photoreal photograph, flat vector UI, cartoon network style, neon oversaturation, rainbow palette, lens flare clutter, visible brand logos, gibberish signage, floating user interface elements, isometric clean-white mockup look
size: 3840x2160
aspect: 16:9
style: editorial-illustration
background: scene
variations: same composition, four lighting moods (V1-V4) — seed the dusk plate first, then request lighting rematches rather than recomposing; pick whichever keeps the tiny human readable at 1920px preview width.
```

### V2 — Storm-Lit Pullback

```
POSITIVE: painterly-editorial concept key art, identical receding isometric-diorama pullback composition as the hero — hot aisle foreground with green #4FC46A LED combs and one amber #F2B133 rack, containment glass mid-ground, exit door, campus exterior beyond — but struck by night storm light: a lightning moment freezes the whole depth-stack in cold white-blue #6FB6FF edge-light, hard rim on every cable plume and rack corner, rain streaking the far exterior where the sky is charcoal charcoal-violet without hue pollution, wet asphalt courtyard reflecting the building's clerestory glow in long vertical smears, one warm amber window defying the storm. Interior stays practically lit — the storm reads through the glass and door, not inside. A single silhouetted figure paused mid-stride under the door awning. Heavy atmosphere: barometric haze, deep shadows holding detail, industrial materials believable — concrete, galvanized steel, raised floor tiles. Muted dominant palette, storm contrast as the only drama. No text, no letters, no numbers, no watermark, no UI captions.
NEGATIVE: photoreal photograph, flat vector UI, cartoon style, neon purple storm cliché, rain inside the building, lightning bolts shaped like symbols, gibberish text on signage, oversaturated teal-orange grade
size: 3840x2160
aspect: 16:9
style: editorial-illustration
background: scene
variations: request 2-3 storm seeds; pick the one where the rim-light still leaves the aisle LED combs legible as rows of green points — atmosphere must not eat the state colors.
```

### V3 — Generator-Emergency Amber

```
POSITIVE: painterly-editorial concept key art, the hero pullback composition during a power event: in the near hot aisle, most rack LED combs have gone dark grey #8A929C, but a descending wave of amber #F2B133 glow is climbing back on, rack by rack, in dependency order toward the camera; the containment glass mid-ground glows copper #C97A45 from a diesel-generator wash outside, warm and mechanical; the exit door stands open on the loading bay where a generator exhaust shimmers in heat-haze readable as an orange thermal lens #F0862E only in that one zone; green exit signs and green EPO-button covers are the only cold certainties; one tiny figure stands at the main panel with a flashlight, beam knife-cutting the aisle haze. The story is the moment of recovery, not catastrophe — competence, procedure, the hum coming back in steps. Practical lights only: batteries, engines, LEDs; no moonlight heroics. Deep shadows, industrial grit, cable plumes overhead catching the amber in underlight. Muted palette with amber dominant by state logic. No text, no letters, no numbers, no watermark, no UI captions.
NEGATIVE: disaster-movie fireball, smoke filling rooms, sparks, explosion, flooding, photoreal news photo, apocalyptic orange sky everywhere, panic figures, visible error text, UI overlays
size: 3840x2160
aspect: 16:9
style: editorial-illustration
background: scene
variations: the recovery-wave gradient across racks is the pick point — request seeds until the dark-to-amber transition reads as an ordered wave, not random dead pixels; must survive greyscale check.
```

### V4 — Calm Blue 2026

```
POSITIVE: painterly-editorial concept key art, the hero pullback composition in its modern-era calm: the near hot aisle is a clean 2026 machine room — rounded-duct containment, glass doors with soft cyan #35E0E6 edge lighting, every rack comb uniformly green #4FC46A, zero amber anywhere, floor like dark polished slate reflecting cool light in long soft columns; past the containment glass a network operations lounge with curved monitors washing a single relaxed operator's face in monitor-glow, coffee at hand, posture of total boredom-as-mastery; the exit door is propped open to a blue-hour campus courtyard, string lights, planters, a bicycle leaning on the wall — the building at peace; the sky outside is a serene deep blue gradient to horizon teal. Cool dominant palette with one warm island (the lounge lamp) so the frame never reads as a fridge. Fixed-angle miniature clarity, tilt-shift on the far campus, generous negative space in the upper third for typesetting. Modern but lived-in: cable combs tidy but present, one stickered laptop lid. No text, no letters, no numbers, no watermark, no UI captions.
NEGATIVE: sterile Apple-store white void, cyberpunk clutter, flying cars, holographic UIs, amber alert lights, storm weather, photoreal corporate render, lens flare spam
size: 3840x2160
aspect: 16:9
style: editorial-illustration
background: scene
variations: generate a companion 2:3 crop-safe variant (regenerate with the campus compressed vertically) for store capsules; keep upper third clear of bright elements in every seed.
```

---

**PICK CRITERIA:** all four are the SAME composition — the set wins only if a viewer recognizes it as one camera across lighting changes (lay thumbnails side by side; the aisle→glass→door→campus depth order must be instantly traceable). Greyscale pass: the depth-stack must separate into four readable value zones at 25% luminance compression. Thumbnail Test at 128px: the tiny human figure must still be findable — scale-against-cathedral is the promise, and if the figure vanishes the shot is about a building, which is the wrong promise (§8.17: competence under pressure, at night, alone). Quiet Frame Test: V4 must contain zero alert states — a hero shot that looks like an incident contradicts the arc's destination (boredom as highest achievement, §0.5).
