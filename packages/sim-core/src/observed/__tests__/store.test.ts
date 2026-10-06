import { describe, expect, it } from "vitest";

import { FIXED_ONE, FIXED_ZERO, fromRatio } from "../../kernel/fixed";
import { advanceClocks, initialClocks, MICROS_PER_MIN, MICROS_PER_SEC, simMinuteOf } from "../../kernel/time";
import { asCauseId, ResolutionBand } from "../../types";
import {
  CLASS_GRAPHS_5MIN,
  CLASS_HEALTHCHECK,
  CLASS_PACKET_TAP,
  CLASS_TRACING,
  byHandDiagnosisUs,
} from "../instrument";
import { ObservedStore, stableSerialize } from "../store";
import { CAUSE, ground, groundInChannel, honestBinding, instrument, key, misBoundBinding, sec } from "./fixtures";

describe("ObservedStore: the step-12 single writer (§7.13)", () => {
  it("uninstrumented property yields a null-coverage cell — NOT zero", () => {
    const store = new ObservedStore();
    store.applyObservedWrites([ground(key("web-1", "cpu"), 999n, 0n)], 0n);
    const cell = store.read(key("web-1", "cpu"));
    expect(cell.value).toBeNull(); // ground 999 is unreachable without an instrument
    expect(cell.coverage).toBe(FIXED_ZERO);
    expect(cell.certainty).toBe(FIXED_ZERO);
    expect(cell.status).toBe("unknown");
    expect(cell.fidelity).toBe(ResolutionBand.None);
  });

  it("ground truth stays write-gated: the batch watermark refuses out-of-order mutation", () => {
    const store = new ObservedStore();
    store.applyObservedWrites([ground(key("web-1", "cpu"), 1n, sec(10))], sec(10));
    expect(() => store.applyObservedWrites([ground(key("web-1", "cpu"), 2n, sec(5))], sec(5))).toThrow(
      /older than watermark/,
    );
    expect(() => store.applyObservedWrites([ground(key("web-1", "cpu"), 2n, sec(99))], sec(20))).toThrow(
      /future/,
    );
    // And the refused poison left the store untouched (atomic batch):
    expect(store.read(key("web-1", "cpu")).status).toBe("unknown");
  });

  it("direct ground write / read is TYPE-impossible and RUNTIME-unreachable", () => {
    // Why type-impossible: (a) `#ground` is an ECMAScript private field — not
    // a property slot, so no enumeration, Proxy, or Object.assign can reach
    // it; (b) the public signature set contains NO mutator other than
    // applyObservedWrites and NO accessor whose return type carries a ground
    // value (read → ObservedCell, hasKey → boolean, propertiesOf → names of
    // keys: existence only). The lines below are the compile-time proof —
    // each @ts-expect-error must stay an error.
    const store = new ObservedStore();
    // @ts-expect-error no such public API exists on the store
    void store.writeGround;
    // @ts-expect-error no such public API exists on the store
    void store.setCell;

    // Runtime proof: ES private fields are not property slots at all — even
    // the classic string-key escape finds nothing (`store.#ground` cannot
    // even be written outside the class: syntax error by design).
    const slots = store as unknown as Record<string, unknown>;
    expect(slots["#ground"]).toBeUndefined();
    expect(slots["ground"]).toBeUndefined();
    expect(slots["_ground"]).toBeUndefined();
    expect(Object.getOwnPropertyNames(store)).not.toContain("#ground");
    const publicMutators = Object.getOwnPropertyNames(Object.getPrototypeOf(store) as object).filter(
      (name) => name !== "constructor" && /^(apply|set|write|push|put|patch|update)/.test(name),
    );
    expect(publicMutators).toEqual(["applyObservedWrites"]);
  });

  it("explicit ObservedWrite for a bound key wins that tick; derivation resumes the next", () => {
    const store = new ObservedStore();
    const cpu = key("web-1", "cpu");
    store.applyObservedWrites([ground(cpu, 5n, 0n), instrument({ ...honestBinding(cpu, CLASS_TRACING), coverage: FIXED_ZERO })], 0n);
    expect(store.read(cpu).status).toBe("unknown"); // coverage-0 binding derives nothing

    store.applyObservedWrites(
      [
        {
          key: cpu,
          causeId: CAUSE,
          cell: {
            value: 42n,
            fidelity: ResolutionBand.Coarse,
            freshnessUs: 0n,
            coverage: FIXED_ONE,
            certainty: FIXED_ONE,
            status: "live",
          },
        },
      ],
      sec(1),
    );
    expect(store.read(cpu).value).toBe(42n);
    expect(store.causeOf(cpu)).toBe(CAUSE);

    store.applyObservedWrites([], sec(2)); // empty batch re-runs derivation: fog returns
    expect(store.read(cpu).value).toBeNull();
    expect(store.causeOf(cpu)).toBe(asCauseId("step12/instrument/tracing:web-1::cpu"));
    // The override was still a real observation → retained at its band:
    expect(store.history(cpu, ResolutionBand.Coarse).map((p) => p.value)).toContain(42n);
  });

  it("toObservedMap snapshots GameState.observed without leaking later mutations", () => {
    const store = new ObservedStore();
    const cpu = key("web-1", "cpu");
    store.applyObservedWrites([ground(cpu, 1n, 0n), instrument(honestBinding(cpu, CLASS_TRACING))], 0n);
    const snapshot = store.toObservedMap();
    store.applyObservedWrites([ground(cpu, 2n, sec(60))], sec(60));
    store.applyObservedWrites([], sec(120)); // lag (5 s) fully past: the twin value lands
    expect(snapshot.get(cpu)?.value).toBe(1n); // host-held snapshot is frozen in time
    expect(store.read(cpu).value).toBe(2n);
  });
});

describe("ObservedStore: freshness watermarks across clock speeds (§4.1 R-20…R-31)", () => {
  it("1× and 4× drivers produce identical observed watermarks for the same sim trace", () => {
    // The store only ever sees sim µs; the driver decides how fast sim µs
    // arrive. Same sim timeline ⇒ same cells, regardless of real-time pace.
    const build = (speed: 1 | 4): ObservedStore => {
      const store = new ObservedStore();
      const cpu = key("web-1", "cpu");
      store.applyObservedWrites([ground(cpu, 10n, 0n), instrument(honestBinding(cpu, CLASS_GRAPHS_5MIN))], 0n);
      let clocks = initialClocks();
      // 10 real minutes of wall progress: at 1× sim=600 min; at 4× we shrink
      // real deltas so the SIM trace stays identical (speed gates the driver,
      // the pipeline is stepped by sim time).
      for (let i = 1; i <= 10; i += 1) {
        clocks = advanceClocks(clocks, { realElapsedUs: (60n * MICROS_PER_SEC) / BigInt(speed), speed, incident: false });
        const simUs = clocks.simUs;
        store.applyObservedWrites([ground(cpu, BigInt(10 + i), simUs)], simUs);
      }
      return store;
    };
    const slow = build(1);
    const fast = build(4);
    const cpu = key("web-1", "cpu");
    expect(slow.read(cpu)).toEqual(fast.read(cpu));
    expect(slow.digest()).toBe(fast.digest());
    expect(simMinuteOf({ realUs: 0n, simUs: slow.tickWatermarkUs, businessUs: 0n, wallUs: 0n })).toBe(
      simMinuteOf({ realUs: 0n, simUs: fast.tickWatermarkUs, businessUs: 0n, wallUs: 0n }),
    );
  });

  it("live → stale flip uses the class horizon on SIM time, and freshness reports sample age", () => {
    const store = new ObservedStore();
    const cpu = key("web-1", "cpu");
    store.applyObservedWrites([ground(cpu, 7n, 0n), instrument(honestBinding(cpu, CLASS_GRAPHS_5MIN))], 0n);

    // One sim minute later: newest visible sample is t=0, age 60 s ≤ staleAfter 180 s → live.
    store.applyObservedWrites([], MICROS_PER_MIN);
    let cell = store.read(cpu);
    expect(cell.status).toBe("live");
    expect(cell.value).toBe(7n);
    expect(cell.freshnessUs).toBe(MICROS_PER_MIN);

    // Five minutes later with no new ground: age 300 s > 180 s → stale, value kept.
    store.applyObservedWrites([], 5n * MICROS_PER_MIN);
    cell = store.read(cpu);
    expect(cell.status).toBe("stale");
    expect(cell.value).toBe(7n);
    expect(cell.freshnessUs).toBe(5n * MICROS_PER_MIN);
    expect(store.coverageSummary().staleProperties).toBe(1);
  });

  it("lag sampling reads the value the graph COULD have shown 45 s ago — not the live truth", () => {
    const store = new ObservedStore();
    const cpu = key("web-1", "cpu");
    store.applyObservedWrites([ground(cpu, 1n, 0n), instrument(honestBinding(cpu, CLASS_GRAPHS_5MIN))], 0n);
    store.applyObservedWrites([ground(cpu, 666n, sec(50))], sec(50)); // truth just moved
    store.applyObservedWrites([], sec(60)); // graph at t=60 sees t=15 → old value
    expect(store.read(cpu).value).toBe(1n);
    store.applyObservedWrites([], sec(95)); // t−45 = 50 → the new value arrives, 45 s late
    expect(store.read(cpu).value).toBe(666n);
  });
});

describe("ObservedStore: wrongness channel — green while ground fails (§7.6)", () => {
  it("a health check bound to the wrong source reports healthy forever", () => {
    const store = new ObservedStore();
    const health = key("db-1", "health");
    const processAlive = key("db-1", "process-alive");

    for (let minute = 0n; minute < 10n; minute += 1n) {
      const t = minute * MICROS_PER_MIN;
      store.applyObservedWrites(
        [
          ground(health, 0n, t), // GROUND: failing (0 = unhealthy)
          ground(processAlive, 1n, t), // GROUND: process still sup
        ],
        t,
      );
    }
    store.applyObservedWrites([instrument(misBoundBinding(health, processAlive, CLASS_HEALTHCHECK))], 10n * MICROS_PER_MIN);
    for (let minute = 11n; minute <= 20n; minute += 1n) {
      const t = minute * MICROS_PER_MIN;
      store.applyObservedWrites([ground(health, 0n, t), ground(processAlive, 1n, t)], t);
    }

    const observed = store.read(health);
    expect(observed.value).toBe(1n); // green
    expect(observed.status).toBe("live");
    expect(observed.certainty).toBe(fromRatio(95n, 100n)); // confidently wrong
    // The true 0n is unreachable: no cell, no history, no summary field carries it.
    expect(store.history(health, ResolutionBand.Medium).every((p) => p.value !== 0n)).toBe(true);
    expect(store.bindingFor(health)?.misBound).toBe(true);
    expect(() => store.sitePreview(health)).toThrow(/not authored/); // no fairness backdoor either
  });
});

describe("ObservedStore: fog grades, known-unknowns, coverage HUD (§7.6 refinement 2)", () => {
  const buildMixed = (): ObservedStore => {
    const store = new ObservedStore();
    const cpu = key("web-1", "cpu");
    const latency = key("web-1", "latency");
    const disk = key("db-1", "disk");
    store.applyObservedWrites([ground(cpu, 1n, 0n), ground(latency, 2n, 0n), ground(disk, 3n, 0n)], 0n);
    store.applyObservedWrites([instrument(honestBinding(cpu, CLASS_TRACING)), instrument(honestBinding(latency, CLASS_TRACING))], 0n);
    store.applyObservedWrites([], 10n * MICROS_PER_MIN); // both samples now stale
    store.applyObservedWrites([ground(cpu, 5n, 11n * MICROS_PER_MIN)], 11n * MICROS_PER_MIN);
    store.applyObservedWrites([], 11n * MICROS_PER_MIN + 10n * MICROS_PER_SEC); // lag opens onto the fresh sample
    return store;
  };

  it("three grades coexist per-property on one entity", () => {
    const store = buildMixed();
    expect(store.read(key("web-1", "cpu")).status).toBe("live");
    expect(store.read(key("web-1", "latency")).status).toBe("stale");
    expect(store.read(key("db-1", "disk")).status).toBe("unknown");
  });

  it("known-unknowns are enumerable — fog over state, never existence", () => {
    const store = buildMixed();
    expect(store.hasKey(key("db-1", "disk"))).toBe(true);
    expect(store.propertiesOf(store.knownEntities().find((e) => e === "db-1") ?? ("db-1" as never))).toContain("disk");
    expect(store.unknownKeys()).toContain(key("db-1", "disk"));
    const summary = store.coverageSummary();
    expect(summary.totalProperties).toBe(3);
    expect(summary.unknownProperties).toBe(1);
    expect(summary.coverageRatio).toBe(fromRatio(2n, 3n));
  });

  it("partial coverage (1-in-20) discounts certainty, not existence", () => {
    const store = new ObservedStore();
    const cpu = key("web-1", "cpu");
    store.applyObservedWrites(
      [ground(cpu, 3n, 0n), instrument(honestBinding(cpu, CLASS_TRACING, fromRatio(1n, 20n)))],
      0n,
    );
    const cell = store.read(cpu);
    expect(cell.status).toBe("live");
    expect(cell.coverage).toBe(fromRatio(1n, 20n));
    expect(cell.certainty).toBe(fromRatio(45n, 1000n)); // 0.9 × 0.05 = 0.045
  });
});

describe("ObservedStore: bounded-fog fairness (§7.6 rule 1/3)", () => {
  it("site-preview / pulse-strip keys are exempt from degradation; others refuse the channel", () => {
    const store = new ObservedStore();
    const up = key("web-1", "up");
    const other = key("web-1", "cpu");
    store.applyObservedWrites(
      [groundInChannel(up, 0n, 0n, "pulse-strip"), ground(other, 9n, 0n)],
      0n,
    );
    // Normal channel stays fully fogged (no instrument purchased):
    expect(store.read(up).status).toBe("unknown");
    // The fairness channel tells the truth anyway — "you can always find out
    // WHETHER you have a problem":
    const strip = store.pulseStrip(up);
    expect(strip.value).toBe(0n);
    expect(strip.status).toBe("live");
    expect(strip.certainty).toBe(FIXED_ONE);
    expect(strip.freshnessUs).toBe(0n);
    expect(store.fairnessChannelOf(up)).toBe("pulse-strip");
    expect(() => store.pulseStrip(other)).toThrow(/not authored/);
    expect(() => store.sitePreview(up)).toThrow(/not authored/); // wrong channel = authoring bug, fail loud
  });

  it("a second channel declaration on the same property is refused", () => {
    const store = new ObservedStore();
    const up = key("web-1", "up");
    store.applyObservedWrites([groundInChannel(up, 1n, 0n, "pulse-strip")], 0n);
    expect(() => store.applyObservedWrites([groundInChannel(up, 1n, 0n, "site-preview")], 0n)).toThrow(/already authored/);
  });

  it("by-hand diagnosis costs time and changes NOTHING about the cells (time, never certainty)", () => {
    const store = new ObservedStore();
    const cpu = key("web-1", "cpu");
    store.applyObservedWrites([ground(cpu, 4n, 0n)], 0n);
    const before = store.read(cpu);
    const beforeDigest = store.digest();

    const hoursNeeded = byHandDiagnosisUs(MICROS_PER_SEC * 60n, 8); // 8 × 1-min probe
    expect(hoursNeeded).toBe(8n * MICROS_PER_MIN);

    expect(store.read(cpu)).toEqual(before);
    expect(store.digest()).toBe(beforeDigest); // zero state churn — the toll is hands-time only
  });
});

describe("ObservedStore: batch integrity (Fail Fast, Law 4)", () => {
  it("rejects unknown record shapes, poison cells and structured junk at the gate", () => {
    const store = new ObservedStore();
    // @ts-expect-error deliberate poison for the runtime guard
    expect(() => store.applyObservedWrites([{ nonsense: true }], 0n)).toThrow(/unrecognised step-12 record/);
    expect(() =>
      store.applyObservedWrites(
        [{ key: key("a", "b"), causeId: CAUSE, cell: { value: 1n, fidelity: ResolutionBand.Fine, freshnessUs: 0n, coverage: FIXED_ONE + 1n, certainty: FIXED_ONE, status: "live" } }],
        0n,
      ),
    ).toThrow(/outside 0\.\.1/);
    const evil = { bad: (() => 0) as unknown }; // functions/symbols are not cells
    expect(() => store.applyObservedWrites([ground(key("e", "p"), evil, 0n)], 0n)).toThrow(/unsupported cell value type/);
    const deep: { a: unknown } = { a: 1n };
    for (let i = 0; i < 9; i += 1) deep.a = { a: deep.a };
    expect(() => store.applyObservedWrites([ground(key("e", "p"), deep, 0n)], 0n)).toThrow(/depth/);
    expect(() => store.applyObservedWrites([ground(key("e", "p"), 1.5, 0n)], 0n)).toThrow(/floats never enter/);
    expect(store.appliedBatches).toBe(0);
  });

  it("stableSerialize orders object keys by code unit (locale-free digest)", () => {
    expect(stableSerialize({ b: 1, a: 2n }, 0)).toBe('{"a":2n,"b":1}');
    expect(stableSerialize([true, null, "s"], 0)).toBe('[true,null,"s"]');
    const deep: unknown = { a: { a: { a: { a: { a: { a: { a: { a: { a: 1n } } } } } } } } };
    expect(() => stableSerialize(deep, 0)).toThrow(/depth/);
  });
});

describe("ObservedStore: microburst ladder through the real write path", () => {
  it("1-s spike invisible in the 5-min band, present in the 1-s ring", () => {
    const store = new ObservedStore();
    const lat = key("edge-1", "latency");
    store.applyObservedWrites([ground(lat, 100n, 0n), instrument(honestBinding(lat, CLASS_PACKET_TAP))], 0n);
    for (let t = 1; t < 600; t += 1) {
      const burst = t === 137 || t === 138 || t === 139;
      store.applyObservedWrites([ground(lat, burst ? 900n : 100n, sec(t))], sec(t));
    }
    const fine = store.history(lat, ResolutionBand.Fine).map((p) => p.value);
    const coarse = store.history(lat, ResolutionBand.Coarse).map((p) => p.value);
    expect(fine).toContain(900n);
    expect(coarse.length).toBeGreaterThanOrEqual(1);
    for (const avg of coarse) expect(avg).toBeLessThan(200n);
    // And the per-packet band saw it raw (count 1), 5-min rollups carry counts:
    expect(store.history(lat, ResolutionBand.Exact).some((p) => p.value === 900n && p.sampleCount === 1)).toBe(true);
    expect(store.history(lat, ResolutionBand.Coarse).every((p) => p.sampleCount > 1)).toBe(true);
  });
});
