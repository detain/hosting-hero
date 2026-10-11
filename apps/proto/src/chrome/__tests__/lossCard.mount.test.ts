// @vitest-environment jsdom
/**
 * LossCard mount proof (batch-E v0): death riders on the wire raise the
 * warning strip, dissolve into the obituary, and the voice stack resolves
 * pack-first. Frames come from the REAL runner (overlaid notices — the
 * default scenario does not die inside a handful of ticks).
 */
import { nextTick } from "vue";
import { beforeEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import LossCard from "../LossCard.vue";
import { SimCoreRunner } from "../../runner/simCoreRunner";
import { fault, ingestProjection } from "../../state/observedStore";
import { noticeWireCopy } from "../../i18n/noticeCopy";
import { formatMicroUsd, formatRunClock } from "../metrics";
import {
  CAUSE_UNKNOWN_EPILOGUE,
  DEATH_WATCH_VOICE,
  DISSOLVED_HEADLINE,
} from "../deathWatch";
import type { EventNotice, SimProjection } from "../../shared/protocol";

const runner = new SimCoreRunner({ seed: 42 });

function frame(extra: readonly EventNotice[] = []): SimProjection {
  const base = runner.headlessStep(1000);
  return { ...base, notices: Object.freeze([...base.notices, ...extra]) };
}

const deathNotice = (detail: string): EventNotice => ({
  kind: "economy-notice",
  laneId: null,
  atUs: 5_000n,
  detail,
});

beforeEach(() => {
  fault("reset");
});

describe("LossCard", () => {
  it("quiet wire renders nothing", () => {
    ingestProjection(frame());
    const w = mount(LossCard);
    expect(w.find('[data-test="death-warning"]').exists()).toBe(false);
    expect(w.find('[data-test="loss-card"]').exists()).toBe(false);
  });

  it("death-imminent raises the strip; the ZERO-SLOT pack line wins over provisional", () => {
    ingestProjection(frame([deathNotice("death-imminent:company")]));
    const w = mount(LossCard); // mount-time immediate watch paints synchronously
    const strip = w.find('[data-test="death-warning"]');
    expect(strip.exists()).toBe(true);
    expect(strip.text()).toContain(DEATH_WATCH_VOICE.headline);
    const packLine = noticeWireCopy("death-imminent", null);
    expect(packLine).not.toBeNull(); // lane L4 key resolves label-free
    expect(strip.text()).toContain(packLine!);
  });

  it("company-dissolved slams the obituary: headline, pack voice, honest epilogue, facts", () => {
    const f = frame([deathNotice("company-dissolved:company")]);
    ingestProjection(f);
    const w = mount(LossCard);
    expect(w.find('[data-test="death-warning"]').exists()).toBe(false);
    const card = w.find('[data-test="loss-card"]');
    expect(card.exists()).toBe(true);
    expect(card.find('[data-test="loss-voice"]').text()).toBe(noticeWireCopy("company-dissolved", null));
    expect(card.find(".headline").text()).toBe(DISSOLVED_HEADLINE);
    // two-segment wire today → the card NARRATES the seam, never guesses a cause
    expect(card.find('[data-test="loss-epilogue"]').text()).toBe(CAUSE_UNKNOWN_EPILOGUE);
    const facts = card.find('[data-test="loss-facts"]').text();
    expect(facts).toContain(formatMicroUsd(f.freeCashMicroUsd));
    expect(facts).toContain(formatRunClock(f.clocks.simUs));
  });

  it("a widened three-segment wire names the real cause with no chrome change", () => {
    const f = frame([deathNotice("company-dissolved:company:covenant-default")]);
    ingestProjection(f);
    const w = mount(LossCard);
    expect(w.find('[data-test="loss-epilogue"]').text()).toContain("covenants broke");
  });

  it("monotone: dissolution survives quiet frames — the ledger never un-stops", async () => {
    ingestProjection(frame([deathNotice("death-imminent:company")]));
    const w = mount(LossCard);
    expect(w.find('[data-test="death-warning"]').exists()).toBe(true);
    ingestProjection(frame([deathNotice("company-dissolved:company")]));
    await nextTick(); // mid-session updates re-render on the microtask
    expect(w.find('[data-test="loss-card"]').exists()).toBe(true);
    ingestProjection(frame()); // quiet after death
    await nextTick();
    expect(w.find('[data-test="death-warning"]').exists()).toBe(false); // card wins the tier
    expect(w.find('[data-test="loss-card"]').exists()).toBe(true);
    ingestProjection(frame([deathNotice("death-imminent:company")])); // stale warning re-fed
    await nextTick();
    expect(w.find('[data-test="loss-card"]').exists()).toBe(true);
  });
});
