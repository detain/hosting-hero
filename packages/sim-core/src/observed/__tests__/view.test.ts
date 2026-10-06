import { describe, expect, it } from "vitest";

import type { EntityId } from "../../types";
import { asEntityId, asRunSeed } from "../../types";
import { FIXED_ONE, fromRatio } from "../../kernel/fixed";
import { MICROS_PER_MIN } from "../../kernel/time";
import { streamFor } from "../../kernel/rng";
import { CLASS_GRAPHS_30S, CLASS_HEALTHCHECK } from "../instrument";
import { ObservedStore, parseKeyEntity, parseKeyProperty, stableSerialize } from "../store";
import {
  asSeatId,
  entityScope,
  estateScope,
  observedView,
  projectSeat,
  propertyScope,
} from "../view";
import { ground, groundInChannel, honestBinding, instrument, key, misBoundBinding, sec } from "./fixtures";

const SEAT_APP = asSeatId("seat:app");
const SEAT_NET = asSeatId("seat:network");

const APP = asEntityId("app-1");
const DB = asEntityId("db-1");
const EDGE = asEntityId("edge-1");

/** A three-machine estate: app-1 instrumented, db-1 half-blind + a Pulse
 *  Strip truth key, edge-1 entirely uninstrumented. */
function buildEstate(): ObservedStore {
  const store = new ObservedStore();
  store.applyObservedWrites(
    [
      ground(key(APP, "cpu"), 20n, 0n),
      ground(key(APP, "latency"), 300n, 0n),
      ground(key(DB, "cpu"), 40n, 0n),
      ground(key(DB, "up"), 0n, 0n, ), // DB is DOWN — ground truth
      ground(key(EDGE, "cpu"), 55n, 0n),
    ],
    0n,
  );
  // groundInChannel: make DB's "up" a Pulse Strip fairness key instead —
  // redo as a single channel-bearing patch (channel is sticky metadata):
  store.applyObservedWrites([groundInChannel(key(DB, "up"), 0n, 0n, "pulse-strip")], 0n);
  store.applyObservedWrites(
    [
      instrument(honestBinding(key(APP, "cpu"), CLASS_GRAPHS_30S)),
      instrument(misBoundBinding(key(APP, "latency"), key(APP, "cpu"), CLASS_GRAPHS_30S)),
      instrument(honestBinding(key(DB, "cpu"), CLASS_HEALTHCHECK, fromRatio(1n, 2n))),
    ],
    0n,
  );
  store.applyObservedWrites([], sec(10));
  return store;
}

describe("observed_view(seat): per-consumer projection (§3.1 laws 1–2)", () => {
  it("an entity-scoped seat sees its machines IN FULL — including known-unknowns — and nothing else", () => {
    const store = buildEstate();
    const view = projectSeat(store, entityScope(SEAT_APP, [APP]));
    const keys = [...view.keys()].sort();
    expect(keys).toEqual([key(APP, "cpu"), key(APP, "latency")].sort());
    // fog-filtered, exactly what the store itself reports:
    expect(view.get(key(APP, "cpu"))).toEqual(store.read(key(APP, "cpu")));
    // Mis-bound latency is projected AS the cpu reading — the seat's problem
    // to discover, structurally invisible in the wire format:
    expect(view.get(key(APP, "latency"))?.value).toBe(20n);
    // Uninstrumented DB / EDGE never appear — not even as "?" keys (co-op:
    // "no player may ever see the whole board", enforced by protocol).
    for (const k of view.keys()) {
      expect([DB, EDGE]).not.toContain(parseKeyEntity(k));
    }
  });

  it("a property-scoped Analyst sees one metric of everything, and zero topology", () => {
    const store = buildEstate();
    const view = projectSeat(store, propertyScope(SEAT_NET, ["cpu"]));
    expect([...view.keys()].sort()).toEqual([key(APP, "cpu"), key(DB, "cpu"), key(EDGE, "cpu")].sort());
    // EDGE stays unknown even through the wide scope — scope is about keys,
    // never a backdoor around coverage:
    expect(view.get(key(EDGE, "cpu"))?.status).toBe("unknown");
    expect(view.get(key(EDGE, "cpu"))?.value).toBeNull();
  });

  it("fairness channels project always-truth, but stay scope-filtered", () => {
    const store = buildEstate();
    const dbSeat = projectSeat(store, entityScope(asSeatId("seat:noc"), [DB]));
    const up = dbSeat.get(key(DB, "up"));
    expect(up?.value).toBe(0n); // bounded fog: WHETHER you have a problem is never hidden
    expect(up?.status).toBe("live");
    expect(up?.certainty).toBe(FIXED_ONE);
    const appSeat = projectSeat(store, entityScope(SEAT_APP, [APP]));
    expect(appSeat.has(key(DB, "up"))).toBe(false); // but it is not EVERY seat's truth
  });

  it("estate scope = every known key, unknowns included (the SP degenerate case)", () => {
    const store = buildEstate();
    const view = projectSeat(store, estateScope(SEAT_APP));
    expect(view.size).toBe(5);
    expect(store.unknownKeys()).toContain(key(EDGE, "cpu"));
    expect(view.get(key(EDGE, "cpu"))?.status).toBe("unknown"); // …and stays unknown — scope ≠ sight
  });

  it("observedView routes every consumer kind through the one projection path", () => {
    const store = buildEstate();
    const scope = entityScope(SEAT_NET, [DB, EDGE]);
    for (const kind of ["seat", "local-player", "renderer", "policy-interpreter", "headless-analyst"] as const) {
      expect(observedView(store, { kind, scope })).toEqual(projectSeat(store, scope));
    }
  });

  it("round-trips properties containing '::' (key format single-sourced from types.ts)", () => {
    const store = new ObservedStore();
    const weird = key(APP, "sensor::bay 3");
    store.applyObservedWrites([ground(weird, 9n, 0n)], 0n);
    expect(store.propertiesOf(APP)).toContain("sensor::bay 3");
    const view = projectSeat(store, estateScope(SEAT_APP));
    expect(parseKeyProperty(weird)).toBe("sensor::bay 3");
    expect(view.has(weird)).toBe(true);
  });
});

describe("observed_view leak property test (§3.1 law 2 / §8 RISK-9: CI-forever fixture)", () => {
  const PROPS = ["cpu", "latency", "health", "up"];
  const ENTITIES: readonly EntityId[] = [0, 1, 2, 3, 4, 5].map((i) => asEntityId(`ent-${i}`));

  /** 60 seeded worlds × random scopes. Invariants asserted ∀ runs:
   *  1. no out-of-scope KEY ever projects (existence fog for foreign seats),
   *  2. no out-of-scope ground MARKER value ever projects (values cannot ride
   *     in through bindings or fairness channels — fixture keeps bindings
   *     intra-entity, matching subsystem-ownership scope semantics),
   *  3. every in-scope known key DOES project (no silent under-reporting),
   *  4. in-scope readings equal the store's own fog-filtered cells. */
  for (let run = 0; run < 60; run += 1) {
    it(`seed ${run}: projection never leaks out-of-scope ground`, () => {
      const rng = streamFor(asRunSeed(BigInt(run) * 7919n + 13n), "observed/leak-test", 0, null);
      const store = new ObservedStore();

      // Ground: every (entity × property) gets a UNIQUE marker value.
      const markers = new Map<string, bigint>();
      const records = [];
      let marker = 1_000_000n;
      for (const entity of ENTITIES) {
        for (const property of PROPS) {
          marker += 1n;
          markers.set(`${entity}::${property}`, marker);
          records.push(ground(key(entity, property), marker, 0n));
        }
      }
      // A few fairness channels.
      for (const entity of ENTITIES) {
        if (rng.range(3) === 0) records.push(groundInChannel(key(entity, "up"), marker + 77n, 0n, "pulse-strip"));
      }
      store.applyObservedWrites(records, 0n);

      // Bindings — intra-entity only (a shared cross-seat probe would be a
      // CONFIGURATION bridge; scopes partition by subsystem, §4.5 R21).
      for (const entity of ENTITIES) {
        for (const property of PROPS) {
          const roll = rng.range(10);
          if (roll < 5) {
            const cls = roll % 2 === 0 ? CLASS_GRAPHS_30S : CLASS_HEALTHCHECK;
            const coverage = roll % 3 === 0 ? FIXED_ONE : fromRatio(1n, 4n);
            store.applyObservedWrites([instrument(honestBinding(key(entity, property), cls, coverage))], 0n);
          } else if (roll < 7) {
            const other = PROPS[rng.range(PROPS.length)] ?? "cpu";
            store.applyObservedWrites([instrument(misBoundBinding(key(entity, property), key(entity, other), CLASS_GRAPHS_30S))], 0n);
          }
        }
      }
      store.applyObservedWrites([], MICROS_PER_MIN);

      // Random seat scope: 1–3 entities.
      const count = 1 + rng.range(3);
      const entities: EntityId[] = [];
      for (let i = 0; i < count; i += 1) {
        const pick = ENTITIES[rng.range(ENTITIES.length)];
        if (pick !== undefined && !entities.includes(pick)) entities.push(pick);
      }
      const scope = entityScope(asSeatId(`seat-${run}`), entities);
      const view = projectSeat(store, scope);

      // (1) + (3): key set equality against the store's public registry ∩ scope.
      const expectedKeys = new Set<string>();
      for (const entity of ENTITIES) {
        if (!entities.includes(entity)) continue;
        for (const property of store.propertiesOf(entity)) expectedKeys.add(`${entity}::${property}`);
      }
      expect(new Set([...view.keys()].sort())).toEqual(expectedKeys);

      // (2): out-of-scope markers are absent from every projected value.
      const projectedText = [...view.entries()]
        .map(([k, c]) => `${k}=${stableSerialize(c.value, 0)}`)
        .sort()
        .join(";");
      for (const entity of ENTITIES) {
        if (entities.includes(entity)) continue;
        for (const property of PROPS) {
          const markerValue = markers.get(`${entity}::${property}`);
          expect(markerValue).toBeDefined();
          expect(projectedText).not.toContain(`${markerValue}n`);
        }
      }

      // (4): in-scope non-fairness readings are the store's own cells.
      for (const [k, cell] of view) {
        if (store.fairnessChannelOf(k) === null) expect(cell).toEqual(store.read(k));
      }
    });
  }
});
