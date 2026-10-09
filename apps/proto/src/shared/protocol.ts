/**
 * `proto` ↔ worker message protocol — the observed-layer seam (MASTER_REPORT
 * §3.1 law 3: "the ObservedCell shape is the binding contract… same cell shape
 * flows worker→main→Pixi adapter, server→relay→remote seats").
 *
 * Boundary law ("Parse, Don't Validate", CONVENTIONS §4): the WIRE form is
 * JSON-safe — every bigint crosses as a decimal string so the identical schema
 * survives a future Workerman→relay hop, even though same-browser structured
 * clone could carry bigint directly. `decodeProjection` is the ONE place
 * strings become bigint again; everything downstream trusts parsed types.
 *
 * The projection carries ONLY observed-layer material: LaneStats aggregates +
 * ObservedCells + event notices + counters. Per-request units never cross this
 * boundary (§4.7: "motes are cosmetic interpolants of throughput statistics,
 * generated locally from (rate, latency-distribution, class-mix, health)").
 */
import {
  asEntityId,
  PLAYER_VERBS,
  type ClockKind,
  type ClockState,
  type EntityId,
  type Fixed,
  type LaneStats,
  type ObservedCell,
  type ObservedKey,
  type SimMinute,
  type SimTick,
  type SimTimeUs,
} from "@hh/sim-core";

/* ═══════════════════════════ Errors ═══════════════════════════ */

/** Every codec failure names its exact field path — silent half-states are
 *  worse than a crash (Law 4, fail loud). */
export class ProtocolError extends Error {
  constructor(path: string, expected: string, received: unknown) {
    super(`protocol violation at ${path}: expected ${expected}, got ${describe(received)}`);
    this.name = "ProtocolError";
  }
}

function describe(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return `${typeof value} ${String(value).slice(0, 40)}`;
}

/* ═══════════════════════════ Wire scalars ═══════════════════════════ */

/** Decimal-string integer microseconds (`SimTimeUs` / `MoneyUnit` on the wire). */
export type WireUs = string;
/** Decimal-string Q16.16 raw units (`Fixed` on the wire). */
export type WireFixed = string;

const INT_RE = /^-?\d+$/;

function parseUs(path: string, raw: unknown): SimTimeUs {
  if (typeof raw !== "string" || !INT_RE.test(raw)) {
    throw new ProtocolError(path, "integer-microsecond string", raw);
  }
  const parsed = BigInt(raw);
  if (parsed < 0n) throw new ProtocolError(path, "non-negative µs", raw);
  return parsed;
}

function parseFixed(path: string, raw: unknown): Fixed {
  if (typeof raw !== "string" || !INT_RE.test(raw)) {
    throw new ProtocolError(path, "Q16.16 raw string", raw);
  }
  return BigInt(raw);
}

/** How to interpret an ObservedCell payload — self-describing so the boundary
 *  parse never guesses (R-66 "nothing, not zero" survives the hop). */
export type CellEncoding = "fixed" | "int" | "text";

/* ═══════════════════════════ Trust-internal projection ═══════════════════════ */

export type CellValue = Fixed | number | string;

/** A fully parsed ObservedCell: `value === null` means NO DATA (≠ 0). */
export type ProtoCell = ObservedCell<CellValue>;

export type NoticeKind =
  | "arrival-surge"
  | "bounce"
  | "false-positive"
  | "landed"
  | "rule-fired"
  /** Intent-door receipts (contract #10): one per fed external intent, the
   *  verdict roll-up the host HUD ticks. `detail` carries "<verb>" on an
   *  execution and "<verb>: <reason>" on a refusal. */
  | "intent-executed"
  | "intent-refused"
  /** Runner money-lane roll-up (REST-PROTO-FINAL): one notice per
   *  EconomyNotice out of `runEconomyTick`, so the 25-kind economy vocabulary
   *  does NOT bloat this union — `detail` carries `<economyKind>:<contractId>`
   *  and consumers who care split on the first colon. laneId is always null
   *  (money is company-wide, not per-lane). */
  | "economy-notice";

const NOTICE_KINDS: readonly NoticeKind[] = [
  "arrival-surge",
  "bounce",
  "false-positive",
  "landed",
  "rule-fired",
  "intent-executed",
  "intent-refused",
  "economy-notice",
];

/** One FX-worthy moment, aggregate-level only (no unit ids cross the seam). */
export interface EventNotice {
  readonly kind: NoticeKind;
  readonly laneId: EntityId | null;
  readonly atUs: SimTimeUs;
  /** Optional plain-text rider (door receipts). Absent = nothing to render;
   *  omitted from the WIRE when unset, so pre-door frames encode byte-identically. */
  readonly detail?: string;
}

/** The G1 outcome counters (three terminals + false-positive ticker). */
export interface OutcomeCounters {
  readonly served: number;
  readonly bounced: number;
  readonly blockedFalsePositive: number;
  readonly landed: number;
}

/** Parsed, trusted projection consumed by renderer + chrome. */
export interface SimProjection {
  readonly seq: number;
  readonly tick: SimTick;
  readonly minute: SimMinute;
  readonly clocks: ClockState;
  readonly lanes: readonly LaneStats[];
  readonly observed: ReadonlyMap<ObservedKey, ProtoCell>;
  readonly notices: readonly EventNotice[];
  readonly counters: OutcomeCounters;
  /** Free bucket only at P0 (full six-bucket stack arrives with G5). Signed
   *  integer µ$ — same MoneyUnit discipline as sim-core. */
  readonly freeCashMicroUsd: bigint;
}

/* ═══════════════════════════ Wire forms ═══════════════════════════ */

export interface ObservedCellWire {
  readonly key: string;
  readonly encoding: CellEncoding;
  readonly value: number | string | null;
  readonly fidelity: number;
  readonly freshnessUs: WireUs;
  readonly coverage: WireFixed;
  readonly certainty: WireFixed;
  readonly status: "live" | "stale" | "unknown";
}

export interface LaneWire {
  readonly laneId: string;
  readonly ratePerMin: WireFixed;
  readonly latencyDistributionRef: string;
  readonly classMix: Readonly<Record<string, WireFixed>>;
  readonly health: WireFixed;
}

export interface ClocksWire {
  readonly realUs: WireUs;
  readonly simUs: WireUs;
  readonly businessUs: WireUs;
  readonly wallUs: WireUs;
}

export interface EventNoticeWire {
  readonly kind: NoticeKind;
  readonly laneId: string | null;
  readonly atUs: WireUs;
  readonly detail?: string;
}

export interface ProjectionWire {
  readonly protocol: typeof PROTOCOL_VERSION;
  readonly seq: number;
  readonly tick: WireUs;
  readonly minute: number;
  readonly clocks: ClocksWire;
  readonly lanes: readonly LaneWire[];
  readonly observed: readonly ObservedCellWire[];
  readonly notices: readonly EventNoticeWire[];
  readonly counters: OutcomeCounters;
  readonly freeCashMicroUsd: WireUs;
  /** Renderer heartbeat frequency (§4.7 item 1.2: global ~0.5 Hz sync). */
  readonly heartbeatHz: number;
}

export const PROTOCOL_VERSION = 1 as const;
export const HEARTBEAT_HZ_WIRE = 0.5 as const;

/* ═══════════════════════════ Direction: main → worker ═══════════════════════ */

/** Mirror of sim-core `IntentPayload` with wire scalars (parsed at the seam). */
export type WireIntentPayload =
  | { readonly kind: "verb"; readonly verb: string; readonly target: string | null; readonly value: WireFixed | null }
  | { readonly kind: "slider"; readonly control: string; readonly value: WireFixed }
  /** Door-executed arm (contract #10): `args` is the flat PlayerVerbArgs
   *  record — ids/strings/numbers/null ONLY, never embedded structure, so a
   *  JSON hop cannot smuggle objects into the sim. Per-verb field semantics
   *  are the door's boundary problem (IntentDoorError), not this codec's. */
  | { readonly kind: "player-verb"; readonly args: Readonly<Record<string, string | number | null>> };

export type RunnerKindWire = "mock" | "sim-core";
const RUNNER_KINDS: readonly RunnerKindWire[] = ["mock", "sim-core"];

export type ToWorker =
  | { readonly kind: "boot"; readonly protocol: typeof PROTOCOL_VERSION; readonly seed: string; readonly speedX: SpeedX; readonly runnerKind: RunnerKindWire }
  | { readonly kind: "intent"; readonly protocol: typeof PROTOCOL_VERSION; readonly seq: number; readonly clock: ClockKind; readonly atUs: WireUs; readonly origin: "player" | "rule"; readonly payload: WireIntentPayload }
  | { readonly kind: "speed"; readonly protocol: typeof PROTOCOL_VERSION; readonly speedX: SpeedX }
  | { readonly kind: "halt"; readonly protocol: typeof PROTOCOL_VERSION };

export type SpeedX = 1 | 2 | 4;
const SPEEDS: readonly SpeedX[] = [1, 2, 4];

/* ═══════════════════════════ Direction: worker → main ═══════════════════════ */

export type FromWorker =
  | { readonly kind: "ready"; readonly protocol: typeof PROTOCOL_VERSION; readonly engineVersion: string; readonly runnerId: "mock" | "sim-core" }
  | { readonly kind: "projection"; readonly protocol: typeof PROTOCOL_VERSION; readonly projection: ProjectionWire }
  | { readonly kind: "fault"; readonly protocol: typeof PROTOCOL_VERSION; readonly message: string };

/* ═══════════════════════════ Guards ═══════════════════════════ */

function isRecord(path: string, value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new ProtocolError(path, "object", value);
  }
  return value as Record<string, unknown>;
}

function parseNumber(path: string, raw: unknown): number {
  if (typeof raw !== "number" || !Number.isFinite(raw)) {
    throw new ProtocolError(path, "finite number", raw);
  }
  return raw;
}

function parseString(path: string, raw: unknown): string {
  if (typeof raw !== "string") throw new ProtocolError(path, "string", raw);
  return raw;
}

function parseLiteral<T extends string | number>(path: string, raw: unknown, allowed: readonly T[]): T {
  for (const candidate of allowed) {
    if (raw === candidate) return candidate;
  }
  throw new ProtocolError(path, `one of ${allowed.join("|")}`, raw);
}

/** Validated µs/integer string kept in its WIRE form (the worker side re-parses
 *  to bigint when building sim-core types — strings survive structuredClone). */
function parseWireUsString(path: string, raw: unknown): string {
  return parseUs(path, raw).toString();
}

/* ═══════════════════════════ Encode (trusted → wire) ═══════════════════════ */

function encodeCell(key: ObservedKey, cell: ProtoCell): ObservedCellWire {
  const encoding: CellEncoding =
    typeof cell.value === "bigint" ? "fixed" : typeof cell.value === "number" ? "int" : "text";
  return {
    key,
    encoding,
    value:
      cell.value === null
        ? null
        : typeof cell.value === "bigint"
          ? cell.value.toString()
          : cell.value,
    fidelity: cell.fidelity,
    freshnessUs: cell.freshnessUs.toString(),
    coverage: cell.coverage.toString(),
    certainty: cell.certainty.toString(),
    status: cell.status,
  };
}

export function encodeProjection(p: SimProjection): ProjectionWire {
  const lanes: LaneWire[] = p.lanes.map((lane) => ({
    laneId: lane.laneId,
    ratePerMin: lane.ratePerMin.toString(),
    latencyDistributionRef: lane.latencyDistributionRef,
    classMix: Object.fromEntries(
      Object.entries(lane.classMix).map(([id, share]) => [id, share.toString()]),
    ),
    health: lane.health.toString(),
  }));
  const observed: ObservedCellWire[] = [];
  for (const [key, cell] of p.observed) observed.push(encodeCell(key, cell));
  return {
    protocol: PROTOCOL_VERSION,
    seq: p.seq,
    tick: p.tick.toString(),
    minute: p.minute,
    clocks: {
      realUs: p.clocks.realUs.toString(),
      simUs: p.clocks.simUs.toString(),
      businessUs: p.clocks.businessUs.toString(),
      wallUs: p.clocks.wallUs.toString(),
    },
    lanes,
    observed,
    notices: p.notices.map((n) => ({
      kind: n.kind,
      laneId: n.laneId,
      atUs: n.atUs.toString(),
      ...(n.detail === undefined ? {} : { detail: n.detail }),
    })),
    counters: { ...p.counters },
    freeCashMicroUsd: p.freeCashMicroUsd.toString(),
    heartbeatHz: HEARTBEAT_HZ_WIRE,
  };
}

/* ═══════════════════════════ Decode (wire → trusted) ═══════════════════════ */

function decodeCell(raw: unknown, index: number): [ObservedKey, ProtoCell] {
  const path = `observed[${index}]`;
  const rec = isRecord(path, raw);
  const key = parseString(`${path}.key`, rec["key"]);
  const encoding = parseLiteral(`${path}.encoding`, rec["encoding"], ["fixed", "int", "text"] as const);
  const valueRaw = rec["value"];
  let value: CellValue | null;
  if (valueRaw === null) {
    value = null;
  } else if (encoding === "fixed") {
    value = parseFixed(`${path}.value`, valueRaw);
  } else if (encoding === "int") {
    value = parseNumber(`${path}.value`, valueRaw);
  } else {
    value = parseString(`${path}.value`, valueRaw);
  }
  const status = parseLiteral(`${path}.status`, rec["status"], ["live", "stale", "unknown"] as const);
  const cell: ProtoCell = {
    value,
    fidelity: parseNumber(`${path}.fidelity`, rec["fidelity"]),
    freshnessUs: parseUs(`${path}.freshnessUs`, rec["freshnessUs"]),
    coverage: parseFixed(`${path}.coverage`, rec["coverage"]),
    certainty: parseFixed(`${path}.certainty`, rec["certainty"]),
    status,
  };
  return [key as ObservedKey, cell];
}

function decodeLane(raw: unknown, index: number): LaneStats {
  const path = `lanes[${index}]`;
  const rec = isRecord(path, raw);
  const classMixRaw = isRecord(`${path}.classMix`, rec["classMix"]);
  const classMix: Record<string, Fixed> = {};
  for (const [id, share] of Object.entries(classMixRaw)) {
    classMix[id] = parseFixed(`${path}.classMix.${id}`, share);
  }
  return {
    laneId: asEntityId(parseString(`${path}.laneId`, rec["laneId"])),
    ratePerMin: parseFixed(`${path}.ratePerMin`, rec["ratePerMin"]),
    latencyDistributionRef: parseString(`${path}.latencyDistributionRef`, rec["latencyDistributionRef"]),
    classMix,
    health: parseFixed(`${path}.health`, rec["health"]),
  };
}

function decodeNotice(raw: unknown, index: number): EventNotice {
  const path = `notices[${index}]`;
  const rec = isRecord(path, raw);
  const laneRaw = rec["laneId"];
  const detailRaw = rec["detail"];
  if (detailRaw !== undefined && typeof detailRaw !== "string") {
    throw new ProtocolError(`${path}.detail`, "string rider or absent", detailRaw);
  }
  return {
    kind: parseLiteral(`${path}.kind`, rec["kind"], NOTICE_KINDS),
    laneId: laneRaw === null ? null : asEntityId(parseString(`${path}.laneId`, laneRaw)),
    atUs: parseUs(`${path}.atUs`, rec["atUs"]),
    ...(detailRaw === undefined ? {} : { detail: detailRaw }),
  };
}

/** THE boundary parse. Anything malformed throws ProtocolError naming the
 *  exact field; the consumer never sees half-trusted data. */
export function decodeProjection(raw: unknown): SimProjection {
  const rec = isRecord("projection", raw);
  if (rec["protocol"] !== PROTOCOL_VERSION) {
    throw new ProtocolError("protocol", `v${PROTOCOL_VERSION}`, rec["protocol"]);
  }
  const clocksPath = "clocks";
  const clocksRaw = isRecord(clocksPath, rec["clocks"]);
  const countersRaw = isRecord("counters", rec["counters"]);
  const lanesRaw = rec["lanes"];
  if (!Array.isArray(lanesRaw)) throw new ProtocolError("lanes", "array", lanesRaw);
  const observedRaw = rec["observed"];
  if (!Array.isArray(observedRaw)) throw new ProtocolError("observed", "array", observedRaw);
  const noticesRaw = rec["notices"];
  if (!Array.isArray(noticesRaw)) throw new ProtocolError("notices", "array", noticesRaw);

  const observed = new Map<ObservedKey, ProtoCell>();
  observedRaw.forEach((entry, i) => {
    const [key, cell] = decodeCell(entry, i);
    observed.set(key, cell);
  });

  return {
    seq: parseNumber("seq", rec["seq"]),
    tick: parseUs("tick", rec["tick"]),
    minute: parseNumber("minute", rec["minute"]),
    clocks: {
      realUs: parseUs(`${clocksPath}.realUs`, clocksRaw["realUs"]),
      simUs: parseUs(`${clocksPath}.simUs`, clocksRaw["simUs"]),
      businessUs: parseUs(`${clocksPath}.businessUs`, clocksRaw["businessUs"]),
      wallUs: parseUs(`${clocksPath}.wallUs`, clocksRaw["wallUs"]),
    },
    lanes: lanesRaw.map(decodeLane),
    observed,
    notices: noticesRaw.map(decodeNotice),
    counters: {
      served: parseNumber("counters.served", countersRaw["served"]),
      bounced: parseNumber("counters.bounced", countersRaw["bounced"]),
      blockedFalsePositive: parseNumber("counters.blockedFalsePositive", countersRaw["blockedFalsePositive"]),
      landed: parseNumber("counters.landed", countersRaw["landed"]),
    },
    freeCashMicroUsd: parseUs("freeCashMicroUsd", rec["freeCashMicroUsd"]),
  };
}

/* ═══════════════════════════ Envelope assertions ═══════════════════════════ */

export function assertToWorker(raw: unknown): ToWorker {
  const rec = isRecord("toWorker", raw);
  if (rec["protocol"] !== PROTOCOL_VERSION) {
    throw new ProtocolError("protocol", `v${PROTOCOL_VERSION}`, rec["protocol"]);
  }
  const kind = parseLiteral("toWorker.kind", rec["kind"], ["boot", "intent", "speed", "halt"] as const);
  if (kind === "halt") return { kind, protocol: PROTOCOL_VERSION };
  if (kind === "speed") {
    return { kind, protocol: PROTOCOL_VERSION, speedX: parseLiteral("speedX", rec["speedX"], SPEEDS) };
  }
  if (kind === "boot") {
    return {
      kind,
      protocol: PROTOCOL_VERSION,
      seed: parseString("boot.seed", rec["seed"]),
      speedX: parseLiteral("boot.speedX", rec["speedX"], SPEEDS),
      // Absent ⇒ the demo mock (back-compat); "sim-core" ⇒ the real driver.
      runnerKind:
        rec["runnerKind"] === undefined
          ? "mock"
          : parseLiteral("boot.runnerKind", rec["runnerKind"], RUNNER_KINDS),
    };
  }
  return {
    kind,
    protocol: PROTOCOL_VERSION,
    seq: parseNumber("intent.seq", rec["seq"]),
    clock: parseLiteral("intent.clock", rec["clock"], ["sim", "business", "wall"] as const),
    atUs: parseWireUsString("intent.atUs", rec["atUs"]),
    origin: parseLiteral("intent.origin", rec["origin"], ["player", "rule"] as const),
    payload: decodeIntentPayload(rec["payload"]),
  };
}

function decodeIntentPayload(raw: unknown): WireIntentPayload {
  const path = "intent.payload";
  const rec = isRecord(path, raw);
  const kind = parseLiteral(`${path}.kind`, rec["kind"], ["verb", "slider", "player-verb"] as const);
  if (kind === "player-verb") {
    const argsRaw = isRecord(`${path}.args`, rec["args"]);
    parseLiteral(`${path}.args.verb`, argsRaw["verb"], PLAYER_VERBS);
    const args: Record<string, string | number | null> = {};
    for (const [field, value] of Object.entries(argsRaw)) {
      if (value === null || typeof value === "string" || typeof value === "number") {
        args[field] = value;
        continue;
      }
      throw new ProtocolError(`${path}.args.${field}`, "scalar (id/string/number/null)", value);
    }
    return { kind, args: Object.freeze(args) };
  }
  if (kind === "verb") {
    const targetRaw = rec["target"];
    return {
      kind,
      verb: parseString(`${path}.verb`, rec["verb"]),
      target: targetRaw === null ? null : parseString(`${path}.target`, targetRaw),
      value: rec["value"] === null ? null : parseString(`${path}.value`, rec["value"]),
    };
  }
  return {
    kind,
    control: parseString(`${path}.control`, rec["control"]),
    value: parseString(`${path}.value`, rec["value"]),
  };
}

export function assertFromWorker(raw: unknown): FromWorker {
  const rec = isRecord("fromWorker", raw);
  if (rec["protocol"] !== PROTOCOL_VERSION) {
    throw new ProtocolError("protocol", `v${PROTOCOL_VERSION}`, rec["protocol"]);
  }
  const kind = parseLiteral("fromWorker.kind", rec["kind"], ["ready", "projection", "fault"] as const);
  if (kind === "ready") {
    return {
      kind,
      protocol: PROTOCOL_VERSION,
      engineVersion: parseString("ready.engineVersion", rec["engineVersion"]),
      runnerId: parseLiteral("ready.runnerId", rec["runnerId"], ["mock", "sim-core"] as const),
    };
  }
  if (kind === "fault") {
    return { kind, protocol: PROTOCOL_VERSION, message: parseString("fault.message", rec["message"]) };
  }
  // Deep field validation happens in `decodeProjection` (the single boundary
  // parse); here we only prove it is an object at all.
  isRecord("projection", rec["projection"]);
  return { kind, protocol: PROTOCOL_VERSION, projection: rec["projection"] as ProjectionWire };
}

/* ═══════════════════════════ Display-side helpers ═══════════════════════════ */

/** Q16.16 → JS number. DISPLAY ONLY (§4.1: floats never touch replay state). */
export function fixedToDisplay(fixed: Fixed): number {
  return Number(fixed) / 65536;
}

/** Display number → Q16.16 raw. Used by the mock (presentation-side toy model)
 *  and by chrome when formatting — never by any sim-authority path. */
export function displayToFixed(value: number): Fixed {
  if (!Number.isFinite(value)) throw new ProtocolError("displayToFixed", "finite number", value);
  return BigInt(Math.round(value * 65536));
}

/** Read a parsed cell as Fixed, failing loud when the encoding disagrees —
 *  a mismatch is a producer bug we want at the console immediately. */
export function requireFixed(cell: ProtoCell | undefined, what: string): Fixed {
  if (cell === undefined) {
    throw new ProtocolError(`cell(${what})`, "present cell", "undefined");
  }
  if (typeof cell.value !== "bigint") {
    throw new ProtocolError(`cell(${what}).value`, "bigint (fixed encoding)", cell.value);
  }
  return cell.value;
}
