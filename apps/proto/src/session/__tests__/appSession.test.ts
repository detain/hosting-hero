/**
 * App rail · the SESSION entry is a real place (slice-(d) adoption proof).
 *
 * jsdom has no Worker, so the shell boots its documented FakeWorkerLike
 * fallback — which is exactly what makes this proof wire-faithful: the
 * SESSION riders must cross the same assertToWorker/postMessage path a
 * browser takes. Pinned:
 *  · the SESS badge enumerates on the rail next to LAB/sandbox;
 *  · clicking it hands the shell's ONE client to the session boot — the bus
 *    handle carries a live SimClient + a pump host, and the runner under the
 *    wire answers a five-wave colo corpusPlan (the riders are REAL);
 *  · the stage renders the panel and frames flow (tick text moves);
 *  · the LossCard (§9.9) still guards the shell view-independently: a
 *    dissolved rider opened during SESSION scrim-blankets the app;
 *  · leaving SESSION re-boots the sandbox on the SAME client (the worker's
 *    boot branch stops the previous runner — the fresh lastRunner answers a
 *    null corpusPlan), and the bus handle is gone.
 */
// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import App from "../../App.vue";
import type { EventNotice, SimProjection } from "../../shared/protocol";
import { ingestProjection, projection } from "../../state/observedStore";
import { FakeWorkerLike } from "../../bridge/fakeWorker";
import { SimCoreRunner } from "../../runner/index";
import { sessionHandle } from "../../session/sessionBus";
import { setEra, DEFAULT_ERA_YEAR } from "../../i18n/eraState.ts";

const wrappers: ReturnType<typeof mount>[] = [];

afterEach(() => {
  while (wrappers.length > 0) wrappers.pop()!.unmount();
  projection.value = null;
  setEra(DEFAULT_ERA_YEAR);
  document.body.innerHTML = "";
});

/** The shell's fake fallback arrives through an async import; drain it. */
async function untilPresent<T>(probe: () => T | null | undefined, tries = 50): Promise<T> {
  for (let i = 0; i < tries; i += 1) {
    const value = probe();
    if (value) return value;
    await new Promise((resolve) => setTimeout(resolve, 0));
    await nextTick();
  }
  throw new Error("probe never became present");
}

async function gotoSession(w: ReturnType<typeof mount>) {
  await w.find('[data-test-id="gate-rail-session"]').trigger("click");
  await nextTick();
}

describe("App SESSION rail entry", () => {
  it("enumerates, boots the colo riders through the wire, runs, and re-boots the sandbox on leave", async () => {
    const w = mount(App, { attachTo: document.body });
    wrappers.push(w);
    expect(w.find('[data-test-id="gate-rail-session"]').exists()).toBe(true);

    await gotoSession(w);
    expect(w.find('[data-test-id="gate-stage-session"]').exists()).toBe(true);
    expect(w.find('[data-test="sess-panel"]').exists()).toBe(true);

    // the shell's own client took the session riders:
    const handle = await untilPresent(() => sessionHandle.value);
    const host = handle.host as FakeWorkerLike;
    expect(host).toBeDefined(); // fake fallback exposes its pump
    host.pump(1); // drains the posted boot(s) — the session boot is the last law
    const runner = host.lastRunner as SimCoreRunner;
    expect(runner).toBeInstanceOf(SimCoreRunner);
    expect(runner.corpusPlan()?.map((row) => row.wave)).toEqual([1, 2, 3, 4, 5]);

    host.pump(12);
    await nextTick();
    expect(w.find('[data-test="sess-tick"]').text()).toMatch(/tick 1[0-9]/);

    // LossCard guards the shell regardless of view (global-store posture):
    const frame = projection.value as SimProjection;
    ingestProjection(
      Object.freeze({
        ...frame,
        notices: Object.freeze([
          {
            kind: "economy-notice",
            laneId: null,
            atUs: 0n,
            detail: "company-dissolved:company",
            causeId: "economy:death:dissolved:churn-collapse:44",
          } as unknown as EventNotice,
        ]),
      }),
    );
    await untilPresent(() => (document.querySelector('[data-test="loss-scrim"]') ? true : null));

    // leave SESSION → the SAME fake host re-boots the sandbox (null corpus):
    await w.find('[data-test-id="gate-rail-G1"]').trigger("click");
    await nextTick();
    expect(sessionHandle.value).toBeNull();
    host.pump(1);
    const sandboxRunner = host.lastRunner as SimCoreRunner;
    expect(sandboxRunner.corpusPlan()).toBeNull();
  }, 30_000);

  it("the SESSION stage replaces the gate stage — and the shell chrome stays mounted", async () => {
    const w = mount(App, { attachTo: document.body });
    wrappers.push(w);
    await untilPresent(() => (w.find('[data-test="g1-panel"]').exists() ? true : null));
    await gotoSession(w);
    await untilPresent(() => (sessionHandle.value ? true : null));
    expect(w.find('[data-test="g1-panel"]').exists()).toBe(false);
    expect(w.find('[data-test="sess-panel"]').exists()).toBe(true);
    // the shared-chrome posture: the rail is still one click from every gate
    expect(w.find('[data-test-id="gate-rail-G1"]').exists()).toBe(true);
  }, 20_000);
});
