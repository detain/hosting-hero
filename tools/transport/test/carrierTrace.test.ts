/**
 * test/carrierTrace.test.ts — the TS trace-PLAYER (lane L-TP, ADR-0019
 * program 7). CARRIER-CONTRACT.md §4.1 called this file by name: "a TS
 * trace-player in tools/transport/test/ (~150 LOC; the src/ 8-file roster
 * stays untouched) ... that player IS the executable spec PHP diffs against
 * in any polyglot CI, and turns §4.1 from a recipe into a gate."
 *
 * THE DOC IS THE FIXTURE. The reference trace is parsed out of
 * CARRIER-CONTRACT.md at test time — a fence edit that the real hub does not
 * reproduce reddens HERE, in CI, before any PHP carrier ever burns a frame
 * against it. Drift the other way (code changes the recording) reddens too:
 * the embedded `out` bytes are the expectation.
 *
 * REPLAY SURFACE (decision, §4.1 table semantics + follow-on-lane interface):
 * the table is normative and hub-direct — `in` rows append the frame's
 * CANONICAL bytes to the hub's inbox "in line order"; `tick` rows are
 * relay.advanceTo; `drain` rows are hub.drain(); `out` rows assert the hub's
 * NEXT emission toward that seat, in GLOBAL fan order (§4.4: the trace pins
 * fan order — broadcast-before-seat-state, ledger order); `resend` rows go to
 * the seat's client mailbox WITHOUT a hub drain ("the client (TS) must absorb
 * it, the hub must never see it"). So the player owns a synchronous replay
 * TransportPort — no carrier delay model, no pump ceremony the trace never
 * recorded — and mounts the REAL relay hub (attachRelayHub) + REAL transport
 * clients (createTransportClient) over it. Clients are receive-only: they
 * never send (§4.1's `in` rows re-inject the recorded client bytes exactly, so
 * carol's auto-chained page-2 request is injected, not re-issued — the client
 * idempotence + catch-up-absorb laws stay witnessed, the hub never sees it
 * twice). The src/ roster stays EXACTLY the eight designed files; the player
 * lives here, in test/, per §4.1.
 *
 * Construction follows the §4.1 GENERATION RECIPE verbatim:
 * createCoopRelay({autoCatchUpOnJoin:false}); attachRelayHub(relay, port,
 * {pageSize:2, projectionSource: alice → view rider ONLY}); the alice view
 * rider is SELF-DERIVED from the first recorded alice seat-state `out` frame —
 * the trace block, not prose, is the complete authority (§4.1 prose carries
 * an "…" ellipsis; a consistent doc edit stays conformant, a partial one
 * reddens on byte equality).
 *
 * Determinism law (the package's own): zero timers, zero wall-clock, zero
 * Math.random — this is a pure replayer; time moves only via `tick` rows.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { createCoopRelay } from "relay-tools";
import { createTransportClient } from "../src/client.ts";
import type { TransportClient } from "../src/client.ts";
import { decodeFrame, encodeFrame, ledgerToWire } from "../src/codec.ts";
import type { SeatHolderWire, SeatViewWire, StampWire, TransportFrame } from "../src/envelope.ts";
import type { TransportEndpoint, TransportPort } from "../src/port.ts";
import { attachRelayHub } from "../src/server.ts";

/* ═══════════════════════ the trace parses at the fence ═══════════════════════ */

const CONTRACT_PATH = fileURLToPath(new URL("../CARRIER-CONTRACT.md", import.meta.url));
const FENCE_OPEN = "```jsonl";
const FENCE_CLOSE = "```";

/** The ONE terminal-digest witness, hard-pinned from §4.1/§4.3 — the
 *  implementation-independent authority. A doc rewrite that "self-heals" its
 *  end line while keeping its frames must still answer to this literal. */
const PINNED_TIMELINE_DIGEST = "de1d4c0f941333eb";

interface FrameLine {
  readonly c: "in" | "out" | "resend";
  readonly line: number; // 1-based position INSIDE the fenced block
  readonly seat: string;
  readonly synth: string | null; // carrier-authorship marker (§2.12), in-lines only
  readonly frame: TransportFrame; // trusted — decoded through the real codec
  readonly embedded: string; // JSON.stringify of the doc's parsed f (document key order)
  readonly canonical: string; // encodeFrame(frame) — §1.3 canonical bytes
}

interface EndWitness {
  readonly c: "end";
  readonly line: number;
  readonly logLen: number;
  readonly lastStamp: StampWire | null;
  readonly ledger: readonly SeatHolderWire[];
  readonly timelineDigest: string;
}

type TraceLine =
  | FrameLine
  | { readonly c: "tick"; readonly line: number; readonly t: string }
  | { readonly c: "drain"; readonly line: number }
  | EndWitness;

interface ReferenceTrace {
  readonly lines: readonly TraceLine[];
  readonly aliceView: SeatViewWire;
}

function fail(line: number, why: string): never {
  throw new Error(`carrierTrace: fence line ${line} — ${why}`);
}

function parseSeat(label: string, line: number, raw: unknown): string {
  if (typeof raw !== "string" || raw.length === 0) fail(line, `${label} must be a non-empty string`);
  return raw as string;
}

function parseStampOrNull(line: number, raw: unknown): StampWire | null {
  if (raw === null) return null;
  if (typeof raw !== "object" || Array.isArray(raw)) fail(line, "lastStamp must be null or {tick,seq}");
  const rec = raw as Record<string, unknown>;
  if (typeof rec["tick"] !== "string" || !/^-?\d+$/.test(rec["tick"])) fail(line, "lastStamp.tick must be a decimal string");
  if (typeof rec["seq"] !== "number" || !Number.isSafeInteger(rec["seq"])) fail(line, "lastStamp.seq must be a safe integer");
  return { tick: rec["tick"], seq: rec["seq"] };
}

function parseEndLedger(line: number, raw: unknown): readonly SeatHolderWire[] {
  if (!Array.isArray(raw)) fail(line, "ledger must be an array of seat rows");
  return raw.map((entry, index): SeatHolderWire => {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
      fail(line, `ledger[${index}] must be an object`);
    }
    const rec = entry as Record<string, unknown>;
    for (const field of ["participantId", "joinedAtTick"] as const) {
      if (typeof rec[field] !== "string") fail(line, `ledger[${index}].${field} must be a decimal string`);
    }
    const left = rec["leftAtTick"];
    if (left !== undefined && typeof left !== "string") fail(line, `ledger[${index}].leftAtTick must be a string or absent`);
    return {
      participantId: rec["participantId"] as string,
      joinedAtTick: rec["joinedAtTick"] as string,
      ...(left === undefined ? {} : { leftAtTick: left as string }),
    };
  });
}

function parseTraceLine(index: number, raw: string): TraceLine {
  const line = index + 1;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    fail(line, "not valid JSON — the trace fence carries one JSON object per line");
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) fail(line, "not a JSON object");
  const rec = parsed as Record<string, unknown>;
  const c = rec["c"];
  if (c === "drain") return { c, line };
  if (c === "tick") {
    if (typeof rec["t"] !== "string" || !/^\d+$/.test(rec["t"])) fail(line, "tick.t must be a decimal-string minute");
    return { c, line, t: rec["t"] };
  }
  if (c === "in" || c === "out" || c === "resend") {
    const seat = parseSeat(`${c}.s`, line, rec["s"]);
    if (typeof rec["f"] !== "object" || rec["f"] === null || Array.isArray(rec["f"])) fail(line, `${c}.f must be a frame object`);
    const embedded = JSON.stringify(rec["f"]);
    const frame = decodeFrame(embedded); // the REAL codec parses the recorded bytes — fail-loud on an illegal frame
    const synth = c === "in" ? (rec["synth"] ?? null) : undefined;
    if (c === "in" && synth !== null && typeof synth !== "string") fail(line, "in.synth marker must be a string");
    return {
      c: c as "in" | "out" | "resend",
      line,
      seat,
      synth: (synth ?? null) as string | null,
      frame,
      embedded,
      canonical: encodeFrame(frame),
    };
  }
  if (c === "end") {
    const logLen = rec["logLen"];
    if (typeof logLen !== "number" || !Number.isSafeInteger(logLen) || logLen < 0) fail(line, "end.logLen must be a safe integer >= 0");
    const digest = rec["timelineDigest"];
    if (typeof digest !== "string" || !/^[0-9a-f]{16}$/.test(digest)) fail(line, "end.timelineDigest must be 16 lowercase hex");
    return {
      c,
      line,
      logLen,
      lastStamp: parseStampOrNull(line, rec["lastStamp"]),
      ledger: parseEndLedger(line, rec["ledger"]),
      timelineDigest: digest,
    };
  }
  return fail(line, `unknown line-kind "${String(c)}" — extend the §4.1 table AND this router together, never silently`);
}

function parseReferenceTrace(): ReferenceTrace {
  const rows = readFileSync(CONTRACT_PATH, "utf8").split("\n");
  const openIndexes = rows.flatMap((text, i) => (text === FENCE_OPEN ? [i] : []));
  if (openIndexes.length !== 1) {
    throw new Error(
      `carrierTrace: CARRIER-CONTRACT.md must contain EXACTLY one \`${FENCE_OPEN}\` fence — found ${String(openIndexes.length)}. ` +
        "The §4.1 reference trace is THE fixture; if the block moved or duplicated, fix the doc deliberately, not this player.",
    );
  }
  const body: string[] = [];
  let closed = false;
  for (let i = (openIndexes[0] as number) + 1; i < rows.length; i += 1) {
    const text = rows[i] as string;
    if (text === FENCE_CLOSE) {
      closed = true;
      break;
    }
    if (text.trim().length > 0) body.push(text);
  }
  if (!closed) throw new Error("carrierTrace: the reference-trace fence never closes");
  const lines = body.map((text, index) => parseTraceLine(index, text));
  const tail = lines[lines.length - 1];
  if (tail?.c !== "end") throw new Error("carrierTrace: the reference trace must END with the terminal `end` witness line (§4.3)");
  const aliceView = extractAliceView(lines);
  return { lines, aliceView };
}

/** §4.1 recipe leg (1): "alice's seat-state carries the view rider
 *  (projectionSource wired for alice ONLY)". The rider's complete bytes live
 *  in the trace block; the prose ellipsis is not the authority. */
function extractAliceView(lines: readonly TraceLine[]): SeatViewWire {
  for (const entry of lines) {
    if (entry.c !== "out" || entry.seat !== "alice" || entry.frame.kind !== "seat-state") continue;
    if (entry.frame.view !== undefined) return entry.frame.view;
  }
  throw new Error(
    "carrierTrace: no alice seat-state frame in the trace carries a `view` rider — the §4.1 recipe wires projectionSource for alice; a riderless doc breaks the replay surface",
  );
}

const trace = parseReferenceTrace();

/* ═══════════════════════ census (structure the gate owns) ═══════════════════════ */

function census(lines: readonly TraceLine[]) {
  const count = { in: 0, out: 0, resend: 0, tick: 0, drain: 0, end: 0 };
  let synthLines = 0;
  for (const entry of lines) {
    count[entry.c] += 1;
    if (entry.c === "in" && entry.synth !== null) synthLines += 1;
  }
  return { total: lines.length, ...count, synthLines };
}

/* ══════════════════════ the replay machine (§4.1 router) ══════════════════════ */

interface SeatWitness {
  readonly records: number;
  readonly lastSeen: StampWire | null;
  readonly duplicatesDropped: number;
  readonly viewPresent: boolean;
}

interface ReplaySnapshot {
  /** Every hub emission, in global fan order, seat-tagged — "s\t<bytes>". */
  readonly emissions: readonly string[];
  readonly drainCounts: readonly number[];
  readonly logLen: number;
  readonly lastStamp: StampWire | null;
  readonly ledgerJson: string;
  readonly digest: string;
  readonly faults: readonly string[];
  readonly seats: Readonly<Record<string, SeatWitness>>;
}

function tag(seat: string, raw: string): string {
  return `${seat}\u0000${raw}`;
}

/** The synchronous replay port: the hub's mailbox is the `in`-row queue; the
 *  hub's client-direction sends are captured globally (fan-order authority)
 *  AND deposited in the seat's mailbox for the real client to absorb. The
 *  hub endpoint's send() is the one door the trace never opens — clients are
 *  receive-only, so a stray client send is a bug, and bugs crash (Law 4). */
function runReplay(source: ReferenceTrace): ReplaySnapshot {
  const relay = createCoopRelay({ autoCatchUpOnJoin: false });
  const hubInbox: string[] = [];
  const emissions: string[] = [];
  const mailboxes = new Map<string, string[]>();

  const hubEndpoint: TransportEndpoint = {
    seat: null,
    send(): never {
      throw new Error("carrierTrace: the player feeds the hub ONLY through trace `in` rows — a client send means an auto-chain fired in replay (double traffic the recording never had)");
    },
    poll: () => hubInbox.splice(0, hubInbox.length),
  };

  const endpoints = new Map<string, TransportEndpoint>();
  function clientEndpoint(seat: string): TransportEndpoint {
    let endpoint = endpoints.get(seat);
    if (endpoint === undefined) {
      endpoint = {
        seat,
        send: (frame: TransportFrame): void => {
          const raw = encodeFrame(frame); // the hub's trusted frame → canonical bytes at the one boundary
          emissions.push(tag(seat, raw));
          const box = mailboxes.get(seat);
          if (box === undefined) mailboxes.set(seat, [raw]);
          else box.push(raw);
        },
        poll: () => {
          const box = mailboxes.get(seat);
          if (box === undefined || box.length === 0) return [];
          return mailboxes.get(seat)!.splice(0, box.length);
        },
      };
      endpoints.set(seat, endpoint);
    }
    return endpoint;
  }

  const port: TransportPort = { hub: hubEndpoint, client: clientEndpoint };
  const hub = attachRelayHub(relay, port, {
    pageSize: 2, // §4.1 recipe: forces the recorded two-page catch-up shape
    projectionSource: (seat: string): SeatViewWire | undefined => (seat === "alice" ? source.aliceView : undefined),
  });

  const clients = new Map<string, TransportClient>();
  function clientFor(seat: string): TransportClient {
    let client = clients.get(seat);
    if (client === undefined) {
      client = createTransportClient(port, seat);
      clients.set(seat, client);
    }
    return client;
  }

  let emittedSeen = 0;
  let pendingIn = 0;
  const drainCounts: number[] = [];

  function assertAllEmissionsRecorded(at: TraceLine, because: string): void {
    if (emittedSeen === emissions.length) return;
    const extra = emissions[emittedSeen] as string;
    fail(at.line, `${because}: the trace recorded no hub emission here but the hub emitted "${extra.slice(extra.indexOf("\u0000") + 1, extra.indexOf("\u0000") + 120)}…"`);
  }

  for (const entry of source.lines) {
    switch (entry.c) {
      case "in": {
        assertAllEmissionsRecorded(entry, "before an `in` row");
        hubInbox.push(entry.canonical); // §4.1: append canonical bytes, in line order
        pendingIn += 1;
        clientFor(entry.seat); // the seat's client exists from its first wire moment, receive-only
        break;
      }
      case "tick": {
        assertAllEmissionsRecorded(entry, "before a `tick` row");
        relay.advanceTo(BigInt(entry.t)); // §4.1: relay.advanceTo(BigInt(n)) — SimTick is plain bigint
        break;
      }
      case "drain": {
        assertAllEmissionsRecorded(entry, "before a `drain` row");
        const consumed = hub.drain();
        if (consumed !== pendingIn) {
          fail(entry.line, `drain consumed ${String(consumed)} frames but the trace fed ${String(pendingIn)} since the last drain — in/drain pairing drifted`);
        }
        drainCounts.push(consumed);
        pendingIn = 0;
        break;
      }
      case "out": {
        const next = emissions[emittedSeen];
        if (next === undefined) {
          fail(entry.line, `the trace expects an \`out\` toward "${entry.seat}" (${entry.canonical.slice(0, 120)}…) but the hub emitted nothing — a recording the real hub no longer reproduces`);
        }
        emittedSeen += 1;
        if (next !== tag(entry.seat, entry.canonical)) {
          fail(entry.line, `hub emission ${String(emittedSeen)} must equal the recorded frame\n  recorded: ${tag(entry.seat, entry.canonical)}\n  emitted:  ${next}`);
        }
        clientFor(entry.seat).drain(); // the seat absorbs live (client idempotence + ledger-copy laws)
        break;
      }
      case "resend": {
        assertAllEmissionsRecorded(entry, "before a `resend` row");
        // §4.1: deliver to the seat's mailbox WITHOUT a hub drain — the hub
        // must never see it. The inbox stays provably empty across the drop.
        const hubSawNothingBefore = hubInbox.length;
        const box = mailboxes.get(entry.seat);
        if (box === undefined) mailboxes.set(entry.seat, [entry.canonical]);
        else box.push(entry.canonical);
        clientFor(entry.seat).drain();
        if (hubSawNothingBefore !== 0 || hubInbox.length !== 0 || pendingIn !== 0) {
          fail(entry.line, "a `resend` row found hub-inbound bytes — the carrier-side re-delivery leaked into the hub");
        }
        break;
      }
      case "end": {
        assertAllEmissionsRecorded(entry, "before the `end` witness");
        break;
      }
    }
  }
  if (emittedSeen !== emissions.length) fail((source.lines[source.lines.length - 1] as TraceLine).line, "the trace ended with unconsumed hub emissions");

  const log = relay.sharedLog();
  const tail = log[log.length - 1];
  const seats: Record<string, SeatWitness> = {};
  for (const [seat, client] of clients) {
    const seen = client.lastSeen();
    seats[seat] = {
      records: client.records().length,
      lastSeen: seen === null ? null : { tick: seen.tick, seq: seen.seq },
      duplicatesDropped: client.duplicatesDropped(),
      viewPresent: client.view() !== null,
    };
  }
  return {
    emissions,
    drainCounts,
    logLen: log.length,
    lastStamp: tail === undefined ? null : { tick: tail.tick.toString(), seq: tail.seq },
    ledgerJson: JSON.stringify(ledgerToWire(relay.ledger()).seatHolders),
    digest: relay.timelineDigest(),
    faults: hub.faults().map((fault) => `${fault.against}: ${fault.cause}`),
    seats,
  };
}

/* ══════════════════════════════ the gate ══════════════════════════════ */

describe("carrier trace player — CARRIER-CONTRACT.md §4.1 is an executable gate", () => {
  it("parses the §4.1 reference trace: 57 lines, closed line-kind census, one synth marker, end line last", () => {
    const got = census(trace.lines);
    // Counts re-derived from the @7c2a13e recording; §4.5 pins frames=39 and
    // tick/drain/end=18. A deliberate scenario edit re-pins these, loudly.
    expect(got).toEqual({ total: 57, in: 11, out: 27, resend: 1, tick: 6, drain: 11, end: 1, synthLines: 1 });
    expect(got.in + got.out + got.resend).toBe(39); // §4.5 "frames=39"
    const synth = trace.lines.filter((entry): entry is FrameLine => entry.c === "in" && entry.synth !== null);
    expect(synth).toHaveLength(1);
    const leaveLine = synth[0] as FrameLine;
    expect(leaveLine.synth).toBe("auto-leave-on-close"); // §2.12: carrier authors the leave frame...
    expect(leaveLine.frame.kind).toBe("leave"); // ...and the marker must mark exactly that
    expect(leaveLine.seat).toBe("carol");
  });

  it("verification ritual (§4.5): every embedded frame round-trips the real codec byte-identical", () => {
    const drift = trace.lines
      .filter((entry): entry is FrameLine => entry.c === "in" || entry.c === "out" || entry.c === "resend")
      .filter((entry) => entry.embedded !== entry.canonical)
      .map((entry) => `line ${String(entry.line)}: doc bytes != encodeFrame(decodeFrame(doc bytes))`);
    expect(drift).toEqual([]);
  });

  it("replays every frame through the real hub — per-frame byte equality, global fan order, in/drain pairing", () => {
    const run = runReplay(trace);
    expect(run.emissions).toHaveLength(27); // every emission was consumed by an `out` row — no extras, no holes
    expect(run.drainCounts).toEqual([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]); // 11 drains, each consuming exactly its paired `in`
  });

  it("terminal witness (§4.3): logLen, lastStamp, ledger shape (omit-when-unset IS a wire fact), timelineDigest", () => {
    const run = runReplay(trace);
    const end = trace.lines[trace.lines.length - 1] as EndWitness;
    expect(end.c).toBe("end");
    expect(run.logLen).toBe(end.logLen);
    expect(run.logLen).toBe(4);
    expect(run.lastStamp).toEqual(end.lastStamp);
    expect(run.lastStamp).toEqual({ tick: "7", seq: 3 });
    // The ledger is compared as BYTES: key order, decimal-string ticks, and
    // the ABSENCE of leftAtTick on alice (omit-when-unset) all participate.
    expect(run.ledgerJson).toBe(JSON.stringify(end.ledger));
    expect(run.digest).toBe(end.timelineDigest);
    expect(run.digest).toBe(PINNED_TIMELINE_DIGEST); // hard pin: a self-healed end line cannot launder the authority
  });

  it("resends ride the client, never the hub (§4.1 leg 3): alice absorbs one duplicate, inbox unchanged", () => {
    const run = runReplay(trace);
    expect(run.seats["alice"]?.duplicatesDropped).toBe(1);
    expect(run.seats["alice"]?.records).toBe(4); // (2,0)(3,1)(4,2)(7,3) — the resend added nothing
    expect(run.seats["bob"]?.duplicatesDropped).toBe(0);
    expect(run.seats["carol"]?.duplicatesDropped).toBe(0);
  });

  it("client-side witnesses (§4.1 item 3): bob's inbox freezes at departure, carol's paged catch-up lands whole", () => {
    const run = runReplay(trace);
    expect(run.seats["bob"]?.records).toBe(3); // (2,0)(3,1)(4,2) — tick-7 fan reached alice+carol only (§2.5)
    expect(run.seats["bob"]?.lastSeen).toEqual({ tick: "4", seq: 2 });
    expect(run.seats["carol"]?.records).toBe(4); // page 1 (2,0)(3,1) + page 2 (4,2) + broadcast (7,3)
    expect(run.seats["carol"]?.lastSeen).toEqual({ tick: "7", seq: 3 });
    expect(run.seats["alice"]?.lastSeen).toEqual({ tick: "7", seq: 3 });
  });

  it("per-seat view rider: alice's seat-states carry it, bob's and carol's omit the key (§4.1 leg 1)", () => {
    expect(trace.aliceView.cells).toHaveLength(1);
    expect(trace.aliceView.cells[0]?.key).toBe("lane/ingress-1::routedExpress");
    const run = runReplay(trace);
    expect(run.seats["alice"]?.viewPresent).toBe(true);
    expect(run.seats["bob"]?.viewPresent).toBe(false);
    expect(run.seats["carol"]?.viewPresent).toBe(false);
  });

  it("the scripted scenario faults nothing: zero fault frames across the whole replay", () => {
    const run = runReplay(trace);
    expect(run.faults).toEqual([]);
  });

  it("determinism (§4.4): two independent replays are byte-identical, emission-for-emission and witness-for-witness", () => {
    const first = runReplay(trace);
    const second = runReplay(trace);
    expect(second).toEqual(first); // every field is JSON-safe: emissions are bytes, seats are numbers/strings
    expect(second.digest).toBe(PINNED_TIMELINE_DIGEST);
  });
});
