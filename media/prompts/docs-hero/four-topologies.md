# Docs-Hero — Four Topologies (the graph-is-map, layered city)

<!-- spec: hosting_game.md §4.3 graph-is-map + 4 topologies, docs/GLOSSARY.md graph-is-map / LinkObject, §8.4 power tree copper / trust / control channels, topology MultiGraph 4 relations -->

Cover for "the map is a graph and the graph is four maps": data, power, control and trust overlaid as translucent city layers. 3 variations.

---

### V1 — The layered city

```
POSITIVE: editorial illustration, isometric diorama DNA, of one facility drawn as four stacked translucent graph layers hovering in precise registration over a single muted server hall, like an exploded architectural model: the bottom layer is the real room in matte concrete and steel, racks as dense alive blocks lit by their own sparse green LEDs; lifted directly above it and aligned node-for-node, the data layer — cyan edges snapping between machines in busy mesh-and-star patterns, a couple of bright trunk pipes carrying dense bead traffic while thin access threads fan to individual racks; above that the power layer rendered exclusively in copper — a strictly treelike branching circulatory structure from a single fat utility trunk that splits to substations, ATS twins, UPS banks, then PDU strips feeding each rack, one breaker gap opened so a whole downstream branch has gone dark copper while its data edges above still glow, a visible lie the layering exposes; above that the control layer in white dashed lines — sparse authoritative loops from consoles out to management ports, every dashed edge deliberate and low-traffic; and at the top the trust layer in a violet-to-green tint — edges that mean authorization and dependency, a dense clique around shared storage, a lonely node whose only trust edge is cut, marked with a small hollow ring; the four layers share identical node positions so vertical drop-lines could be drawn between them, and one rack in the center carries a node in every layer at once, the most connected citizen in the building; mood: the graph that is secretly the building; palette cyan copper white and muted violet over steel, hard readable silhouettes, must survive greyscale, no text, no letters, no numbers, no watermark, no UI captions.
NEGATIVE: text, letters, numbers, layer legends with writing, watermark, UI captions, photorealism, layers misaligned, tangled spaghetti with no distinct structure per layer, rainbow.
size: 3072x1728
aspect: 16:9
style: editorial-illustration
background: scene
variations: generate 4 — each layer must be distinguishable by its own edge grammar (mesh, tree, sparse dashed, clique) as much as by color.
```

### V2 — Four plates, one building

```
POSITIVE: editorial plate illustration, isometric diorama DNA, four square blueprint panels arranged in a two-by-two grid, each showing the identical facility room from the identical high corner, each panel revealing only one of the four graphs that share its nodes: the top-left panel is the data graph drawn as confident cyan edge-work over a barely-sketched ink-blue room, a clear backbone with leaf accesses; top-right the power graph in copper, unmistakably a tree with a root, mid-level switchgear and terminal leaves, no cycles, one branch drawn broken with the dark downstream; bottom-left the control graph in white dashed lines, the sparsest layer, consoles touching management ports in short authoritative hops; bottom-right the trust graph in a violet-to-green wash, showing clusters and a severed edge with a hollow ring where confidence died; between the four panels the same physical rack positions act as a registration lattice so the eye can watch one machine exist four ways by moving eye to eye; the panels are flat, precise, instrument-plate crisp on matte paper-blueprint ground, the room beneath each drawn so lightly it nearly disappears; mood: a surveyor's honest four-plate drawing of one invisible city; hard readable silhouettes, must survive greyscale, no text, no letters, no numbers, no watermark, no UI captions.
NEGATIVE: text, letters, numbers, panel titles, watermark, UI captions, photorealism, one panel cluttered with all four graphs, identical edge patterns across panels.
size: 2448x1632
aspect: 3:2
style: editorial-illustration
background: scene
variations: generate 3 — the four graphs must have genuinely different topologies, and a reader should be able to tell which panel is power purely by its treeness.
```

### V3 — The node that lives in all four

```
POSITIVE: editorial macro illustration, isometric diorama DNA, one rack isolated at the center of a deep ink-blue field, and the four graphs seen purely as it experiences them, radiating from its four faces: from its front the data edges leave as several cyan cables in a tight professional fan, one thick and beaded with traffic, two thin and idle; from its rear the copper power tree descends in exactly two feeds — dual-corded and honest — one bright and loaded, one dimmer standing by, joining upward into a branching trunk; from its top a single white dashed control leash lifts away to an implied console beyond frame, calm and authoritative; from its side the trust web attaches as delicate violet-green filaments, most of them knotted to a glowing shared-storage neighbor, one filament cleanly cut and ending in a small hollow ring that softly refuses to reconnect; the rack itself is sober matte diorama, dense and alive, a green breathing pulse on its faceplates, and where each graph touches it the socket type matches the layer, so the grammar is consistent with the port vocabulary; the composition reads like an anatomy study of a citizen of four countries at once; hard readable silhouettes, must survive greyscale, no text, no letters, no numbers, no watermark, no UI captions.
NEGATIVE: text, letters, numbers, watermark, UI captions, photorealism, symmetrical identical edges per layer, power shown as a mesh, trust shown as bright primary colors.
size: 2448x1632
aspect: 3:2
style: editorial-illustration
background: scene
variations: generate 3 — layer-socket consistency (cyan trapezoids for data, copper kettle for power, white circle console, violet slot for trust) is the reward for attentive viewers.
```

---

**PICK CRITERIA:** a reader must grasp graph-is-map AND four-distinct-relations in one look; edge grammars differ (mesh/tree/dashed/clique); power is a tree with no cycles anywhere, including the cut branch; greyscale pass.
