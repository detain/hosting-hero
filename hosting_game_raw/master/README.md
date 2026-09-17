# master/ — `hosting_game.md` split by category

Split of the wave-2 merged document (2.21 MB, 3,440 named idea entries) into
per-category files, laid out to mirror `../opencode/` so the two documents can be
compared or cross-merged file by file.

## File mapping

| file | source in monolith | opencode counterpart |
|---|---|---|
| `00-foundations.md` | §0.1, §0.4, §0.5, §0.6 + original TOC (appendix) | *(none — additive)* |
| `01-levels-scenarios-and-progression.md` | §1 minus §1.3 | `01-levels-scenarios-and-progression.md` |
| `02-hosting-types.md` | §0.2 + §0.3 + §1.3 | `02-hosting-types.md` |
| `03-threats.md` | §2 | `03-threats.md` |
| `04-customers-traffic-and-clients.md` | §3 | `04-customers-traffic-and-clients.md` |
| `05-buildables-services-and-infrastructure.md` | §4 | `05-buildables-services-and-infrastructure.md` |
| `06-unlocks-and-discovery.md` | §5 | `06-unlocks-and-discovery.md` |
| `07-economy-money-and-scoring.md` | §6 | `07-economy-money-and-scoring.md` |
| `08-core-gameplay-mechanics.md` | §7 | `08-core-gameplay-mechanics.md` |
| `09-visuals-and-presentation.md` | §8 | `09-visuals-and-presentation.md` |
| `10-anything-else-modes-twists-humor-meta.md` | §9 | `10-anything-else-modes-twists-humor-meta.md` |

## Numbering

**Filenames follow opencode's ordering; internal `§N.M` numbering is unchanged.**
The document contains many inline cross-references (`§2.12`, `§9.11`, …); renumbering
headings to match the filenames would have invalidated all of them. So inside the
files, threats are still §2 even though the file is `03-threats.md`. The table above
is the bridge. Beware the off-by-one when comparing against opencode.

## Heading conventions differ between the two trees

| | `master/` (this dir) | `opencode/` |
|---|---|---|
| `#` | category | *(unused)* |
| `##` | numbered subsection (`## 2.12 Type-specific threats`) | category |
| `###` | **an individual idea entry** (3,440 of them) | subsection |
| `####` | rare | contradiction markers (`— *CONFLICTING*`) |

A `###` means different things in the two trees. Any tooling that walks headings
must account for this.

## Contradiction handling differs

- `master/` — inline `⚔️ Tension:` notes, plus a closing tensions list in §9.13.
- `opencode/` — inline `#### … — *CONFLICTING*` headings (~30), plus a
  "Cross-Cutting Contradictions Needing Rulings" block at the end of file 10.

## Known content gaps vs opencode

Hosting types present in `opencode/02-hosting-types.md` but absent or thin here:
Quantum compute time-sharing, VDI / virtual desktop, LLM inference API, fiber ISP
(GPON) — absent entirely. SCADA/OT, subsea landing station, dark-fiber transit
wholesaler, container registry — present but thin.

Conversely `master/` is heavier on: denial-of-wallet cost attacks (§2.21), HUD
attacks (§2.22), overcorrection threats (§2.23), financing instruments (§6.11),
restricted cash / balance sheet (§6.13), baseline tuning numbers (§6.16), the
written simulation loop (§7.13), the commercial board (§7.15), production asset
spec (§8.16), and the visual-coverage audit (§8.18).

## Provenance

`../.prev_wave1_backup.md` is the pre-wave-2 document. `../.merge2/` holds the
per-category section files the wave-2 merge agent produced. Raw per-agent reports
are `../wave{1,2}_{lens}_{fresh,informed}.md`.
