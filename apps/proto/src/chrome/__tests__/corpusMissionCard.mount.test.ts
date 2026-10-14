// @vitest-environment jsdom
/**
 * CorpusMissionCard mount proof: the three arms render their witnesses in
 * the tape, buttons are the only driver (zero timers), and the panel never
 * touches the global observed store.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import CorpusMissionCard from "../CorpusMissionCard.vue";
import { fault, projection } from "../../state/observedStore";

beforeEach(() => {
  fault("reset");
});

describe("CorpusMissionCard", () => {
  it("opens quiet with the mission explained, nothing run", () => {
    const w = mount(CorpusMissionCard);
    expect(w.get('[data-test="corpus-quiet"]').text()).toContain("Metastable");
    expect(w.find('[data-test="corpus-tape"]').exists()).toBe(false);
  });

  it("the win arm prints win@240 for every seed offset", async () => {
    const w = mount(CorpusMissionCard);
    await w.get('[data-test="corpus-run-win"]').trigger("click");
    const tape = w.get('[data-test="corpus-tape"]').text();
    expect((tape.match(/win@240/g) ?? []).length).toBe(3);
    expect(tape).toContain("outcome won");
    expect(projection.value).toBeNull();
  }, 30_000);

  it("the one-flip arm prints the guard band 80/81/85", async () => {
    const w = mount(CorpusMissionCard);
    await w.get('[data-test="corpus-run-flip"]').trigger("click");
    const tape = w.get('[data-test="corpus-tape"]').text();
    for (const stop of ["@80", "@81", "@85"]) expect(tape).toContain(`guard:cascadeCollapse${stop}`);
  }, 30_000);

  it("the fail-loud probe prints the refusal instead of a fake run", async () => {
    const w = mount(CorpusMissionCard);
    await w.get('[data-test="corpus-fail-loud"]').trigger("click");
    expect(w.get('[data-test="corpus-tape"]').text()).toContain("threw CORPUS_UNRESOLVED at 'config.corpus'");
  });

  it("clear empties the tape", async () => {
    const w = mount(CorpusMissionCard);
    await w.get('[data-test="corpus-fail-loud"]').trigger("click");
    await w.get('[data-test="corpus-clear"]').trigger("click");
    expect(w.find('[data-test="corpus-tape"]').exists()).toBe(false);
  });

  it("the verdict panel opens on the fresh board: wave 1 excluded, refusal named", () => {
    const w = mount(CorpusMissionCard);
    const verdicts = w.get('[data-test="corpus-verdicts"]').text();
    expect(verdicts).toContain("wave 1 — gated scanner-drizzle · invited 0/1 — EXCLUDED @ m30");
    expect(verdicts).toContain("citation refused — CORPUS_UNRESOLVED");
    // Probe truth for the flip citation: the ungated half of wave 5 packs
    // the cursor and lands at m34.
    expect(verdicts).toContain("LANDS @ m34");
  });

  it("the buildLog toggle re-reads the very same citation seeded", async () => {
    const w = mount(CorpusMissionCard);
    await w.get('[data-test="corpus-surface-seeded"]').trigger("click");
    const verdicts = w.get('[data-test="corpus-verdicts"]').text();
    expect(verdicts).toContain("invited 1/1 — LANDS @ m30");
    expect(verdicts).toContain("invited 2/2 — LANDS @ m42");
    expect(verdicts).not.toContain("EXCLUDED");
    expect(w.get('[data-test="corpus-surface-seeded"]').attributes("aria-pressed")).toBe("true");
    expect(w.get('[data-test="corpus-surface-empty"]').attributes("aria-pressed")).toBe("false");
  });

  it("the invitation-law probe tapes starvation, the shifted landing, and the seeded equivalence", async () => {
    const w = mount(CorpusMissionCard);
    await w.get('[data-test="corpus-run-law"]').trigger("click");
    const tape = w.get('[data-test="corpus-tape"]').text();
    expect(tape).toContain("threw CORPUS_UNRESOLVED at 'traffic.waves'");
    expect(tape).toContain("guard:cascadeCollapse@62");
    expect(tape).toContain("win@240");
    expect(tape).toContain("digest 6546099a54b8b96b6f016a6795ae7beb");
  }, 30_000);
});
