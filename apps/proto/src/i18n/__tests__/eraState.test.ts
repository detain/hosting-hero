/**
 * i18n/eraState — the lifted era toggle reaching COPY.
 *
 * The seam this proves: packStore.t()'s default eraYear resolves through
 * getEra() at call time, so (a) an era-VARIANT key flips its rendered text
 * when the shell button calls setEra(), (b) a Vue computed that renders copy
 * TRACKS the ref (the consumers' reactive path), while (c) every key the
 * consumers actually voice today — the five refusals, churn-fuse,
 * prepay-lock — is flat in the packs and re-derives BYTE-IDENTICALLY across
 * a flip. (c) is the no-accidental-coupling pin: the era plumbing exists,
 * it does not churn words that were never authored to vary.
 */
import { afterEach, describe, expect, it } from "vitest";
import { computed, watchEffect } from "vue";
import { DEFAULT_ERA_YEAR, era, getEra, setEra, type EraYear } from "../eraState.ts";
import { t } from "../packStore.ts";
import { describeRefusal } from "../refusalCopy.ts";
import { noticeWireCopy, prepayLockCopy } from "../noticeCopy.ts";

/** Reset the singleton so assertions never depend on file order. */
afterEach(() => setEra(DEFAULT_ERA_YEAR));

describe("i18n/eraState · the shared ref mirrors the old constant", () => {
  it("initials to DEFAULT_ERA_YEAR; getEra mirrors the ref; setEra writes it", () => {
    expect(era.value).toBe(DEFAULT_ERA_YEAR);
    expect(DEFAULT_ERA_YEAR).toBe(2026);
    expect(getEra()).toBe(era.value);
    setEra(1998);
    expect(getEra()).toBe(1998);
    expect(era.value).toBe(1998);
  });
});

describe("i18n/eraState · setEra flips era-variant copy through t()'s default path", () => {
  it("ticket.subject.cron (a REAL era-variant pack key, not a fixture)", () => {
    expect(t("shared-web", "ticket.subject.cron")).toBe("my cron didnt run");
    setEra(1998);
    expect(t("shared-web", "ticket.subject.cron")).toBe("my hit counter doesnt go up");
    setEra(2026);
    expect(t("shared-web", "ticket.subject.cron")).toBe("my cron didnt run");
  });

  it("an explicit eraYear argument still outranks the shared toggle", () => {
    setEra(1998);
    expect(t("shared-web", "ticket.subject.cron", {}, 2026)).toBe("my cron didnt run");
  });

  it("a Vue computed reading t() tracks the toggle (the consumers' reactive path)", () => {
    const label = computed(() => t("shared-web", "ticket.subject.cron"));
    expect(label.value).toBe("my cron didnt run");
    setEra(1998);
    expect(label.value).toBe("my hit counter doesnt go up");
  });

  it("watchEffect on refusal copy re-runs on flip, but its bytes do not move", () => {
    let runs = 0;
    let text = "";
    const seen: string[] = [];
    // flush:"sync" — tracking is identical to a panel's render effect; only
    // the (microtask-batched) re-run scheduling is made synchronous to count.
    const stop = watchEffect(
      () => {
        runs += 1;
        text = describeRefusal('unknown-node: "db-1"', {
          verb: "connect-ports",
          tick: "2",
          hands: [],
        }).text;
        seen.push(text);
      },
      { flush: "sync" },
    );
    expect(runs).toBe(1);
    setEra(1998); // the effect tracked getEra() via describeRefusal → t()
    expect(runs).toBe(2);
    setEra(2026);
    expect(runs).toBe(3);
    stop();
    expect(new Set(seen).size).toBe(1); // tracked YES, churned NO
    expect(text).toBe("No board object named db-1 exists at the current tick. Nothing was changed.");
  });
});

describe("i18n/eraState · consumer keys are era-INERT (byte-stability across flips)", () => {
  const VOICED: readonly (readonly [string, Record<string, string>])[] = [
    ['unknown-node: "db-1"', {}],
    ['edge-exists: "edge:data:web-1->sw-1"', {}],
    ['slot-occupied: "psu1" on "web-1" fed by "sw-1" — one supplier per socket', {}],
    ["stamped-in-future: entry tick 9 > current 2", {}],
    ["hands-exhausted: need 1, free 0 of 2", { verb: "place-device" }],
  ];

  const baseCtx = (over: Record<string, unknown> = {}) => ({
    verb: "connect-ports",
    tick: "2",
    hands: [{ busyUntilTick: "4", busyCauseId: "intent:1" }],
    ...over,
  });

  it("all five voiced refusal codes render byte-identical at 2026 and 1998", () => {
    for (const [reason, ctxOver] of VOICED) {
      const modern = describeRefusal(reason, { ...baseCtx(ctxOver) });
      expect(modern.fromPack).toBe(true); // the probe must ride the pack path
      setEra(1998);
      const vintage = describeRefusal(reason, { ...baseCtx(ctxOver) });
      expect(vintage).toEqual(modern);
      // and an explicit ctx.eraYear agrees with the shared ref:
      expect(
        describeRefusal(reason, { ...baseCtx({ ...ctxOver, eraYear: 1998 as EraYear }) }),
      ).toEqual(modern);
      setEra(DEFAULT_ERA_YEAR);
    }
  });

  it("raw-fallback refusals stay raw at every era (fallback is era-blind)", () => {
    const line = describeRefusal("empty-note", baseCtx());
    setEra(1998);
    expect(describeRefusal("empty-note", baseCtx())).toEqual(line);
  });

  it("ticker churn-fuse and tape prepay-lock lines never move across a flip", () => {
    const fuse = noticeWireCopy("cliff-lapsed", "MegaBlog Ltd (WHALE)");
    const lock = prepayLockCopy("$3,600", 12);
    expect(fuse).not.toBeNull();
    expect(lock).not.toBeNull();
    setEra(1998);
    expect(noticeWireCopy("cliff-lapsed", "MegaBlog Ltd (WHALE)")).toBe(fuse);
    expect(prepayLockCopy("$3,600", 12)).toBe(lock);
    // explicit year cannot move them either — the keys carry no era objects:
    expect(noticeWireCopy("cliff-lapsed", "MegaBlog Ltd (WHALE)", "shared-web", 1998)).toBe(fuse);
    expect(prepayLockCopy("$3,600", 12, "shared-web", 2026)).toBe(lock);
  });

  it("the shell's bind mechanic works off the lifted ref (label flips, copy tracks)", () => {
    // App.vue's template binding: `Era {{ era }}` unwraps the imported ref.
    const shown = computed(() => `Era ${String(era.value)}`);
    expect(shown.value).toBe("Era 2026");
    setEra(1998);
    expect(shown.value).toBe("Era 1998");
    // The panel-computed mechanic (Gate5Ticker.copyByRowKey): re-derives on
    // the flip because getEra() is read inside the effect — bytes unchanged.
    let derivations = 0;
    let line = "";
    const stop = watchEffect(
      () => {
        derivations += 1;
        line = noticeWireCopy("cliff-lapsed", "c") ?? "";
      },
      { flush: "sync" },
    );
    expect(derivations).toBe(1);
    expect(line).toContain("Cancellation in progress: c.");
    setEra(2026);
    expect(derivations).toBe(2); // tracked the toggle…
    expect(line).toContain("Cancellation in progress: c."); // …same words
    stop();
  });
});
