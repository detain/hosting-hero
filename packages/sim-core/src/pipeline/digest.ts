/**
 * Canonical GameState digest — the determinism tripwire input (§3.3 replay
 * contract, §8 RISK-1, CONVENTIONS §3 "×100 byte-identical replay is a hard
 * gate").
 *
 * No platform crypto: `node:crypto`/WebCrypto would break browser⇄Node parity
 * guarantees (§3.4 "no direct platform access"), so this is a pure 128-bit
 * double-FNV-1a over a CANONICAL serialization (every map sorted by key with
 * the pinned id order; every bigint fed as its exact decimal digits; every
 * nested list in its structural order). The FOLD itself is fixed-width, not
 * exact-integer: two independent 64-bit lanes whose products wrap (the limb
 * fast path below emulates each lane as 32-bit `Math.imul` pairs, mod 2^32
 * per limb). FNV is not a cryptographic family — collisions are adversarially
 * constructible. The tripwire leans on the practical collision horizon of two
 * independent 64-bit lanes (≥2^104 for non-adversarial state churn), which is
 * ample for "×100 replay equality of CI-generated runs" and NOT a claim of
 * integrity against hostile bytes.
 *
 * LIMB FAST PATH (perf audit rec #1): the sink's 64-bit lanes run as
 * `Math.imul` 32-bit limb pairs (./digest-limbs.ts) instead of bigint — the
 * per-codepoint bigint mul was 68% of the CPU profile. Byte-identity is
 * pinned by `__tests__/digest-golden.json` (captured from the pre-port bigint
 * sink) and the differential oracle in `__tests__/digest-perf.test.ts`; if a
 * golden hex mismatches, the PORT is wrong — never the fixture.
 */

import type { GameState, HashHex, NodeRecord, ObservedCell, Unit } from "../types.ts";
import { stableSerialize } from "../observed/store.ts";
import { Sink } from "./digest-limbs.ts";

function absorbUnit(sink: Sink, unit: Unit): void {
  sink
    .text(unit.id)
    .text(unit.type)
    .int(unit.sizeCost)
    .int(unit.patienceUs)
    .text(unit.trueIntent)
    .text(unit.source.identity)
    .int(unit.source.reputation)
    .nullableText(unit.retryOf)
    .int(unit.arrivedAtTick)
    .int(unit.accumulatedLatencyUs)
    .int(unit.inspectionCostUs)
    .int(unit.confidence)
    .nullableText(unit.qosClassId)
    .nullableText(unit.waitingOn)
    .int(unit.routeHops.length);
  for (const hop of unit.routeHops) sink.text(hop);
}

function absorbNode(sink: Sink, node: NodeRecord): void {
  sink
    .text(node.id)
    .text(node.kind)
    .int(node.serviceTimeUs)
    .int(node.queueDepth)
    .text(node.shedOrder)
    .text(node.inspectionDepth)
    .text(node.discipline)
    .int(node.utilizationRho)
    .nullableText(node.dependencyNodeId)
    .int(node.slots.length);
  for (const slot of node.slots) {
    sink
      .bool(slot.occupied)
      .nullableText(slot.unitId)
      .nullableText(slot.waitingOn)
      .int(slot.releasedAtUs ?? -1n);
  }
  sink.int(node.queue.length);
  for (const q of node.queue) sink.text(q);
}

function absorbCell(sink: Sink, cell: ObservedCell<unknown>): void {
  const value: unknown = cell.value;
  if (value === null || value === undefined) sink.text("∅");
  else if (typeof value === "bigint") sink.int(value);
  else if (typeof value === "number" || typeof value === "boolean") sink.text(String(value));
  else if (typeof value === "string") sink.text(`S${value}`);
  else sink.text(`C${stableSerialize(value, 0)}`); // FIX-4: the observed store's
  // write gate already folds composites to canonical hash text, but producer
  // cells can reach GameState.observed without passing through the store —
  // the digest applies the same canonicalization so aggregate cells (objects
  // /arrays within the shallow ≤8 budget) stay replay-visible, never the old
  // constant "unsupported" blob that made every distinct composite collide.
  sink
    .int(cell.fidelity)
    .int(cell.freshnessUs)
    .int(cell.coverage)
    .int(cell.certainty)
    .text(cell.status);
}

/** Compare helper: sort by the pinned EntityId order (never localeCompare). */
function byId<T extends string>(a: T, b: T): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * Digest the WHOLE deterministic run state. Any pipeline-visible field left
 * out would let a real divergence hide — new GameState fields must be added
 * here (the digest-switch law: forgetting is a test-visible bug, not a
 * silent replay break).
 */
export function digestState(state: GameState): HashHex {
  const sink = new Sink();
  sink.text("hh-state-v1");
  sink.text(state.engineVersion);
  sink.int(state.runSeed);
  sink.text(state.ruleBookHash);
  sink.text(state.contentHashes.sheetsHash);
  for (const key of Object.keys(state.contentHashes.rulesetCardHashes).sort(byId)) {
    sink.text(key).text(state.contentHashes.rulesetCardHashes[key] ?? "");
  }
  sink.int(state.context.tick).int(state.context.minute);
  sink.int(state.context.clocks.realUs).int(state.context.clocks.simUs);
  sink.int(state.context.clocks.businessUs).int(state.context.clocks.wallUs);

  sink.int(state.cash.free).int(state.cash.restricted).int(state.cash.deferred);
  sink.int(state.cash.accountsReceivable).int(state.cash.backlog).int(state.cash.committedOut);
  sink.int(state.ledgerSeq);

  const unitIds = Array.from(state.units.keys()).sort(byId);
  sink.int(unitIds.length);
  for (const id of unitIds) {
    const unit = state.units.get(id);
    if (unit !== undefined) absorbUnit(sink, unit);
  }

  const nodeIds = Array.from(state.nodes.keys()).sort(byId);
  sink.int(nodeIds.length);
  for (const id of nodeIds) {
    const node = state.nodes.get(id);
    if (node !== undefined) absorbNode(sink, node);
  }

  const laneIds = Array.from(state.lanes.keys()).sort(byId);
  sink.int(laneIds.length);
  for (const id of laneIds) {
    const lane = state.lanes.get(id);
    if (lane === undefined) continue;
    sink.text(lane.laneId).int(lane.ratePerMin).text(lane.latencyDistributionRef).int(lane.health);
    const mixKeys = Object.keys(lane.classMix).sort(byId);
    sink.int(mixKeys.length);
    for (const key of mixKeys) sink.text(key).int(lane.classMix[key] ?? 0n);
  }

  const observedKeys = Array.from(state.observed.keys()).sort(byId);
  sink.int(observedKeys.length);
  for (const key of observedKeys) {
    const cell = state.observed.get(key);
    if (cell === undefined) continue;
    sink.text(key);
    absorbCell(sink, cell);
  }

  const contractIds = Array.from(state.contracts.keys()).sort(byId);
  sink.int(contractIds.length);
  for (const id of contractIds) {
    const c = state.contracts.get(id);
    if (c === undefined) continue;
    sink
      .text(c.id)
      .text(c.customerEntityId)
      .text(c.bundleId)
      .int(c.mrcMicroUsd)
      .int(c.tcvMicroUsd)
      .int(c.acvMicroUsd)
      .int(c.termStartMin)
      .int(c.termEndMin)
      .text(c.billingCycle)
      .int(c.sla.uptimeTarget)
      .int(c.sla.responseBudgetUs)
      .int(c.sla.creditRate)
      .int(c.sla.creditCap)
      .int(c.sla.claimWindowUs)
      .bool(c.sla.autoRenew)
      .int(c.sla.noticePeriodMin)
      .bool(c.sla.threeBreachExitRight)
      .nullableText(c.shedImmunityClassId);
  }

  sink.int(state.ruleBook.length);
  for (const card of state.ruleBook) {
    sink.text(card.id).text(card.scope.kind).nullableText(card.scope.ref).text(card.band);
    sink.int(card.upkeepMicroUsd);
    sink.int(card.when.length);
    for (const predicate of card.when) {
      sink.text(predicate.metric).text(predicate.comparator);
      const t = predicate.threshold;
      sink.text(t.kind);
      if (t.kind === "value") sink.int(t.amount).text(t.unit);
      else if (t.kind === "class-ref") sink.text(t.classId);
      else sink.text(t.name);
    }
    sink.int(card.then.length);
    for (const action of card.then) {
      sink.text(action.id).nullableText(action.runbookName).int(action.value ?? -1n);
    }
  }

  // INTENT-DOOR embeds (digest-switch law): absorbed ONLY when present, so
  // pre-door states keep byte-identical digests. Token order is the pinned
  // index order; board edges sort by id (never Map insertion order).
  if (state.hands !== undefined) {
    sink.text("hands").int(state.hands.capacity);
    for (const token of state.hands.tokens) {
      sink.int(token.index).int(token.busyUntilTick).nullableText(token.busyCauseId);
    }
  }
  if (state.board !== undefined) {
    sink.text("board").int(state.board.version);
    const edgeIds = Array.from(state.board.edges.keys()).sort(byId);
    sink.int(edgeIds.length);
    for (const id of edgeIds) {
      const edge = state.board.edges.get(id);
      if (edge === undefined) continue;
      sink.text(edge.id).text(edge.relation).text(edge.from).text(edge.to).nullableText(edge.slot);
    }
  }
  // OD-24(a) part 1 — the price-override book (digest-switch law, same embed
  // law as hands/board): absorbed ONLY when present, so every pre-pricing
  // state (all shipped goldens) keeps byte-identical digests. Composite keys
  // sort code-unit (Map insertion order NEVER read); the null effective minute
  // takes the -1 sentinel slot (business minutes are >= 0 by door refusal law).
  if (state.pricing !== undefined) {
    sink.text("pricing").int(state.pricing.version);
    const bookKeys = Array.from(state.pricing.overrides.keys()).sort(byId);
    sink.int(bookKeys.length);
    for (const key of bookKeys) {
      const rec = state.pricing.overrides.get(key);
      if (rec === undefined) continue;
      sink
        .text(rec.targetKind)
        .text(rec.targetId)
        .int(rec.newPriceMicroUsd)
        .int(rec.effectiveAtBusinessMinute ?? -1)
        .int(rec.setAtTick);
    }
  }

  // ADR-0014 #D2 — the corruption PRE-ARM book (digest-switch law, same embed
  // law as hands/board/pricing): absorbed ONLY when present, so every
  // pre-shield state (all shipped goldens) keeps byte-identical digests.
  // Node ids sort code-unit (Map insertion order NEVER read); the null
  // effective minute takes the -1 sentinel slot (business minutes are >= 0
  // by door refusal law).
  if (state.shield !== undefined) {
    sink.text("shield").int(state.shield.version);
    const shieldIds = Array.from(state.shield.entries.keys()).sort(byId);
    sink.int(shieldIds.length);
    for (const id of shieldIds) {
      const rec = state.shield.entries.get(id);
      if (rec === undefined) continue;
      sink
        .text(id)
        .int(rec.shippedAtTick)
        .int(rec.effectiveAtBusinessMinute ?? -1);
    }
  }

  // ADR-0015 (Scale 1/5) — the reserved-warmth book (digest-switch law, same
  // embed law as hands/board/pricing/shield): absorbed ONLY when present, so
  // every pre-scale state (all shipped goldens) keeps byte-identical digests.
  // Node ids sort code-unit (Map insertion order NEVER read); the null
  // effective minute takes the -1 sentinel slot (business minutes are >= 0
  // by door refusal law). baseRosterSlots is absorbed: two bookings of equal
  // reservedSlots against different authored rosters are DIFFERENT orders.
  if (state.scale !== undefined) {
    sink.text("scale").int(state.scale.version);
    const scaleIds = Array.from(state.scale.entries.keys()).sort(byId);
    sink.int(scaleIds.length);
    for (const id of scaleIds) {
      const rec = state.scale.entries.get(id);
      if (rec === undefined) continue;
      sink
        .text(id)
        .int(rec.reservedSlots)
        .int(rec.baseRosterSlots)
        .int(rec.shippedAtTick)
        .int(rec.effectiveAtBusinessMinute ?? -1);
    }
  }

  // ADR-0015 (Maintain 2/5) — the maintenance-attendance book (digest-switch
  // law, same embed law as hands/board/pricing/shield/scale): absorbed ONLY
  // when present, so every pre-maintain state (all shipped goldens) keeps
  // byte-identical digests. Node ids sort code-unit (Map insertion order
  // NEVER read); the null open edge takes the -1 sentinel slot (business
  // minutes are >= 0 by door refusal law). The book is absorbed RAW, expired
  // bands included — expiry is a READ-time law (maintainInForce); the digest
  // witnesses what was booked, and pruning would rewrite history.
  if (state.maintain !== undefined) {
    sink.text("maintain").int(state.maintain.version);
    const maintainIds = Array.from(state.maintain.entries.keys()).sort(byId);
    sink.int(maintainIds.length);
    for (const id of maintainIds) {
      const rec = state.maintain.entries.get(id);
      if (rec === undefined) continue;
      sink
        .text(id)
        .int(rec.openAtBusinessMinute ?? -1)
        .int(rec.closeAtBusinessMinute)
        .int(rec.shippedAtTick);
    }
  }

  // ADR-0015 (Schedule 2/5) — the backup job-window book (digest-switch law,
  // same embed law as the other door books): absorbed ONLY when present, so
  // every pre-schedule state (all shipped goldens) keeps byte-identical
  // digests. Node ids sort code-unit; the null open edge takes the -1
  // sentinel. Raw like maintain: expired bands stay in the witness.
  if (state.schedule !== undefined) {
    sink.text("schedule").int(state.schedule.version);
    const scheduleIds = Array.from(state.schedule.entries.keys()).sort(byId);
    sink.int(scheduleIds.length);
    for (const id of scheduleIds) {
      const rec = state.schedule.entries.get(id);
      if (rec === undefined) continue;
      sink
        .text(id)
        .int(rec.openAtBusinessMinute ?? -1)
        .int(rec.closeAtBusinessMinute)
        .int(rec.shippedAtTick);
    }
  }

  // ADR-0015 3/5 (Sell) — the sell-offer book (digest-switch law, same embed
  // law as the other door books): absorbed ONLY when present, so every
  // pre-sell state (all shipped goldens) keeps byte-identical digests.
  // Composite `<kind>:<id>` keys sort code-unit (Map insertion order NEVER
  // read); like pricing the RECORD fields carry the identity (.text kind +
  // id — the key is derived data, never absorbed), the integer µ$ offer
  // rides the bigint sink exactly like an economy money amount, and the null
  // effective edge takes the -1 sentinel. Raw like maintain: superseded-by-
  // LWW history is what a digest witnesses.
  if (state.sell !== undefined) {
    sink.text("sell").int(state.sell.version);
    const sellKeys = Array.from(state.sell.entries.keys()).sort(byId);
    sink.int(sellKeys.length);
    for (const key of sellKeys) {
      const rec = state.sell.entries.get(key);
      if (rec === undefined) continue;
      sink
        .text(rec.targetKind)
        .text(rec.targetId)
        .int(rec.offerPriceMicroUsd)
        .int(rec.termMonths)
        .int(rec.shippedAtTick)
        .int(rec.effectiveAtBusinessMinute ?? -1);
    }
  }

  // ADR-0015 5/5 NEGOTIATE — the optional negotiate-terms book (digest-switch
  // law, same embed law as the others): absorbed ONLY when present, so every
  // pre-negotiate state (all shipped goldens) keeps byte-identical digests.
  // Composite `<kind>:<id>` keys sort code-unit (insertion order NEVER read);
  // like sell the key is derived data and the RECORD fields carry the
  // identity — the tone rides as TEXT (§7.6: it is load-bearing play, not
  // decoration), the concession is the one place null vs a booked 0n must
  // stay DISTINCT ("no money" vs "we will not move on price"), and because
  // the door's `bad-concession` law refuses negatives the -1 null-sentinel
  // is unambiguous. Raw like sell: superseded-by-LWW history is what a
  // digest witnesses.
  if (state.negotiate !== undefined) {
    sink.text("negotiate").int(state.negotiate.version);
    const negotiateKeys = Array.from(state.negotiate.entries.keys()).sort(byId);
    sink.int(negotiateKeys.length);
    for (const key of negotiateKeys) {
      const rec = state.negotiate.entries.get(key);
      if (rec === undefined) continue;
      sink
        .text(rec.targetKind)
        .text(rec.targetId)
        .text(rec.tone)
        .int(rec.concessionMicroUsd ?? -1)
        .int(rec.termMonthsExtension ?? -1)
        .int(rec.shippedAtTick)
        .int(rec.effectiveAtBusinessMinute ?? -1);
    }
  }

  // ADR-0015 session-6 ISOLATE — the optional isolate-node fence book
  // (digest-switch law, same embed law as the others): absorbed ONLY when
  // present, so every pre-isolate state (all shipped goldens) keeps
  // byte-identical digests. Node ids sort code-unit (Map insertion order
  // NEVER read); both minute edges take the -1 null-sentinel and the door's
  // >= 0 law keeps the sentinel unambiguous (an explicit 0 = booked minute
  // 0, never "null"). Raw like maintain/sell: expired rows stay in the book
  // as history witness (read-time expiry in pipeline/isolation.ts), and
  // superseded-by-LWW windows are exactly the history a digest witnesses.
  if (state.isolate !== undefined) {
    sink.text("isolate").int(state.isolate.version);
    const isolateKeys = Array.from(state.isolate.entries.keys()).sort(byId);
    sink.int(isolateKeys.length);
    for (const key of isolateKeys) {
      const rec = state.isolate.entries.get(key);
      if (rec === undefined) continue;
      sink
        .text(key)
        .int(rec.shippedAtTick)
        .int(rec.effectiveAtBusinessMinute ?? -1)
        .int(rec.releaseAtBusinessMinute ?? -1);
    }
  }

  // OD-6(a)/OD-4a — the ATTENTION denomination (digest-switch law, same embed
  // law as hands/board/pricing): absorbed ONLY when present, so every
  // pre-attention state (all shipped goldens) keeps byte-identical digests.
  // Token order is the pinned index order; the loan ledger is APPEND-order
  // (the creation-event history — never sorted, its sequence is the record).
  if (state.attention !== undefined) {
    sink
      .text("attention")
      .int(state.attention.capacity)
      .int(state.attention.debt)
      .int(state.attention.window)
      .int(state.attention.lastReplenishBusinessMinute);
    // Token COUNT is explicit here (unlike the fixed-`capacity` hands rail —
    // attention materializes only as loans mint, so length varies).
    sink.int(state.attention.tokens.length);
    for (const token of state.attention.tokens) {
      sink.int(token.index).int(token.busyUntilTick).nullableText(token.busyCauseId);
    }
    sink.int(state.attention.loanLedger.length);
    for (const row of state.attention.loanLedger) {
      sink
        .int(row.createdAtMinute)
        .text(row.kind)
        .int(row.repayAtWindow)
        .bool(row.repaid);
    }
  }

  // §7.7 — the RECOVERY slice (digest-switch law, same embed law as
  // hands/board/pricing/attention): absorbed ONLY when present, so every
  // pre-recovery state (all shipped goldens) keeps byte-identical digests.
  // Both maps sort code-unit on the node id (insertion order NEVER read);
  // the window record is the full countdown + restoration arithmetic.
  if (state.recovery !== undefined) {
    sink.text("recovery");
    const windowIds = Array.from(state.recovery.windows.keys()).sort(byId);
    sink.int(windowIds.length);
    for (const id of windowIds) {
      const window = state.recovery.windows.get(id);
      if (window === undefined) continue;
      sink
        .text(window.nodeId)
        .text(window.phase)
        .int(window.openedAtMinute)
        .int(window.closesAtMinute)
        .int(window.lockUntilMinute)
        .int(window.strikes)
        .int(window.fullSlots)
        .int(window.effectiveSlots);
    }
    const episodeIds = Array.from(state.recovery.lastStruggleMinute.keys()).sort(byId);
    sink.int(episodeIds.length);
    for (const id of episodeIds) {
      const at = state.recovery.lastStruggleMinute.get(id);
      if (at === undefined) continue;
      sink.text(id).int(at);
    }
  }

  // §3.1 corrupts-mode — the CORRUPTION slice (digest-switch law, same embed
  // law as hands/board/pricing/attention/recovery): absorbed ONLY when
  // present, so every pre-corruption state (all shipped goldens) keeps
  // byte-identical digests. Mark ids sort code-unit (insertion order NEVER
  // read); the boolean is the exhaustion die's verdict (true = the completed
  // response will corrupt); the lifetime count closes the ledger.
  if (state.corruption !== undefined) {
    sink.text("corruption");
    const markIds = Array.from(state.corruption.marks.keys()).sort(byId);
    sink.int(markIds.length);
    for (const id of markIds) {
      sink.text(id).bool(state.corruption.marks.get(id) === true);
    }
    sink.int(state.corruption.corruptedCount);
  }

  return sink.hex() as HashHex;
}
