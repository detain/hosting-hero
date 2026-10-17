/**
 * `tools/transport/src/inMemory.ts` — the in-repo CARRIER: a deterministic,
 * pump-driven TransportPort over in-process mailboxes (I-T §3).
 *
 * This is not a network. It is the frame-leg of the transport proven to move
 * through a hostile-but-replayable channel: per-kind flight delays, at-least-
 * once duplicate replay, seat freezes with loss, and a Fisher-Yates shuffle
 * of each step's due batch drawn from kernel RNG (`streamFor(seed,
 * "transport/delivery", step)` — never Math.random, rejection-sampled range
 * like every other draw in the house). The out-of-repo Workerman carrier
 * implements the SAME port over real sockets; the hub/client halves never
 * know the difference — "one protocol, two carriers".
 *
 * Endpoint law (see port.ts): a TransportEndpoint is one MAILBOX. `send`
 * posts a frame into it (what the carrier just delivered to that side),
 * `poll` drains it in delivery order. The hub's mailbox is multiplexed
 * (every client writes there; participantId demultiplexes); each seat has
 * its own, and `dropUntilResume` suspends exactly those.
 *
 * Determinism law: zero timers, zero self-scheduling, zero wall-clock.
 */

import { streamFor } from "@hh/sim-core/kernel";
import { asRunSeed } from "@hh/sim-core/types";
import type { RunSeed } from "@hh/sim-core/types";
import { decodeFrame, encodeFrame } from "./codec.ts";
import type { TransportFrame, TransportFrameKind } from "./envelope.ts";
import type { DeliveryPolicy, TransportEndpoint, TransportPort, TransportSchedule } from "./port.ts";

export interface DeliveryTraceEntry {
  readonly sendId: number;
  /** null = the hub mailbox; otherwise the seat it was addressed to. */
  readonly target: string | null;
  readonly kind: TransportFrameKind;
  readonly raw: string;
}

export interface InMemoryTransportStats {
  readonly delivered: number;
  readonly dropped: number;
  readonly duplicated: number;
  readonly sent: number;
}

export interface InMemoryTransport {
  readonly port: TransportPort;
  readonly schedule: TransportSchedule;
  /** Frames still in flight (not yet due or due-but-unprocessed). */
  pending(): number;
  /** Freeze a seat's inbound channel: frames toward it drop (counted) until
   *  resumeSeat — the carrier-side loss the reconnect story rides through. */
  suspendSeat(seat: string): void;
  resumeSeat(seat: string): void;
  isSuspended(seat: string): boolean;
  /** Append-only record of every accepted send, in send order. The dup knob
   *  addresses these ids; determinism traces diff these bytes. */
  trace(): readonly DeliveryTraceEntry[];
  /** CARRIER TEST SEAM: post already-encoded bytes into a mailbox, bypassing
   *  encodeFrame — this is how a test makes the channel say things an honest
   *  producer never would (bad JSON, cross-talk, poisoned payloads). Kind is
   *  read from the bytes when decodable (delay + trace label only);
   *  undecodable bytes are labeled "fault" and take the default delay. */
  postRaw(target: string | null, raw: string): void;
  stats(): InMemoryTransportStats;
}

interface PendingItem {
  readonly dueStep: number;
  readonly sendId: number;
  readonly target: string | null;
  readonly kind: TransportFrameKind;
  readonly raw: string;
  readonly duplicate: boolean;
}

const HUB_KEY = "\u0000hub";

function mailboxKey(target: string | null): string {
  return target ?? HUB_KEY;
}

export function createInMemoryTransport(policy: DeliveryPolicy = {}): InMemoryTransport {
  const delayOf = (kind: TransportFrameKind): number => {
    const raw = policy.delayByKind?.[kind] ?? 1;
    if (!Number.isSafeInteger(raw) || raw < 1) {
      throw new Error(`transport: delayByKind.${kind} must be a safe integer >= 1, got ${String(raw)}`);
    }
    return raw;
  };
  const permutationSeed: RunSeed | undefined =
    policy.permutationSeed === undefined ? undefined : asRunSeed(policy.permutationSeed);
  const duplicateIds: ReadonlySet<number> = new Set(policy.duplicateFrameIds ?? []);

  const pending: PendingItem[] = [];
  const ready = new Map<string, string[]>();
  const suspended = new Set<string>(policy.dropUntilResume ?? []);
  const entries: DeliveryTraceEntry[] = [];
  let nextSendId = 0;
  let clock = 0;
  let delivered = 0;
  let dropped = 0;
  let duplicated = 0;

  function postParts(target: string | null, kind: TransportFrameKind, raw: string): void {
    const sendId = nextSendId;
    nextSendId += 1;
    pending.push({
      dueStep: clock + delayOf(kind),
      sendId,
      target,
      kind,
      raw,
      duplicate: duplicateIds.has(sendId),
    });
    entries.push({ sendId, target, kind, raw });
  }

  function post(target: string | null, frame: TransportFrame): void {
    postParts(target, frame.kind, encodeFrame(frame));
  }

  function postRaw(target: string | null, raw: string): void {
    let kind: TransportFrameKind = "fault"; // label for undecodable bytes — delay/trace only
    try {
      kind = decodeFrame(raw).kind;
    } catch {
      /* the point of this seam is that the channel may say junk */
    }
    postParts(target, kind, raw);
  }

  /** Shuffle a due batch with the kernel stream for (seed, this step) —
   *  Fisher-Yates over rejection-sampled range draws. Fresh stream per
   *  (step, mailbox): same seed + same step + same batch ⇒ same order. */
  function permute(items: PendingItem[], key: string): PendingItem[] {
    if (permutationSeed === undefined || items.length < 2) return items;
    const stream = streamFor(permutationSeed, "transport/delivery", clock);
    const list = [...items];
    for (let i = list.length - 1; i > 0; i -= 1) {
      const j = stream.range(i + 1);
      const head = list[i] as PendingItem;
      list[i] = list[j] as PendingItem;
      list[j] = head;
    }
    void key; // mailbox label kept for trace clarity in callers
    return list;
  }

  function step(): boolean {
    clock += 1;
    const due: PendingItem[] = [];
    for (let i = pending.length - 1; i >= 0; i -= 1) {
      const item = pending[i] as PendingItem;
      if (item.dueStep <= clock) {
        due.push(item);
        pending.splice(i, 1);
      }
    }
    if (due.length === 0) return false;
    due.sort((a, b) => a.sendId - b.sendId); // stable FIFO intake
    const byTarget = new Map<string, PendingItem[]>();
    for (const item of due) {
      const key = mailboxKey(item.target);
      const group = byTarget.get(key);
      if (group === undefined) byTarget.set(key, [item]);
      else group.push(item);
    }
    let landed = 0;
    for (const [key, group] of byTarget) {
      // Hostile delivery order is a CLIENT-channel property (see port.ts:
      // hub inbound stays FIFO — the acceptance-order law).
      const ordered = key === HUB_KEY ? group : permute(group, key);
      const seat = ordered[0]?.target ?? null;
      const frozen = seat !== null && suspended.has(seat);
      const box = ready.get(key) ?? [];
      for (const item of ordered) {
        if (frozen) {
          dropped += 1;
          continue;
        }
        box.push(item.raw);
        delivered += 1;
        landed += 1;
        if (item.duplicate) {
          box.push(item.raw); // byte-identical re-send, same due step
          delivered += 1;
          landed += 1;
          duplicated += 1;
        }
      }
      ready.set(key, box);
    }
    return landed > 0;
  }

  function drain(key: string): readonly string[] {
    const box = ready.get(key);
    if (box === undefined || box.length === 0) return [];
    ready.set(key, []);
    return box;
  }

  const hub: TransportEndpoint = {
    seat: null,
    send: (frame) => post(null, frame),
    poll: () => drain(HUB_KEY),
  };

  const clients = new Map<string, TransportEndpoint>();
  function client(seat: string): TransportEndpoint {
    let endpoint = clients.get(seat);
    if (endpoint === undefined) {
      endpoint = {
        seat,
        send: (frame) => post(seat, frame),
        poll: () => drain(mailboxKey(seat)),
      };
      clients.set(seat, endpoint);
    }
    return endpoint;
  }

  const port: TransportPort = { hub, client };

  const schedule: TransportSchedule = {
    step,
    pump(steps: number = 1): number {
      let advanced = 0;
      for (let i = 0; i < steps; i += 1) {
        if (!step()) return advanced;
        advanced += 1;
      }
      return advanced;
    },
  };

  return {
    port,
    schedule,
    pending: () => pending.length,
    suspendSeat: (seat) => void suspended.add(seat),
    resumeSeat: (seat) => void suspended.delete(seat),
    isSuspended: (seat) => suspended.has(seat),
    trace: () => Object.freeze(entries.map((entry) => Object.freeze({ ...entry }))),
    postRaw,
    stats: () => Object.freeze({ delivered, dropped, duplicated, sent: nextSendId }),
  };
}
