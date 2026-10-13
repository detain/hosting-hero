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
});
