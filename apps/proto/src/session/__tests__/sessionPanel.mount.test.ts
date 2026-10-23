/**
 * SessionPanel mount law (jsdom) — the slice-(d) stage renders a REAL run.
 *
 * The panel reads only the global observed store and talks back only through
 * the sessionBus handle, so the mount proof drives the same FakeWorkerLike +
 * SimClient pair App would use in the fallback. Pinned here:
 *  · frames in → money/board/tape DOM out (numbers, not "?" placeholders);
 *  · a verb click arms the door and the receipt comes back through the tape;
 *  · the Step button is a user-gesture pump (zero timers law: setInterval,
 *    setTimeout and requestAnimationFrame are spied for the whole mount);
 *  · the dissolved rider halts the run host-side (engine keeps folding —
 *    B3 law), the end-of-run panel shows the CAUSAL epilogue, the Stop button
 *    and every verb go disabled, and the fake's runner witness is gone;
 *  · weld 2: the unlock leg mounts L-G's UnlockLedger HONESTLY EMPTY —
 *    zero census in DOM, and a source law that no data props are ever
 *    passed (a fake populated ledger is forbidden until the engine +
 *    protocol unlock seams land; see the panel header).
 */
// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { canonicalDigest } from "@hh/sim-core/replay";
import { encodeProjection, type EventNotice, type SimProjection } from "../../shared/protocol";
import { FakeWorkerLike } from "../../bridge/fakeWorker";
import { SimClient } from "../../bridge/simClient";
import { ingestProjection, projection } from "../../state/observedStore";
import { CAUSAL_EPILOGUE } from "../../chrome/deathWatch";
import { productionBootRules } from "../../runner/productionRules";
import { setSessionHandle, sessionHandle } from "../sessionBus";
import { SESSION_BUILD, SESSION_CORPUS, SESSION_SEED, SESSION_DOOR_VERBS } from "../sessionModel";
import SessionPanel from "../SessionPanel.vue";

const wrappers: ReturnType<typeof mount>[] = [];

afterEach(() => {
  while (wrappers.length > 0) wrappers.pop()!.unmount();
  setSessionHandle(null);
  projection.value = null;
  vi.restoreAllMocks();
});

function bootSession() {
  const fake = new FakeWorkerLike();
  const client = new SimClient(fake, { onProjection: (p) => ingestProjection(p) });
  client.boot(SESSION_SEED, 1, "sim-core", SESSION_CORPUS, SESSION_BUILD, productionBootRules());
  setSessionHandle({ client, host: fake });
  return { fake, client };
}

function dissolvedCopy(frame: SimProjection): SimProjection {
  const rider = {
    kind: "economy-notice",
    laneId: null,
    atUs: 0n,
    detail: "company-dissolved:company",
    causeId: "economy:death:dissolved:churn-collapse:44",
  } as unknown as EventNotice;
  return Object.freeze({ ...frame, notices: Object.freeze([rider]) });
}

describe("SessionPanel renders a live colo session", () => {
  it("money rows, board rows and the economy tape carry real values", async () => {
    const timers = {
      interval: vi.spyOn(globalThis, "setInterval"),
      timeout: vi.spyOn(globalThis, "setTimeout"),
      raf: vi.spyOn(globalThis, "requestAnimationFrame"),
    };
    const { fake } = bootSession();
    const w = mount(SessionPanel);
    wrappers.push(w);
    fake.pump(70);
    await nextTick();
    expect(w.find('[data-test="sess-panel"]').exists()).toBe(true);
    expect(w.find('[data-test="sess-tick"]').text()).toMatch(/tick 70/);
    // money leg: cash is a formatted dollar number; no-data rows stay honest
    const cash = w.find('[data-test="sess-money-cash"]').text();
    expect(cash).toMatch(/\$\s?\d/);
    // board leg: the attribution rows render entered/served/bounced columns
    expect(w.find('[data-test="sess-node-edge"]').exists()).toBe(true);
    expect(w.find('[data-test="sess-node-entry-unattributed"]').exists()).toBe(true);
    expect(w.find('[data-test="sess-node-edge"]').text()).toMatch(/\d/);
    // economy tape: dunning/invoice riders arrived inside 70 frames
    expect(w.find('[data-test="sess-tape"]').text()).toMatch(/invoice-issued|dunning-stage/);
    // the zero-timer law held for the whole mount:
    expect(timers.interval).not.toHaveBeenCalled();
    expect(timers.timeout).not.toHaveBeenCalled();
    expect(timers.raf).not.toHaveBeenCalled();
  });

  it("verb clicks arm the door and receipts come back; Step pumps one frame", async () => {
    const { fake } = bootSession();
    const w = mount(SessionPanel);
    wrappers.push(w);
    fake.pump(2);
    await nextTick();
    const tickBefore = (projection.value as SimProjection).tick;
    await w.find('[data-test="sess-step"]').trigger("click");
    await nextTick();
    expect((projection.value as SimProjection).tick).toBe(tickBefore + 1n);
    // the door accepts a verb from the panel (communicate, hands free):
    expect(w.findAll('[data-test^="sess-verb-"]')).toHaveLength(SESSION_DOOR_VERBS.length);
    await w.find('[data-test="sess-verb-communicate"]').trigger("click");
    fake.pump(2); // dispatch + execute
    await nextTick();
    expect(w.find('[data-test="sess-receipts"]').text()).toContain("communicate");
  });

  it("the dissolved rider halts the run and opens the readable end state", async () => {
    const { fake } = bootSession();
    const w = mount(SessionPanel);
    wrappers.push(w);
    fake.pump(10);
    await nextTick();
    expect(w.find('[data-test="sess-end"]').exists()).toBe(false);
    ingestProjection(dissolvedCopy(projection.value as SimProjection));
    await nextTick();
    // host-side halt: halted chrome + Stop/verbs disabled + runner stopped
    expect(w.find('[data-test="sess-end"]').exists()).toBe(true);
    expect(w.find('[data-test="sess-halted"]').exists()).toBe(true);
    expect(w.find('[data-test="sess-end-cause"]').text()).toBe(CAUSAL_EPILOGUE["churn-collapse"]);
    expect(w.find('[data-test="sess-stop"]').attributes("disabled")).toBeDefined();
    expect(w.find('[data-test="sess-verb-communicate"]').attributes("disabled")).toBeDefined();
    const lastFrame = projection.value as SimProjection;
    fake.pump(0); // the halt postMessage dispatches on the next drain
    expect(fake.lastRunner).toBeNull();
    fake.pump(3);
    expect(projection.value).toBe(lastFrame); // no further frames after terminal
    expect(canonicalDigest(encodeProjection(lastFrame))).toBeTruthy();
  });
});

describe("SessionPanel — the unlock leg is honestly empty (weld 2)", () => {
  it("L-G's UnlockLedger mounts with its zero census and the seam note", async () => {
    const { fake } = bootSession();
    const w = mount(SessionPanel);
    wrappers.push(w);
    fake.pump(3);
    await nextTick();
    expect(w.find('[data-test="unlock-ledger"]').exists()).toBe(true);
    expect(w.get('[data-test="unlock-census"]').text().replace(/\s+/g, " ")).toContain("0 earned");
    expect(w.find('[data-test="unlock-earned-empty"]').exists()).toBe(true);
    expect(w.find('[data-test="sess-unlock-seam"]').exists()).toBe(true);
  });

  it("source law: the mount carries NO data props — a fake populated ledger is forbidden", () => {
    const src = readFileSync(join(process.cwd(), "src", "session", "SessionPanel.vue"), "utf8");
    // Exactly one bare self-closing mount; any :cards/:lines/:satisfied/
    // :proposals/:ladder binding would be inventing engine data the wire
    // cannot deliver — this pin reddens the day someone tries.
    const mounts = src.match(/<UnlockLedger\b[^>]*\/>/g) ?? [];
    expect(mounts).toHaveLength(1);
    expect(mounts[0]).toBe("<UnlockLedger />");
  });
});
