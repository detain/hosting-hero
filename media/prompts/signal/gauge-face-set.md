# Gauge face set — one bezel × five faces × two eras

<!-- spec: hosting_game.md §8.2 Instrument Design Language (ONE bezel, exactly 5 faces:
     needle/bar/waterline/oscilloscope/counter; unit stamp, nominal band, threshold mark, ghost
     trace; alarm = thickened threshold + alert hue + bezel inner rule; at nominal instruments are
     STILL; stroke weight = certainty), §8.10 (the same tokens re-skin the bezel — every gauge
     changes era for free), era tokens from apps/proto/src/chrome/styles/era-tokens.css -->

The HUD's whole instrument family lives inside ONE physical bezel; only the face swaps, and era
changes only face + corner-radius + surface + accent. These sheets are reference art for vector
authors and docs — generated on scene backgrounds (they are illustrations of a sheet, not keyed
sprites), except V4 which keys the bare faces for engine use. Every face must show the four
permanent affordances: a nominal band, a threshold mark, a ghost trace of the recent past, and a
blank unit-stamp field (the stamp text is in-engine).

### V1 — the 2026 family sheet (one bezel, five faces)

```
POSITIVE: clean flat vector reference sheet on a deep blue-black panel background (hex #0D131C),
showing the SAME rounded-square instrument bezel (12px soft corner radius, thin brushed-graphite
frame, subtle inner rule line) five times in a row, each housing a different gauge face in modern
minimal telemetry style: (1) a needle dial with a highlighted nominal arc band and a thickened
threshold tick, (2) a horizontal bar meter with a translucent nominal window and a small ghost tick
trail, (3) a vertical liquid-column waterline gauge with the fluid settled mid-height, a projected
future level shown as a thin dashed ghost line above it, and a threshold notch, (4) an
oscilloscope face with a live thin cyan (hex #35E0E6) waveform trace plus a dimmer faded ghost
waveform behind it, (5) a digit-roll counter face with blank segmented windows (unlit empty
segments, no numerals); everything calm and STILL because at nominal instruments do not animate;
accent cyan used sparingly, nominal bands in muted green-grey, threshold marks in pale bone; crisp
1px linework, unlit annotation layer style, generous margins, high greyscale contrast, no text, no
letters, no numbers, no watermark, no UI captions
NEGATIVE: text, letters, numbers, watermark, photorealism, skeuomorphic chrome, gradients, glow
bloom, clutter, tick labels, needle in alarm position, rainbow palette
size: 2048x1024
aspect: 2:1
style: vector
background: scene
variations: generate 4, pick the sheet where all five faces visibly share one bezel cast — the
whole system depends on "same body, different face"
```

### V2 — the 1998 amber CRT family sheet

```
POSITIVE: flat vector reference sheet of the SAME five instrument faces as a 1998 terminal-era skin
— identical layout and bezel geometry to its modern sibling but re-tokened exactly four ways:
corners hard 0px right-angled brushed-steel plate with visible screws, dark charcoal surface
(hex #171D24), amber phosphor accents (hex #F2B133) replacing cyan, and an overall monospace
terminal aesthetic: (1) needle dial with amber nominal arc, (2) chunky segmented bar meter half-lit
amber, (3) waterline column with amber fluid and a dashed ghost level, (4) oscilloscope with a
glowing amber trace and faint scanline texture over the glass only, (5) mechanical flip-digit
counter window left blank; one faint CRT curvature highlight on the oscilloscope glass; otherwise
flat, crisp, unlit, calm and still at nominal, greyscale-legible by shape, no gradients elsewhere,
no text, no letters, no numbers, no watermark, no UI captions
NEGATIVE: text, letters, numbers, watermark, photorealism, heavy bloom, rainbow, rounded corners,
modern flat-design minimalism, animated blur, beige plastic frame
size: 2048x1024
aspect: 2:1
style: vector
background: scene
variations: generate 4; the test is the token discipline — a viewer must say "same gauges, older
era", not "different gauges"; reject any pick that redesigned layout
```

### V3 — alarm-state and certainty study

```
POSITIVE: flat vector study sheet on a deep blue-black background (hex #0D131C), two columns by
three rows showing one needle-instrument bezel in graded states, modern minimal style with rounded
12px bezel: row one compares three STROKE WEIGHTS of the same needle trace — hairline faint for an
inferred reading, normal for measured, heavy solid for verified — all else identical; row two shows
the alarm escalation on the same face: calm nominal, then warning with the threshold tick visibly
thickened and a single amber (hex #F2B133) pip marker, then full alarm with the bezel's inner rule
line lit alert-red (hex #E23B3B) and the needle pinned past the thickened mark; ghost traces
present in every cell as a faint offset duplicate; absolute stillness in composition — no motion
blur anywhere; crisp 1px construction lines, greyscale pass-safe because state rides on stroke and
shape changes too, no text, no letters, no numbers, no watermark, no UI captions
NEGATIVE: text, letters, numbers, watermark, glow storm, shake blur, gradient fills, skeuomorphic
metal, rainbow, cluttered ticks
size: 1536x1024
aspect: 3:2
style: vector
background: scene
variations: generate 3; verify the three stroke-weight cells are orderable by "how sure is this
instrument" with colour drained — that ordering is the spec's certainty law
```

### V4 — bare face inserts keyed for the engine

```
POSITIVE: sprite sheet of five bare instrument faces with NO bezel on a flat solid magenta #FF00FF
background, crisp flat vector, each face drawn as a self-contained square module with transparent-
feeling negative space: needle dial arc, horizontal bar track, vertical waterline column,
oscilloscope grid with a single cyan (hex #35E0E6) trace, and a blank segmented counter window;
all five in the modern 2026 token set — rounded geometry, dark charcoal faceplates (hex #0D131C
fill inside each module), amber (hex #F2B133) threshold marks, muted nominal bands; identical
module sizes and baselines so they can be dropped into one bezel frame in-engine; flat unlit, hard
edges, absolutely no glow, no shadows onto the magenta, wide even gaps, no text, no letters, no
numbers, no watermark, no UI captions
NEGATIVE: text, letters, numbers, watermark, photorealism, bezel frames, drop shadows, gradients,
glow, rounded outer container, decorative detail
size: 2048x1024
aspect: 2:1
style: vector
background: magenta-key
variations: generate 4; key-test the sheet: any module whose edge bleeds magenta halo gets cut and
reseeded alone
```

---

**PICK CRITERIA:** the two era sheets must be provably the SAME instruments (4-token rule — layout
never changes, §8.10); every face ships nominal band + threshold mark + ghost trace + blank unit
stamp (§8.2 instrument law); alarm reads in greyscale via shape/stroke channels (Two-Channel Law).
