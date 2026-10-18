/**
 * test/carrierTrace.repro.ts — standalone trace REPRO for a human, no vitest.
 * (wave-27 item; the review follow-on on the L-TP player @df05b7c.)
 *
 * WHAT IT DOES: parses the §4.1 reference trace out of CARRIER-CONTRACT.md
 * (the same fail-loud fence discipline the test-time player uses), drives the
 * REAL relay hub (attachRelayHub + createCoopRelay) and the REAL transport
 * clients over the same synchronous replay TransportPort, prints every hub
 * emission in GLOBAL fan order (index, seat, canonical bytes), prints the
 * computed timelineDigest, and exits 0 ONLY when:
 *   - every `out` row byte-equals its hub emission, in fan order, with no
 *     holes and no extras;
 *   - every `drain` consumed exactly its paired `in` bytes;
 *   - every embedded frame round-trips the real codec byte-identical (§4.5);
 *   - the terminal `end` witness matches (logLen, lastStamp, ledger BYTES,
 *     timelineDigest);
 *   - the digest equals the fence's end line AND the hard-pinned authority
 *     literal below;
 *   - the out-frame census equals the pinned 27.
 * Any divergence prints a loud report and exits 1.
 *
 * THE DOC IS STILL THE FIXTURE: this file owns no expectations beyond the two
 * authority literals the player already hard-pins (the §4.3 digest and the
 * §4.5 frame census). Everything else is read from the fenced block at run
 * time, so a fence edit reddens here exactly as it reddens in CI.
 *
 * WHY A CLONE AND NOT AN IMPORT: the replay router lives inside
 * test/carrierTrace.test.ts as module-private code (and that file imports
 * `vitest`, which cannot load outside the runner). Extracting a shared helper
 * would mean editing either the test file or the src/ 8-file roster — both
 * off-limits to this lane (wave-27 brief). So the router below is a faithful
 * copy of the player's, with `fail`-throw seams replaced by a divergence
 * COLLECTOR so one run reports every byte diff, not just the first.
 * Wave-28 hygiene closed one fidelity drift: the §2.12 `in.synth` marker
 * validation (player :155) was missing from this parser — both arms now run
 * the same fail-loud grammar and reject the same corrupt fences.
 * LAW for future editors: this router and the player's must change together;
 * the §4.1 fence they consume is the single authority, never either file.
 *
 * RUN (from tools/transport, or via the repo root pnpm -C):
 *   node --experimental-transform-types test/carrierTrace.repro.ts
 * (the tools/headless idiom; zero deps, zero timers, zero wall-clock — time
 * moves only via `tick` rows, exactly like the player.)
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createCoopRelay } from "relay-tools";
import { createTransportClient } from "../src/client.ts";
import type { TransportClient } from "../src/client.ts";
import { decodeFrame, encodeFrame, ledgerToWire } from "../src/codec.ts";
import type { SeatHolderWire, SeatViewWire, StampWire, TransportFrame } from "../src/envelope.ts";
import type { TransportEndpoint, TransportPort } from "../src/port.ts";
import { attachRelayHub } from "../src/server.ts";

const CONTRACT_PATH = fileURLToPath(new URL("../CARRIER-CONTRACT.md", import.meta.url));
const FENCE_OPEN = "```jsonl";
const FENCE_CLOSE = "```";

/** The ONE terminal-digest witness — same hard pin as the player (§4.1/§4.3). */
const PINNED_TIMELINE_DIGEST = "de1d4c0f941333eb";
/** The pinned out-frame census — same pin the player asserts (§4.5 frames=39). */
const PINNED_OUT_FRAMES = 27;

interface FrameLine {
  readonly c: "in" | "out" | "resend";
  readonly line: number;
  readonly seat: string;
  readonly synth: string | null; // carrier-authorship marker (§2.12), in-lines only
  readonly frame: TransportFrame;
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

/* ─────────────────── fence parsing (player discipline, verbatim) ─────────────────── */

function fail(line: number, why: string): never {
  throw new Error(`carrierTrace: fence line ${String(line)} — ${why}`);
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
      fail(line, `ledger[${String(index)}] must be an object`);
    }
    const rec = entry as Record<string, unknown>;
    for (const field of ["participantId", "joinedAtTick"] as const) {
      if (typeof rec[field] !== "string") fail(line, `ledger[${String(index)}].${field} must be a decimal string`);
    }
    const left = rec["leftAtTick"];
    if (left !== undefined && typeof left !== "string") fail(line, `ledger[${String(index)}].leftAtTick must be a string or absent`);
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
    const seat = parseSeat(`${String(c)}.s`, line, rec["s"]);
    if (typeof rec["f"] !== "object" || rec["f"] === null || Array.isArray(rec["f"])) fail(line, `${String(c)}.f must be a frame object`);
    const embedded = JSON.stringify(rec["f"]);
    const frame = decodeFrame(embedded); // the REAL codec parses the recorded bytes — fail-loud on an illegal frame
    const synth = c === "in" ? (rec["synth"] ?? null) : undefined;
    if (c === "in" && synth !== null && typeof synth !== "string") fail(line, "in.synth marker must be a string");
    return { c, line, seat, synth: (synth ?? null) as string | null, frame, embedded, canonical: encodeFrame(frame) };
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
  return fail(line, `unknown line-kind "${String(c)}" — extend the §4.1 table AND the players together, never silently`);
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
  return { lines, aliceView: extractAliceView(lines) };
}

function extractAliceView(lines: readonly TraceLine[]): SeatViewWire {
  for (const entry of lines) {
    if (entry.c !== "out" || entry.seat !== "alice" || entry.frame.kind !== "seat-state") continue;
    if (entry.frame.view !== undefined) return entry.frame.view;
  }
  throw new Error(
    "carrierTrace: no alice seat-state frame in the trace carries a `view` rider — the §4.1 recipe wires projectionSource for alice; a riderless doc breaks the replay surface",
  );
}

/* ─────────── the replay machine (player router; fail → collector) ─────────── */

interface SeatWitness {
  readonly records: number;
  readonly lastSeen: StampWire | null;
  readonly duplicatesDropped: number;
  readonly viewPresent: boolean;
}

interface ReplayResult {
  readonly emissions: readonly string[];
  readonly logLen: number;
  readonly lastStamp: StampWire | null;
  readonly ledgerJson: string;
  readonly digest: string;
  readonly faults: readonly string[];
  readonly seats: Readonly<Record<string, SeatWitness>>;
  readonly divergences: readonly string[];
}

function tag(seat: string, raw: string): string {
  return `${seat}\u0000${raw}`;
}

/** Human-safe rendering of a tagged emission: the internal NUL separator must
 *  never reach a terminal. */
function showTag(t: string): string {
  const at = t.indexOf("\u0000");
  return `${t.slice(0, at)}\t${t.slice(at + 1)}`;
}

function runReplay(source: ReferenceTrace): ReplayResult {
  const divergences: string[] = [];
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

  function assertAllEmissionsRecorded(at: TraceLine, because: string): void {
    if (emittedSeen === emissions.length) return;
    const extra = emissions[emittedSeen] as string;
    divergences.push(`fence line ${String(at.line)}: ${because}: the trace recorded no hub emission here but the hub emitted "${extra.slice(extra.indexOf("\u0000") + 1, extra.indexOf("\u0000") + 120)}…"`);
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
          divergences.push(`fence line ${String(entry.line)}: drain consumed ${String(consumed)} frames but the trace fed ${String(pendingIn)} since the last drain — in/drain pairing drifted`);
        }
        pendingIn = 0;
        break;
      }
      case "out": {
        const next = emissions[emittedSeen];
        emittedSeen += 1;
        if (next === undefined) {
          divergences.push(`fence line ${String(entry.line)}: the trace expects an \`out\` toward "${entry.seat}" (${entry.canonical.slice(0, 120)}…) but the hub emitted nothing — a recording the real hub no longer reproduces`);
        } else if (next !== tag(entry.seat, entry.canonical)) {
          divergences.push(
            `fence line ${String(entry.line)}: hub emission ${String(emittedSeen)} must equal the recorded frame\n    recorded: ${showTag(tag(entry.seat, entry.canonical))}\n    emitted:  ${showTag(next)}`,
          );
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
          divergences.push(`fence line ${String(entry.line)}: a \`resend\` row found hub-inbound bytes — the carrier-side re-delivery leaked into the hub`);
        }
        break;
      }
      case "end": {
        // The terminal witness FIELDS are compared against the snapshot in
        // main (diffEndWitness); the router only owns the ordering law — no
        // unrecorded emission may be pending when the trace ends.
        assertAllEmissionsRecorded(entry, "before the `end` witness");
        break;
      }
    }
  }
  if (emittedSeen !== emissions.length) {
    divergences.push(`fence line ${String((source.lines[source.lines.length - 1] as TraceLine).line)}: the trace ended with unconsumed hub emissions (emissions ${String(emissions.length)}, consumed ${String(emittedSeen)})`);
  }

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
    logLen: log.length,
    lastStamp: tail === undefined ? null : { tick: tail.tick.toString(), seq: tail.seq },
    ledgerJson: JSON.stringify(ledgerToWire(relay.ledger()).seatHolders),
    digest: relay.timelineDigest(),
    faults: hub.faults().map((fault) => `${fault.against}: ${fault.cause}`),
    seats,
    divergences,
  };
}

/* ─────────────────────────────── the repro CLI ─────────────────────────────── */

function diffEndWitness(end: EndWitness, run: ReplayResult): string[] {
  const diffs: string[] = [];
  if (run.logLen !== end.logLen) diffs.push(`end.logLen: fence ${String(end.logLen)} vs run ${String(run.logLen)}`);
  if (JSON.stringify(run.lastStamp) !== JSON.stringify(end.lastStamp)) {
    diffs.push(`end.lastStamp: fence ${JSON.stringify(end.lastStamp)} vs run ${JSON.stringify(run.lastStamp)}`);
  }
  const fenceLedgerJson = JSON.stringify(end.ledger);
  if (run.ledgerJson !== fenceLedgerJson) diffs.push(`end.ledger (BYTES — order and key-presence are wire facts): fence ${fenceLedgerJson} vs run ${run.ledgerJson}`);
  if (run.digest !== end.timelineDigest) diffs.push(`end.timelineDigest: fence ${end.timelineDigest} vs run ${run.digest}`);
  return diffs;
}

function main(): number {
  const trace = parseReferenceTrace();
  const run = runReplay(trace);
  const end = trace.lines[trace.lines.length - 1] as EndWitness;

  const outRows = trace.lines.filter((entry): entry is FrameLine => entry.c === "out");
  console.log(`── CARRIER-CONTRACT.md §4.1 reference trace — ${String(outRows.length)} hub out-frames, global fan order ──`);
  outRows.forEach((entry, index) => {
    console.log(`${String(index + 1).padStart(2, "0")}\t${entry.seat}\t${entry.canonical}`);
  });

  const divergences = [...run.divergences, ...diffEndWitness(end, run)];
  // §4.5 verification ritual: document key order IS a wire fact — every
  // embedded frame must round-trip the real codec byte-identical.
  for (const entry of trace.lines) {
    if ((entry.c === "in" || entry.c === "out" || entry.c === "resend") && entry.embedded !== entry.canonical) {
      divergences.push(`fence line ${String(entry.line)}: doc bytes != encodeFrame(decodeFrame(doc bytes)) — §4.5 ritual violated`);
    }
  }
  if (outRows.length !== PINNED_OUT_FRAMES) {
    divergences.push(`out-frame census: fence carries ${String(outRows.length)} but the player pins ${String(PINNED_OUT_FRAMES)} (§4.5) — a deliberate scenario re-record re-pins BOTH players together, loudly`);
  }
  if (run.digest !== PINNED_TIMELINE_DIGEST) {
    divergences.push(`timelineDigest: run ${run.digest} != pinned authority ${PINNED_TIMELINE_DIGEST} (§4.3 — implementation-independent witness)`);
  }
  if (run.faults.length > 0) {
    divergences.push(`the scripted scenario faults nothing (§4.5): hub reported ${String(run.faults.length)} fault(s): ${run.faults.join(" | ")}`);
  }

  console.log("── client-side witnesses (§4.1 item 3, informational) ──");
  for (const [seat, w] of Object.entries(run.seats).sort(([a], [b]) => (a < b ? -1 : 1))) {
    console.log(`seat ${seat}\trecords=${String(w.records)}\tduplicatesDropped=${String(w.duplicatesDropped)}\tviewPresent=${String(w.viewPresent)}\tlastSeen=${JSON.stringify(w.lastSeen)}`);
  }

  console.log(`timelineDigest=${run.digest}`);
  if (divergences.length > 0) {
    console.error(`DIVERGENCE — ${String(divergences.length)} difference(s) between the §4.1 fence and the real hub:`);
    for (const d of divergences) console.error(`  - ${d}`);
    console.error("repro FAILED (exit 1)");
    return 1;
  }
  console.log(`repro PASS — ${String(outRows.length)} frames byte-equal in fan order, end witness matched, timelineDigest ${run.digest}`);
  return 0;
}

try {
  process.exitCode = main();
} catch (err) {
  console.error(`repro FAILED (fence/hub drift): ${err instanceof Error ? err.message : String(err)}`);
  process.exitCode = 1;
}
