/**
 * i18n · door-refusal copy — maps intent-door refusal codes onto the pack's
 * `refusal.<code>` templates, with the raw wire reason as a VISIBLE fallback.
 *
 * The door speaks `<code>: <detail>` (see packages/sim-core/pipeline/
 * intent-door.ts). The packs carry five refusal templates per pack —
 * edge-exists, hands-exhausted, slot-occupied, stamped-in-future, unknown-
 * node — authored for exactly these bounces. Every OTHER code (self-edge,
 * power-cycle, placement-rejected, the empty/bad grammar guards…) has no
 * key yet: the consumer must show the raw reason, never a lie. That fallback
 * is a first-class result (`fromPack: false`), pinned red/green by tests.
 *
 * Slot extraction reads the door's detail grammar, not the sim — this stays
 * a pure RENDER helper: the session's ReceiptView keeps carrying the raw
 * `reason` (wire bytes + receiptsDigest untouched), and the panel paints
 * prose over it.
 */
import { getEra } from "./eraState.ts";
import { hasKey, t, type PackId } from "./packStore.ts";

/** What the renderer knows around a refused receipt: the receipt's own
 *  verb/tick plus the CURRENT hands view (for the "presents when a hand
 *  frees" slot) — never anything the sim would have to re-derive.
 *  `eraYear` overrides the shared era toggle (eraState.getEra) for callers
 *  that must pin a year; omit it and the render tracks the live toggle. */
export interface RefusalContext {
  readonly verb: string;
  readonly tick: string;
  readonly hands: readonly { readonly busyUntilTick: string; readonly busyCauseId: string | null }[];
  readonly packId?: PackId;
  readonly eraYear?: number;
}

export interface RefusalLine {
  readonly code: string;
  readonly text: string;
  /** true = the pack spoke; false = raw wire reason fallback. */
  readonly fromPack: boolean;
}

/** The door's code is the reason up to its first colon (bare codes have none). */
export function doorCode(reason: string): string {
  const colon = reason.indexOf(":");
  return (colon === -1 ? reason : reason.slice(0, colon)).trim();
}

/** First busy hand's release tick, else one tick out — the honest "presents
 *  when a hand frees" answer from what the panel can already see. */
function nextFreeTick(ctx: RefusalContext): string {
  const current = Number(ctx.tick);
  const releases = ctx.hands
    .map((h) => Number(h.busyUntilTick))
    .filter((until) => Number.isFinite(until) && until > current);
  if (releases.length === 0) return String(current + 1);
  return String(Math.min(...releases));
}

const UNKNOWN_NODE_RE = /^unknown-node: "([^"]+)"$/;
const EDGE_EXISTS_RE = /^edge-exists: "edge:([a-z]+):([^">]+)->([^"]+)"$/;
const SLOT_OCCUPIED_RE = /^slot-occupied: "([^"]+)" on "([^"]+)"/;
const STAMPED_FUTURE_RE = /^stamped-in-future: entry tick (\d+) > current (\d+)$/;

/** The slots each mapped template demands, parsed out of the door's detail —
 *  null when the detail does not match the shape the key was written for
 *  (an upstream wording change then VISIBLY falls back to the raw reason). */
function slotsFor(code: string, reason: string, ctx: RefusalContext): Record<string, string> | null {
  if (code === "unknown-node") {
    const m = UNKNOWN_NODE_RE.exec(reason);
    if (m === null) return null;
    return { nodeId: m[1] ?? "" };
  }
  if (code === "edge-exists") {
    const m = EDGE_EXISTS_RE.exec(reason);
    if (m === null) return null;
    return { relationKind: m[1] ?? "", nodeId: m[2] ?? "" };
  }
  if (code === "slot-occupied") {
    const m = SLOT_OCCUPIED_RE.exec(reason);
    if (m === null) return null;
    return { slotName: m[1] ?? "", nodeId: m[2] ?? "" };
  }
  if (code === "stamped-in-future") {
    const m = STAMPED_FUTURE_RE.exec(reason);
    if (m === null) return null;
    return { verb: ctx.verb, availableAtTick: m[1] ?? "" };
  }
  if (code === "hands-exhausted") {
    return { verb: ctx.verb, availableAtTick: nextFreeTick(ctx) };
  }
  return null;
}

const RAW = (code: string, reason: string): RefusalLine => ({ code, text: reason, fromPack: false });

/** Render one door refusal as pack prose when the pack carries the key AND
 *  the detail parses into the template's slots; raw reason otherwise.
 *  Era flows through from the shared toggle (ctx.eraYear overrides) — the
 *  five voiced refusal keys are flat today, so a flip re-derives identical
 *  prose; the plumbing lights up the moment authoring era-varies a refusal. */
export function describeRefusal(reason: string, ctx: RefusalContext): RefusalLine {
  const code = doorCode(reason);
  const packId: PackId = ctx.packId ?? "shared-web";
  const eraYear: number = ctx.eraYear ?? getEra();
  const key = `refusal.${code}`;
  if (!hasKey(packId, key)) return RAW(code, reason);
  const slots = slotsFor(code, reason, ctx);
  if (slots === null) return RAW(code, reason);
  try {
    return { code, text: t(packId, key, slots, eraYear), fromPack: true };
  } catch {
    // Slot-set drift (authoring changed a {token}): the raw wire reason stays
    // visible, and corpusDrift.test.ts turns the mismatch red by name.
    return RAW(code, reason);
  }
}
