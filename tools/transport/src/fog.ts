/**
 * `tools/transport/src/fog.ts` — observed_view(seat) over the wire.
 *
 * The co-op NOC rule "no player may ever see the whole board" is an ENGINE
 * invariant, not a network filtering afterthought: sim-core/observed/view.ts
 * projects it (projectSeat), and this module only SERIALIZES a projection
 * that projection already produced. A seat receives PROJECTIONS, never the
 * store — the hub's projectionSource callback is the single place a host
 * decides what each scope sees, and the wire type cannot express more than
 * one seat's ScopedReadView.
 *
 * TransportCellWire is field-isomorphic to the proto ObservedCellWire (own
 * copy — transport imports sim-core subpaths only, never the app). The
 * drift pin in codec.test greps the proto SOURCE and reddens on any silent
 * shape divergence: a cell shape that drifts either LEAKS or MANGLES, and
 * both are bugs we want at the console immediately.
 *
 * Determinism law: cells are emitted code-unit-sorted by key — Map insertion
 * order is NOT a wire fact, so two stores holding equal cells encode byte-
 * equal no matter how they were filled.
 */

import { ResolutionBand } from "@hh/sim-core/types";
import type { ObservedCell, ObservedKey } from "@hh/sim-core/types";
import { projectSeat } from "@hh/sim-core/observed";
import type { ObservedStore, ScopedReadView, SeatScope } from "@hh/sim-core/observed";
import { TransportError } from "./codec.ts";
import type { SeatViewWire, TransportCellWire, CellEncoding } from "./envelope.ts";

/** view → wire: sort, map, freeze. bigint leaves (Fixed/SimTimeUs values)
 *  cross as decimal strings — the WireUs law of every hop in the house. */
export function encodeScopedView(view: ScopedReadView): SeatViewWire {
  const keys = [...view.keys()].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  const cells: TransportCellWire[] = keys.map((key) => {
    const cell = view.get(key) as ObservedCell<unknown>;
    const encoding: CellEncoding =
      typeof cell.value === "bigint" ? "fixed" : typeof cell.value === "number" ? "int" : "text";
    let value: number | string | null;
    if (cell.value === null) {
      value = null; // "nothing, not zero" (R-66) — null survives the hop as null
    } else if (encoding === "fixed") {
      value = (cell.value as bigint).toString();
    } else if (encoding === "int") {
      value = cell.value as number;
    } else if (encoding === "text") {
      if (typeof cell.value !== "string") {
        throw new TransportError("bad-field", `view(${key}).value`, "bigint | number | string | null cell value", cell.value);
      }
      value = cell.value;
    } else {
      throw new TransportError("bad-field", `view(${key}).value`, "bigint | number | string | null cell value", cell.value);
    }
    return Object.freeze({
      key,
      encoding,
      value,
      fidelity: cell.fidelity,
      freshnessUs: cell.freshnessUs.toString(),
      coverage: cell.coverage.toString(),
      certainty: cell.certainty.toString(),
      status: cell.status,
    });
  });
  return Object.freeze({ cells: Object.freeze(cells) });
}

/** wire → view: the boundary parse already validated every field (codec
 *  walls — encoding literals, finite ints, ResolutionBand 0..4); this only
 *  re-attaches the types JSON made impossible (bigint) and rebuilds the map
 *  in the SAME sorted order it arrived. */
export function decodeScopedView(wire: SeatViewWire): ScopedReadView {
  const view = new Map<ObservedKey, ObservedCell<unknown>>();
  for (const cell of wire.cells) {
    const key = cell.key as ObservedKey;
    let value: bigint | number | string | null;
    if (cell.value === null) {
      value = null;
    } else if (cell.encoding === "fixed") {
      value = BigInt(cell.value);
    } else if (cell.encoding === "int") {
      value = cell.value;
    } else {
      value = cell.value as string;
    }
    view.set(key, Object.freeze({
      value,
      fidelity: cell.fidelity as ResolutionBand,
      freshnessUs: BigInt(cell.freshnessUs),
      coverage: BigInt(cell.coverage),
      certainty: BigInt(cell.certainty),
      status: cell.status,
    }));
  }
  return view;
}

/** Convenience: project + serialize in one call (what a hub's
 *  projectionSource callback is expected to return for one seat). */
export function transportViewForStore(store: ObservedStore, scope: SeatScope): SeatViewWire {
  return encodeScopedView(projectSeat(store, scope));
}
