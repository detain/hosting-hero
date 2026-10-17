/**
 * `coopSeatView` pure display law (lane L-THIN) — node env, zero DOM.
 * The rows are the browser thin-client's honest reading of the hub's fog
 * rider (ADR-0017 #7's named owe): code-unit sorted, encoding-typed,
 * null-preserving, existence-absent. Every "honest posture" here is a
 * falsifiable pin — a fabricated zero, a hidden count, or a re-scaled Fixed
 * reddens exactly one test.
 */
import { describe, expect, it } from "vitest";
import { asEntityId, observedKey, ResolutionBand } from "@hh/sim-core/types";
import type { ObservedCell, ObservedKey } from "@hh/sim-core/types";
import { SEAT_VIEW_NO_RIDER_NOTE, seatViewRows, seatViewState } from "../coopSeatView";

const EDGE = asEntityId("edge");
const EDGE2 = asEntityId("edge2");
const ORIGIN = asEntityId("origin");

function cell(
  value: bigint | number | string | null,
  status: ObservedCell<unknown>["status"] = "live",
  freshnessUs: bigint = 0n,
  certainty: bigint = 65_536n,
): ObservedCell<unknown> {
  return Object.freeze({
    value,
    fidelity: ResolutionBand.Fine,
    freshnessUs,
    coverage: 65_536n,
    certainty,
    status,
  });
}

type ScopedView = Map<ObservedKey, ObservedCell<unknown>>;

/* ─────────────────────────── the row law ─────────────────────────── */

describe("seatViewRows — encoding, value, sort", () => {
  it("a decoded bigint cell reads as fixed with its exact decimal string (the WireUs revival)", () => {
    const view: ScopedView = new Map([[observedKey(EDGE, "rho"), cell(3277n)]]);
    expect(seatViewRows(view)).toEqual([
      {
        key: "edge::rho",
        encoding: "fixed",
        value: "3277",
        status: "live",
        freshnessUs: "0",
        certainty: "65536",
      },
    ]);
  });

  it("number cells read as int, string cells as text", () => {
    const view: ScopedView = new Map([
      [observedKey(EDGE, "state"), cell("degraded")],
      [observedKey(EDGE, "count"), cell(42)],
    ]);
    const rows = seatViewRows(view);
    // insertion order (state, count) re-sorts code-unit: "edge::count" < "edge::state"
    expect(rows.map((r) => r.encoding)).toEqual(["int", "text"]);
  });

  it("null value SURVIVES as a row — nothing, not zero (§4.1 R-66)", () => {
    const view: ScopedView = new Map([[observedKey(EDGE, "probe"), cell(null, "unknown")]]);
    const [row] = seatViewRows(view);
    expect(row?.value).toBeNull(); // never "0", never dropped
    expect(row?.encoding).toBe("none"); // a null cell has no recoverable encoding — "none" is the honest label
    expect(row?.status).toBe("unknown");
  });

  it("huge bigints keep every digit (no float rescaling in a display module)", () => {
    const view: ScopedView = new Map([[observedKey(EDGE, "money"), cell(10n ** 30n)]]);
    expect(seatViewRows(view)[0]?.value).toBe("1000000000000000000000000000000");
  });

  it("freshnessUs and certainty cross as decimal strings, verbatim", () => {
    const view: ScopedView = new Map([[observedKey(EDGE, "rho"), cell(1n, "stale", 90_000_000n, 32_768n)]]);
    const [row] = seatViewRows(view);
    expect(row).toMatchObject({ freshnessUs: "90000000", certainty: "32768", status: "stale" });
  });

  it("rows are code-unit sorted by key — Map insertion order is NOT a display fact", () => {
    const forward: ScopedView = new Map([
      [observedKey(EDGE, "rho"), cell(1n)],
      [observedKey(EDGE2, "rho"), cell(2n)],
    ]);
    const reversed: ScopedView = new Map([
      [observedKey(EDGE2, "rho"), cell(2n)],
      [observedKey(EDGE, "rho"), cell(1n)],
    ]);
    // Code-unit truth: 'edge2::rho' < 'edge::rho' because '2' (0x32) < ':' (0x3A) —
    // a locale-flavoured sort would order them the other way.
    expect(seatViewRows(forward).map((r) => r.key)).toEqual(["edge2::rho", "edge::rho"]);
    expect(seatViewRows(reversed)).toEqual(seatViewRows(forward)); // insertion-order independent
  });

  it("every row and the row array are frozen (the column cannot be written by a template)", () => {
    const view: ScopedView = new Map([[observedKey(EDGE, "rho"), cell(1n)]]);
    const rows = seatViewRows(view);
    expect(Object.isFrozen(rows)).toBe(true);
    expect(Object.isFrozen(rows[0])).toBe(true);
  });

  it("a row carries EXACTLY the six display fields — no coverage, no fidelity, no hidden count (law 2: absence including existence)", () => {
    const view: ScopedView = new Map([
      [observedKey(EDGE, "rho"), cell(1n)],
      [observedKey(ORIGIN, "rho"), cell(2n)],
    ]);
    for (const row of seatViewRows(view)) {
      expect(Object.keys(row).sort()).toEqual([
        "certainty",
        "encoding",
        "freshnessUs",
        "key",
        "status",
        "value",
      ]);
    }
  });
});

/* ───────────────────────── the honest-posture law ───────────────────────── */

describe("seatViewState — null posture, empty rider, determinism", () => {
  it("view === null renders the literal no-rider state — no rows key exists to fabricate into", () => {
    const state = seatViewState(null);
    expect(state).toEqual({ present: false });
    expect(Object.keys(state)).toStrictEqual(["present"]); // the shape itself is the law
    expect(JSON.stringify(state)).toBe('{"present":false}');
  });

  it("the no-rider state is a shared frozen identity (Vue computeds re-run; nothing must stay byte-stable nothing)", () => {
    expect(seatViewState(null)).toBe(seatViewState(null));
    expect(Object.isFrozen(seatViewState(null))).toBe(true);
  });

  it("the no-rider SENTENCE is the module's export, not a paraphrase (mount pin asserts these words)", () => {
    expect(SEAT_VIEW_NO_RIDER_NOTE).toContain("hub sends no rider");
  });

  it("a rider with ZERO cells is present-and-empty — a different fact from no rider at all", () => {
    const present = seatViewState(new Map());
    expect(present).toEqual({ present: true, rows: [] });
    expect(present).not.toEqual(seatViewState(null)); // the two nothing-states never melt
  });

  it("out-of-scope absence is total: no row, no count, no marker (the leak the projection withheld stays withheld)", () => {
    const aliceView: ScopedView = new Map([[observedKey(EDGE, "rho"), cell(1n)]]);
    const state = seatViewState(aliceView);
    expect(state.present).toBe(true);
    if (state.present) expect(state.rows.map((r) => r.key)).toStrictEqual(["edge::rho"]);
    // the word "origin" (a REAL key the hub withheld from this seat) appears nowhere in the rendered state:
    expect(JSON.stringify(state)).not.toContain("origin");
  });

  it("the same content twice produces byte-equal states (the determinism law at the display boundary)", () => {
    const build = (): ScopedView =>
      new Map([
        [observedKey(ORIGIN, "rate"), cell(7)],
        [observedKey(EDGE, "rho"), cell(3277n, "stale", 5n)],
      ]);
    expect(JSON.stringify(seatViewState(build()))).toBe(JSON.stringify(seatViewState(build())));
  });
});
