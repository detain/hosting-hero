/**
 * sessionRiders — the DORMANT byte-stand proof for the boot-rider
 * parameterization: App.vue's session boot now flows through
 * `DEFAULT_SESSION_RIDERS`, and this file pins that the wire envelope is
 * DEEP-EQUAL to the one produced by the pre-rider literal call — the
 * frozen SESSION_* constants byte-stand at the positional-argument level.
 *
 * Plus the law the parameterization exists for: riders are REAL (a custom
 * rider set demonstrably differs — the witness is never vacuous), and the
 * `rules` key stays ABSENT on the default so App's
 * `riders.rules ?? productionBootRules()` leg is the production leg today.
 */
// @vitest-environment node
import { describe, expect, it } from "vitest";
import { SimClient, type WorkerLike } from "../../bridge/simClient";
import { productionBootRules } from "../../runner/productionRules";
import {
  DEFAULT_SESSION_RIDERS,
  SESSION_BUILD,
  SESSION_CORPUS,
  SESSION_ID,
  SESSION_SEED,
  type SessionBootRiders,
} from "../sessionModel";

class RecordingWorker {
  readonly posted: unknown[] = [];
  onmessage: ((event: { data: unknown }) => void) | null = null;
  onerror: ((event: { message?: string }) => void) | null = null;
  postMessage(message: unknown): void {
    this.posted.push(message);
  }
}

function bootEnvelope(boot: (client: SimClient) => void): Record<string, unknown> {
  const worker = new RecordingWorker();
  const client = new SimClient(worker as unknown as WorkerLike, {});
  boot(client);
  expect(worker.posted).toHaveLength(1);
  return worker.posted[0] as Record<string, unknown>;
}

describe("sessionRiders — default riders byte-stand (dormant proof)", () => {
  it("DEFAULT_SESSION_RIDERS ARE the frozen constants (identity, not copy)", () => {
    expect(DEFAULT_SESSION_RIDERS.seed).toBe(SESSION_SEED);
    expect(DEFAULT_SESSION_RIDERS.corpus).toBe(SESSION_CORPUS);
    expect(DEFAULT_SESSION_RIDERS.build).toBe(SESSION_BUILD);
    expect("rules" in DEFAULT_SESSION_RIDERS).toBe(false);
    expect(Object.isFrozen(DEFAULT_SESSION_RIDERS)).toBe(true);
  });

  it("the riders-positional boot posts the SAME envelope as the literal call", () => {
    // today's App.vue leg, verbatim in shape:
    const literal = bootEnvelope((client) =>
      client.boot(SESSION_SEED, 1, "sim-core", SESSION_CORPUS, SESSION_BUILD, productionBootRules()),
    );
    // the parameterized leg App.vue now runs, with the DEFAULT riders:
    const riders = bootEnvelope((client) => {
      const r: SessionBootRiders = DEFAULT_SESSION_RIDERS;
      client.boot(r.seed, 1, "sim-core", r.corpus, r.build, r.rules ?? productionBootRules());
    });
    expect(riders).toEqual(literal);
    // and the envelope really carried the riders (non-vacuity):
    expect(riders.seed).toBe("hh-session-colo-001");
    expect(riders.corpus).toEqual({ tableId: "colo", waves: [1, 2, 3, 4, 5] });
    expect(riders.build).toMatchObject({ hands: 3 });
    expect(riders.rules).toBeDefined(); // production leg armed — key present
  });

  it("a custom rider set CHANGES the envelope — the parameterization is real", () => {
    const custom: SessionBootRiders = Object.freeze({
      seed: "chapter-derived-001",
      corpus: Object.freeze({ tableId: "colo" as const, waves: Object.freeze([1]) as readonly number[] }),
      build: Object.freeze({ hands: 1, board: Object.freeze([]) as never[] }),
    });
    const envelope = bootEnvelope((client) =>
      client.boot(custom.seed, 1, "sim-core", custom.corpus, custom.build, custom.rules ?? productionBootRules()),
    );
    expect(envelope.seed).toBe("chapter-derived-001");
    expect(envelope.rules).toBeDefined(); // the ?? production leg still answers
  });

  it("rules EXPLICITLY supplied rides the same wire bytes as the production default", () => {
    const armed = productionBootRules();
    const literalRules = bootEnvelope((client) =>
      client.boot(SESSION_SEED, 1, "sim-core", SESSION_CORPUS, SESSION_BUILD, productionBootRules()),
    ).rules;
    // exactOptionalPropertyTypes law: rules is a SPARSE key — an armed
    // book grows it, a dormant one never writes `rules: undefined`.
    const viaRiders = bootEnvelope((client) => {
      const withRules: SessionBootRiders = {
        ...DEFAULT_SESSION_RIDERS,
        ...(armed === undefined ? {} : { rules: armed }),
      };
      client.boot(withRules.seed, 1, "sim-core", withRules.corpus, withRules.build, withRules.rules ?? productionBootRules());
    }).rules;
    expect(viaRiders).toEqual(literalRules);
  });

  it("the rail id stays the App-owned constant (badge-route contract)", () => {
    expect(SESSION_ID).toBe("session");
  });
});
