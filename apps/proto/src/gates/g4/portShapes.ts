/**
 * gates/g4 · portShapes — typed ports with REDUNDANT channels (WS-2 R32):
 * every socket relation carries its OWN SHAPE, its own hue, AND its own
 * dash pattern, so a colorblind seat reads the board identically. The law:
 * color is never the only channel — shape is the fact, hue is the flavor.
 *
 * R32 physical vocabulary:
 *   data    → RJ45 trapezoid      (cyan)
 *   power   → kettle-plug outline (copper)
 *   control → console circle      (white)
 *   trust   → SFP slot            (teal-violet)
 *
 * Glyph paths live in a 24×24 box; the panel scales them. Pure data, zero
 * DOM — the SVG template stays dumb and the mapping stays testable.
 */
import type { BoardRelation } from "@hh/sim-core/types";
import { canConnect, refusalReason } from "@hh/sim-core/topology";

export type GlyphKind = "trapezoid" | "slot" | "kettle" | "circle";

export interface PortGlyph {
  readonly relation: BoardRelation;
  readonly glyph: GlyphKind;
  /** SVG path data in a 24×24 viewBox (fill). */
  readonly path: string;
  /** CSS custom property carrying the committed hue (era-themed). */
  readonly hueVar: string;
  /** Non-color redundancy: distinct stroke-dasharray when outlined. */
  readonly dash: string;
  /** Redundant non-color channel #2: distinct stroke width. */
  readonly strokeWidth: number;
  readonly ariaLabel: string;
}

export const PORT_GLYPHS: Readonly<Record<BoardRelation, PortGlyph>> = Object.freeze({
  data: Object.freeze({
    relation: "data" as const,
    glyph: "trapezoid" as const,
    path: "M5 8h14l-2.5 9h-9z",
    hueVar: "--g4-hue-data",
    dash: "0",
    strokeWidth: 1.5,
    ariaLabel: "data port (RJ45 trapezoid)",
  }),
  power: Object.freeze({
    relation: "power" as const,
    glyph: "kettle" as const,
    path: "M8 5h8v6a4 4 0 0 1-8 0zM10 15v4M14 15v4",
    hueVar: "--g4-hue-power",
    dash: "3 2",
    strokeWidth: 2.5,
    ariaLabel: "power inlet (kettle plug)",
  }),
  control: Object.freeze({
    relation: "control" as const,
    glyph: "circle" as const,
    path: "M12 6.5a5.5 5.5 0 1 0 0 11a5.5 5.5 0 1 0 0-11",
    hueVar: "--g4-hue-control",
    dash: "1 2",
    strokeWidth: 1.5,
    ariaLabel: "console port (circle)",
  }),
  trust: Object.freeze({
    relation: "trust" as const,
    glyph: "slot" as const,
    path: "M4 10h16v4H4zM17 11.5h1v1h-1z",
    hueVar: "--g4-hue-trust",
    dash: "5 2 1 2",
    strokeWidth: 1.5,
    ariaLabel: "trust token slot (SFP)",
  }),
});

/** A concrete socket on a concrete device, in host-side UI space. */
export interface PortSpec {
  readonly portId: string;
  readonly nodeId: string;
  readonly relation: BoardRelation;
  readonly label: string;
  /** Socket-grammar endpoints for the PLUG side (data/trust/control use
   *  the topology `<stem>-<in|out>` law; power bypasses grammar — its law
   *  is slot occupancy, enforced by the door). */
  readonly needs: readonly string[];
  readonly provides: readonly string[];
  /** Power only: the consumer socket name the door will stamp ("psu1"). */
  readonly slot: string | null;
}

export type PlugVerdict =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: string };

/**
 * Preflight law (§7.2): an illegal pair is refused BEFORE an intent exists —
 * no hand is spent, no tick is stamped. Grammar relations consult the real
 * topology sockets module; power checks slot arithmetic; same-relation is
 * the physical truth (you cannot patch a data jack into a kettle inlet).
 */
export function portsPluggable(source: PortSpec, dest: PortSpec): PlugVerdict {
  if (source.nodeId === dest.nodeId) return { ok: false, reason: "self-edge: a device cannot cable itself" };
  if (source.relation !== dest.relation) {
    return {
      ok: false,
      reason: `shape mismatch — ${source.relation} plug (${PORT_GLYPHS[source.relation].glyph}) will not seat in ${dest.relation} socket (${PORT_GLYPHS[dest.relation].glyph})`,
    };
  }
  if (source.relation === "power") {
    if (source.slot === null || dest.slot === null) {
      return { ok: false, reason: "power port missing its socket name — host parse bug" };
    }
    return { ok: true }; // slot-occupancy law lives in the door (one supplier per socket)
  }
  const fit = canConnect(
    { needs: source.needs, provides: source.provides },
    { needs: dest.needs, provides: dest.provides },
  );
  if (fit) return { ok: true };
  const grammar = refusalReason(source.needs, dest.provides);
  return { ok: false, reason: grammar ?? `no socket fit between ${source.label} and ${dest.label}` };
}

/** Directional helper for wiring-mode glow: is this port a legal DEST for
 *  the in-hand source? (Cheap filter — full law stays in portsPluggable.) */
export function isValidTarget(source: PortSpec, candidate: PortSpec): boolean {
  return portsPluggable(source, candidate).ok;
}
