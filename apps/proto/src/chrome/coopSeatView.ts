/**
 * `apps/proto/src/chrome/coopSeatView.ts` — the pure display law for the
 * per-seat fog rider (ADR-0017 #7's named owe: "browser thin-client
 * consumption of the per-seat rider" — §9.1's asymmetric information, made
 * visible in the UI).
 *
 * Rows are built from `client.observed()` — the decoded `ScopedReadView` the
 * HUB chose for this seat (transport/fog.ts decodeScopedView) — NEVER from
 * the local ObservedStore. `state/observedStore.ts` is the SP read door (the
 * whole-estate projection of one browser's own sim); this module is the wire
 * read door (one seat's slice of a shared host world). Routing the rider
 * through the store would melt the two doors into one and make every leak
 * invisible by construction; the law "seats get PROJECTIONS, never the store"
 * is why this file exists separately and why CoopRoom renders it as its own
 * second column.
 *
 * Laws (each pinned in __tests__/coopSeatView.test.ts):
 *  1. HONEST NULL POSTURE — a seat whose hub sends no rider gets the
 *     `present: false` state, rendered as the literal sentence
 *     SEAT_VIEW_NO_RIDER_NOTE. No fabricated cells, ever.
 *  2. ABSENCE INCLUDING EXISTENCE (observed/view.ts projection law) — an
 *     out-of-scope key is not in the map, so it is not in the rows. Nothing
 *     here surfaces a hidden-count, a placeholder, or any other artifact that
 *     would tell a seat HOW MUCH it is not seeing; that would re-leak exactly
 *     what projectSeat withheld.
 *  3. NOTHING, NOT ZERO (§4.1 R-66) — a cell whose value is null keeps its
 *     row with `value: null` (the panel renders "?" downstream), never a
 *     fabricated 0 and never a dropped row.
 *  4. CODE-UNIT SORT — display order is a data law, not Map-insertion luck
 *     (the fog.ts determinism law re-asserted at the display boundary): the
 *     same content always renders the same rows, byte-order.
 *  5. RAW DISPLAY — values ride decimal strings exactly as the wire revived
 *     them (Fixed Q16.16 raw integers for certainty); no speculative
 *     rescaling in a display module. i18n posture: labels are visible-raw
 *     (disclosed — pack voices for this column are a content-lane follow-on).
 */

import type { ObservedCell } from "@hh/sim-core/types";
import type { ScopedReadView } from "@hh/sim-core/observed";

/** The encoding claim the DISPLAY side can honestly make about a decoded
 *  cell. The wire's own encoding label is not carried through
 *  ScopedReadView; for non-null cells it is fully determined by the value's
 *  runtime type (decodeScopedView's law: fixed→bigint, int→number,
 *  text→string). A null cell has no value to type, so the honest label is
 *  "none" — the cell exists in scope, and it says nothing. */
export type SeatViewEncoding = "fixed" | "int" | "text" | "none";

/** The closed status vocabulary of a fog cell (types.ts ObservedCell). */
export type SeatViewStatus = ObservedCell<unknown>["status"];

/** One visible cell of this seat's projection. Six fields, no more — a
 *  seventh (a count, a hidden-marker) would be the leak law 2 forbids. */
export interface SeatViewRow {
  readonly key: string;
  readonly encoding: SeatViewEncoding;
  /** Display string; null = "nothing, not zero" (law 3) — renders "?". */
  readonly value: string | null;
  readonly status: SeatViewStatus;
  /** Age of the last sample, decimal-string µs (raw, law 5). */
  readonly freshnessUs: string;
  /** Certainty, raw Fixed Q16.16 decimal string (65536 = 1.0). */
  readonly certainty: string;
}

export type SeatViewState =
  | { readonly present: false }
  | { readonly present: true; readonly rows: readonly SeatViewRow[] };

/** The literal sentence for the no-rider posture (law 1). Exported so the
 *  mount pin asserts the SAME words the law promises, not a paraphrase. */
export const SEAT_VIEW_NO_RIDER_NOTE =
  "hub sends no rider — this seat has received no projection yet";

/** Shared identity for the no-rider state: Vue computeds re-run on every
 *  wireTick, and "nothing" must stay byte-stable nothing. */
const NO_RIDER_STATE: SeatViewState = Object.freeze({ present: false } as const);

function encodingOf(cell: ObservedCell<unknown>): SeatViewEncoding {
  if (cell.value === null) return "none";
  if (typeof cell.value === "bigint") return "fixed";
  if (typeof cell.value === "number") return "int";
  return "text";
}

function displayOf(cell: ObservedCell<unknown>): string | null {
  if (cell.value === null) return null;
  if (typeof cell.value === "bigint") return cell.value.toString();
  return String(cell.value);
}

/** Frozen, code-unit-sorted rows over one decoded seat view (law 4). */
export function seatViewRows(view: ScopedReadView): readonly SeatViewRow[] {
  const keys = [...view.keys()].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  return Object.freeze(
    keys.map((key) => {
      const cell = view.get(key) as ObservedCell<unknown>;
      return Object.freeze({
        key: key as string,
        encoding: encodingOf(cell),
        value: displayOf(cell),
        status: cell.status,
        freshnessUs: cell.freshnessUs.toString(),
        certainty: cell.certainty.toString(),
      });
    }),
  );
}

/** The column's whole state: honest null (no rider ever drained) or the
 *  sorted rows. A rider with zero cells is PRESENT and empty — the hub
 *  looked at this seat and showed it nothing IN SCOPE; that is a different
 *  fact from "the hub sends no rider at all", and the two render apart. */
export function seatViewState(view: ScopedReadView | null): SeatViewState {
  if (view === null) return NO_RIDER_STATE;
  return Object.freeze({ present: true, rows: seatViewRows(view) });
}
