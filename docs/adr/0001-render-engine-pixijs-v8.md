# ADR-0001 — Render engine: PixiJS v8 (2.5D multi-layer compositor)

## Status
**Accepted 2026-10-06.** Ratified owner decision R-1; re-confirmed after the 2026-10-06 cost review with the Cinema-module clause and the two-face back-view law added (logged as correction **C13**). Not re-openable without owner action (§0 legend).

## Context
The world is an **isometric pixel diorama** with fixed ortho camera families. WS-7's honest read: thousands of instanced LEDs/motes, screen-space-thickness attachments, additive-emissive Flow compositing, ≤2% emissive masks, a global 0.5 Hz phase clock, grain, heat-tiles, label culling, and a runtime budget enforcer — "**every one of these is a 2D problem**" (§4.7). Three candidates existed (§4.7): (1) a Three.js hybrid world layer, (2) pure 2.5D PixiJS v8, (3) a three.js-leaning renderer fork (WS-2 DR-9). WS-7's own gate test was: *"if the World can be pure 2.5D (authored front/back sprite pairs instead of true rotation; Fold as a shader crossfade) → PixiJS v8 is the better engine."* The renderer must also stay behind the observed-layer boundary and enforce draw budgets (§3.1).

## Decision
Adopt **PixiJS v8** as the world renderer, structured as a **2.5D multi-layer compositor**: five hard-bounded, non-blending layers (`Substrate → Flow/Signal + Attachment → Intent → Annotation/Chrome`) under one shared world→screen camera transform, with the **Vue-DOM Chrome/Annotation layer** above it (§3.1, §4.7). **hybrid-three.js is REJECTED.** All other WS-7 render architecture is carried and adapted to Pixi.

**Kept unchanged from WS-7** (§2.2 R-1): the five-layer compositor; Hue Ledger (compile-time registry); Two-Channel Law; 0.5 Hz heartbeat; Screen Budget ≥66% world; **BudgetManager admission hooks** (the renderer must REFUSE over-budget draws); ObservedCell fidelity contract as the binding-layer data shape; instrument design language (exactly 5 faces); Five-Asset Skin Kit; era = 4 CSS tokens; Vue-DOM Chrome/Annotation layer; the full accessibility program (Readout Mode, One-Hand, sonified SR DOM, click-to-link floor).

## Consequences

**Four 3D verbs are consciously traded away** (§2.2 R-1):
1. *Orbit-selected-object* → replaced by the Z1–Z4 **altitude ladder** + the authored second face.
2. *True-3D rack back-rotation* → replaced by the **two-face back-view law** (below).
3. *Free-camera photo mode* → replaced by **2D camera + filter stack** (the Museum/Aquarium/export-screenshot budget line survives at 2D).
4. *3D cinematic money-shot* → replaced by 2D choreographed camera + dolly + layer-isolation sequences.

**Two-face back-view law (2026-10-06, C13)** (§2.2 R-1 #2): the authored front/back sprite sets are **CANONICAL** (not provisional) for the rack back-view verbs — the three actions only doable from the back view ship on them; a **flip-key swap** replaces the rotate gesture. Mechanics fully preserved; only the physical rotate gesture is replaced.

**The Fold** (Iron Board ↔ The Book) becomes a **shader crossfade + layout morph**, not a camera flight (§2.2 R-1). The Z4 "globe" rung renders as a flat world-map with drawn arcs; a true 3D globe is deferred to the Cinema module (§4.7 item 1.3).

**Accepted cost:** SVG's free hit-testing/focus/ARIA must now be **engineered inside Pixi** — hit-area + a parallel accessibility adapter (virtual focus manager + DOM proxy elements); WS-2 DR-9 is closed, the fork settled, the cost accepted and scheduled (§2.2 R-1, C4). Retained-mode interactive sprites for ports/beads plus an explicit a11y adapter; R30 (click-to-link equal status) stays non-negotiable (§4.2).

**Deferred clause — Cinema module (C13)** (§2.2 R-1): an offline 3D photo-studio / cutscene renderer (Three.js or Babylon) may ship post-launch as a **discrete, non-gameplay mode** built from observed-layer snapshots + seeded replay. Hard constraints: **no shared live camera with Pixi** (no dual-context tax in gameplay); **no gameplay-critical render may depend on true 3D**; it consumes **presentation data only**. Until it ships, the 2D substitutions above are the shipped behavior. See `docs/ARCHITECTURE.md §9`.

**Neutralized risk:** WS-2's "stack gamble — authoritative sim behind websockets makes Gate 4 feel wrong" is moot once the sim is local (§8 neutralized table); cable-drag latency becomes input latency, not network.

## Source
`MASTER_REPORT.md` §2.1 (R-1), §2.2 R-1 (consequences, traded verbs, two-face law, Cinema clause), §2.3 C4 / C13, §3.1 (layer stack), §4.2 (Pixi-adapted compositing), §4.7 (WS-7 render verdict, traded 3D verbs, Q1 closed), §8 (neutralized risks).
