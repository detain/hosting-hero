# Docs-Hero — Era Crossfade (same building, 1998 → 2026)

<!-- spec: hosting_game.md §8.10 era kits + Era Transition Animation, chrome/era-tokens.css (1998 amber/radius-0/VT323 vs 2026 cyan/radius-12/Space Grotesk), §8.4 cable archaeology, MASTER_REPORT §4.7 -->

Cover for time-as-palette: one camera, one building, two decades bleeding into each other mid-crossfade, old matter surviving the transition. 3 variations.

---

### V1 — The crossfade boundary

```
POSITIVE: editorial illustration, isometric diorama DNA, of a single server room caught mid-time-transition along a vertical seam that sweeps left to right across the frame: on the passed left side the year 1998 renders complete — yellowing beige plastic machines with floppy bays and chunky turbo switches on tall wire shelving, blue and amber CRT monitors glowing warm under a curved glass, ribbons of grey coax and coiled phone-cord handsets, a corkboard with blank pinned cards, a boxy printer the size of a dishwasher, cream cinderblock walls, a faint cigarette burn on the linoleum, the whole corner warmly lit by a single hanging bulb, the air still; on the coming right side the same room in 2026 renders complete — matte black mesh-front racks on sealed tile, cyan and green LED points in disciplined rows, aqua fiber bundles thick as forearms snaking into overhead trays, liquid-cooling manifolds with two quick-disconnect hoses, a slim ultrawide wall glowing cool, dark polished concrete, the same window in the same position letting in the same weather; the vertical seam between them is the star: a soft gradient band where the eras blend — a beige rack mid-dissolve into a black rack, a coiled phone cord straightening into a fiber jumper, CRT amber bleeding into cyan edge-light, and crucially the relics that survive the transition already visible on the future side: a single beige patch panel and one length of faded Cat5 preserved in the modern hall, dust and stickers intact, proving the room is continuous, not replaced; no humans; the crossfade is a slow held camera with only the room aging; mood: nostalgia and progress in one long room, memory preserved; palette warm amber-beige on the left, cool cyan-black on the right, hard readable silhouettes, must survive greyscale, no text, no letters, no numbers, no watermark, no UI captions.
NEGATIVE: text, letters, numbers, readable labels, brand logos, dates on screen, watermark, UI captions, photorealism, cluttered mess, both eras identical, a person in frame, motion blur, the old stuff fully gone on the right.
size: 3072x1728
aspect: 16:9
style: editorial-illustration
background: scene
variations: generate 4 — the seam must show at least one same-position pair (beige rack to black rack, cord to fiber) and the right side must retain visible 1998 relics or it fails the continuity law.
```

### V2 — Same rack, thirty years of wear

```
POSITIVE: editorial macro illustration, isometric diorama DNA, of one rack slot's life across eras as four vertical filmstrip cells sharing the same framing: cell one, 1996, a fresh beige machine with a crisp blue LED sliding into a bare wire shelf on cinderblock, one clean coiled console cable, nothing else; cell two, 2004, the same slot now black steel with a pizza-box server, beige and blue Cat5 strata added to a new overhead tray, an amber CRT monitor on a crash cart beside it, a first yellowing asset tag appearing; cell three, 2014, hot-aisle curtain and plastic door added, orange and aqua fiber joining the tray, a second mismatched replacement panel installed, a small scorch mark low on the rail, more blank stickers; cell four, 2026, a modern mesh-black node with twin coolant hoses and cyan optics, the tray now dense, and still present in the new rack's shadow the original beige machine on top of the shelf, the same mismatched panel, and a cable repaired mid-run with a violet sleeve — the scars and the old-timer persisting into the new era so the rack is a family tree you can read; the four cells aligned by a single vertical power-cord that grows thicker, gets a second redundant partner, then a copper branch across time; palette aging warm to cool down the strip, hard readable silhouettes, must survive greyscale, no text, no letters, no numbers, no watermark, no UI captions.
NEGATIVE: text, letters, numbers, date captions, watermark, UI captions, photorealism, four unrelated rooms, old equipment vanishing by 2026.
size: 2448x1632
aspect: 3:2
style: editorial-illustration
background: scene
variations: generate 3 — the through-line power cord and the persisting relics are the continuity proof; a viewer should feel thirty years in one column.
```

### V3 — The window, both centuries

```
POSITIVE: editorial illustration, isometric diorama DNA, centered on the one permanent window in a server room, the only opening to weather, split top and bottom by era so the same glass shows two times at once: below the sill the 1998 room glows amber — CRT light on beige plastic, a coiled telephone handset on a wall mount, a blank pinned corkboard, dust motes in a hanging bulb's cone, the linoleum worn; above and through the window the glass itself carries a memory of the future bleeding down — a reflection of black mesh racks, a cyan strip-light, and an aqua fiber bundle crossing where a beige coax used to, as if 2026 is developing in the glass while the room below still hums on a modem; outside the window a single continuous sky turns from a warm 1998 dusk to a cool 2026 night in one vertical gradient, the same tree silhouette outside losing its leaves across the two halves; the meeting line at the sill is soft, the two palettes seeping into each other, one length of cable descending from the future-reflection through the sill and becoming a real coiled cord in the past-room below, the loop closed; no people, the room lit only by its own equipment; mood: time passing inside one kept room, memory and forecast sharing a window; hard readable silhouettes, must survive greyscale, no text, no letters, no numbers, no watermark, no UI captions.
NEGATIVE: text, letters, numbers, watermark, UI captions, photorealism, hard split with no blend, different windows, people, clocks, the future side erased.
size: 2448x1632
aspect: 3:2
style: editorial-illustration
background: scene
variations: generate 3 — the one cable descending from the future reflection through the sill and becoming a cord in the past is the single poetic object; the tree outside must be the same tree in both seasons.
```

---

**PICK CRITERIA:** §8.10's law is that the crossfade is held-camera aging with survivors — old cables and stickers REMAIN after transition; any pick where 2026 has replaced rather than absorbed 1998 fails; the two shipped era token sets (amber/radius-0 vs cyan/radius-12) should read as palette + corner-rounding, layout identical; greyscale pass.
