# Docs-Hero — Blast Radius (the flood over the graph)

<!-- spec: hosting_game.md §8.4 blast preview grey+red-outline, docs/GLOSSARY.md blast radius = flood over TopologyGraph+DomainSet, FailureDomain co-residency hyperedge, Broken-N+1, MODULE-STATUS projection note -->

Cover for "one failure, honestly shown": a hovered rack whose true blast radius rises as a flood over the whole facility and its graph shadow. 3 variations.

---

### V1 — The flood map

```
POSITIVE: editorial illustration, isometric diorama DNA, of a consequence preview made physical: a normal muted server hall at rest, one rack in the left-middle hovered by a white dashed intent halo — and from that rack a translucent flood is rising across the floor like slow water, its leading edge a clean red outline that pools around every machine that would truly die if the hovered rack died: co-resident neighbors inside the same containment zone flood first, then the reach leaps visibly along shared dependencies — the same trunk switch, the same power circuit drawn as a glowing copper branch that darkens section by section downstream of a breaker gap, the storage array that backs them all; everything the flood touches is rendered matte grey with that single red outline, everything it misses stays in natural muted color and lit — the honest contrast between what you thought you were touching and what you were; the flood's surface catches a faint graph shadow beneath, nodes and hyperedges of the affected cluster sketched in ink-blue linework surfacing through the water like a map under glass; above the flooded zone floats one blank rounded badge shell with a hatched border where a Broken-N+1 warning would light; no alarms, no fire — this is calm foresight, the picture of responsibility; palette steel concrete with grey-red coverage, copper circuit veins, sparse cyan elsewhere, hard readable silhouettes, must survive greyscale, no text, no letters, no numbers, no watermark, no UI captions.
NEGATIVE: text, letters, numbers, count badges with digits, watermark, UI captions, explosion, fire, destruction already happened, photorealism, neon rainbow, flooding literal ocean water, chaos.
size: 3072x1728
aspect: 16:9
style: editorial-illustration
background: scene
variations: generate 4 — the flooded/grey set must form a legible shape with internal logic (rooms, circuits, dependencies), not a random blob.
```

### V2 — Domain fields held up to the light

```
POSITIVE: editorial illustration, isometric diorama DNA, of failure domains as translucent colored fields hung inside a real room: a wide isometric hall viewed from a high corner, and within it four soft boundary volumes float like glass terrariums nested and touching — the containment-row domain as a faint blue-tinted field, the power-circuit domain as a copper-tinted field that slices cleanly across two rows cutting one rack off from its neighbors, the shared-storage domain as a violet-tinted field that unexpectedly reaches three distant racks that looked unrelated, and around one single rack a tight grey shell, the whole-facility domain as the faintest warm field touching every wall; where the fields intersect their tints deepen so double-exposure machines — a rack in both the power field and the storage field — visibly carry two outlines; one hovered rack sends a red ripple boundary outward that reclassifies, machine by machine, which fields it belongs to; the base hall stays sober matte diorama, lit by its own equipment, the fields the only saturated thing in frame and even they are washed to near-transparency; mood: x-ray vision for consequence, a surgeon's planning image; hard readable silhouettes, must survive greyscale, no text, no letters, no numbers, no watermark, no UI captions.
NEGATIVE: text, letters, numbers, legend with writing, watermark, UI captions, photorealism, heavy opaque color blocks hiding the room, lasers, scanlines, sci-fi HUD.
size: 2448x1632
aspect: 3:2
style: editorial-illustration
background: scene
variations: generate 3 — intersections must be visible as deepened tints; the surprise insight is the storage field reaching across the room.
```

### V3 — The cable that was actually a bridge

```
POSITIVE: editorial close illustration, isometric diorama DNA, the intimate version of a blast radius: a single fiber strand has just been pulled from a patch panel, drawn large at Z1 crispness — and from the empty socket, instead of nothing, the consequence blooms: a fine red outline spreads along the fiber's full run as a glowing thread, crossing the aisle, climbing into a trunk switch whose port cluster dims one by one in sequence, forking there into three thinner red threads that each march to a different rack whose link LEDs blink out in a slow ripple, until in the soft-focus background an entire row has gone dark grey with only the red spread-map of threads visible on its face like veins; the unplugged strand itself dangles in the foreground with perfect catenary droop, its connector band a quiet aqua, a single desaturated mote falling from its tip; the rest of the room is normal, lit, alive — the drama is entirely the invisible structure suddenly made visible by one removal; mood: the moment you understand the graph was load-bearing; muted palette with the red spread the lone saturation, hard readable silhouettes, must survive greyscale, no text, no letters, no numbers, no watermark, no UI captions.
NEGATIVE: text, letters, numbers, watermark, UI captions, photorealism, sparks and fire, the whole room destroyed, rainbow cables, glowing arrow annotations.
size: 2448x1632
aspect: 3:2
style: editorial-illustration
background: scene
variations: generate 3 — the dimming sequence must read as ordered propagation (socket, trunk, forks, row), not simultaneous blackout.
```

---

**PICK CRITERIA:** the picture must teach "the true damage set is bigger and weirder than the object you touched" without any caption; domains/flood/threads follow real dependency logic; calm foresight tone, not disaster; greyscale pass.
