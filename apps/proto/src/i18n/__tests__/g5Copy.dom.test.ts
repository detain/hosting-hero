// @vitest-environment jsdom
/**
 * G5 component copy tests — the ticker's cliff-lapse row and the tape's
 * annual ISSUE row pick up pack prose; every other row renders exactly as
 * before (the ledger columns are untouched by this lane).
 */
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import Gate5Ticker from "../../gates/g5/Gate5Ticker.vue";
import Gate5InvoiceTape from "../../gates/g5/Gate5InvoiceTape.vue";
import type { TapeRow, TickerRow } from "../../gates/g5/projection.ts";
import { GATE5_SCRIPT } from "../../gates/g5/quarter.ts";

const EXPLAIN = Object.freeze({ title: "t", formula: "f", inputs: [] as const });

const cliffRow = (over: Partial<TickerRow> = {}): TickerRow => ({
  key: "wire:1",
  minute: 86400,
  kind: "cliff-lapsed",
  contractId: "c01",
  causeId: "gate5:rule:whale-price-increase-refused",
  detail: "cliff reached, no renewal",
  ...over,
});

const tapeRow = (over: Partial<TapeRow> = {}): TapeRow => ({
  key: "tape:1",
  minute: 0,
  stamp: "D0 00:00",
  contractId: "c04",
  event: "issued",
  grossText: "$12,000",
  netText: "$0",
  landing: "deferred (AR)",
  explain: EXPLAIN,
  ...over,
});

describe("i18n × G5 ticker · cliff-lapse rows speak the churn-fuse line", () => {
  it("c01's lapse renders alert.churn-fuse with the GATE5_SCRIPT customer label", () => {
    const wrapper = mount(Gate5Ticker, { props: { rows: [cliffRow()] } });
    const copy = wrapper.find('[data-test="g5-ticker-copy"]');
    expect(copy.exists()).toBe(true);
    expect(copy.text()).toContain("MegaBlog Ltd (WHALE)");
    expect(copy.text()).toContain("The fuse tripped before renewal");
    // ledger columns still verbatim beneath the prose:
    expect(wrapper.text()).toContain("gate5:rule:whale-price-increase-refused");
  });

  it("kinds without a pack key render NO copy line (declined fit stays silent)", () => {
    const wrapper = mount(Gate5Ticker, {
      props: { rows: [cliffRow({ key: "k2", kind: "dunning-stage", contractId: "c05" })] },
    });
    expect(wrapper.find('[data-test="g5-ticker-copy"]').exists()).toBe(false);
    expect(wrapper.text()).toContain("dunning-stage");
  });

  it("a cliff row for an unknown contract declines (no invented customer)", () => {
    const wrapper = mount(Gate5Ticker, {
      props: { rows: [cliffRow({ key: "k3", contractId: "c99" })] },
    });
    expect(wrapper.find('[data-test="g5-ticker-copy"]').exists()).toBe(false);
  });
});

describe("i18n × G5 tape · annual ISSUE rows carry the prepay-lock note", () => {
  it("c04 (annual, 12mo) issued → note row with price + term from the script", () => {
    const signing = GATE5_SCRIPT.find((s) => s.contractId === "c04");
    expect(signing?.cycle).toBe("annual");
    expect(signing?.termMonths).toBe(12);
    const wrapper = mount(Gate5InvoiceTape, { props: { rows: [tapeRow()] } });
    const note = wrapper.find('[data-test="g5-tape-prepay-note"]');
    expect(note.exists()).toBe(true);
    expect(note.text()).toContain("Annual prepay holds $12,000 for 12 months");
    expect(note.text()).toContain("the cliff is in the calendar, not the contract");
  });

  it("monthly ISSUE → no note; a landed annual row → no note either", () => {
    const wrapper = mount(Gate5InvoiceTape, {
      props: {
        rows: [
          tapeRow({ key: "t2", contractId: "c02" }),
          tapeRow({ key: "t3", contractId: "c04", event: "landed" }),
        ],
      },
    });
    expect(wrapper.find('[data-test="g5-tape-prepay-note"]').exists()).toBe(false);
    expect(wrapper.findAll('[data-test="g5-tape-row-issued"]')).toHaveLength(1);
  });

  it("the note keeps tape order: it rides directly after its ISSUE row", () => {
    const wrapper = mount(Gate5InvoiceTape, {
      props: {
        rows: [
          tapeRow({ key: "a", contractId: "c02" }),
          tapeRow({ key: "b", contractId: "c08" }),
        ],
      },
    });
    const tds = wrapper.findAll("tbody td.g5-tape-note");
    expect(tds).toHaveLength(1);
    const rows = wrapper.findAll("tbody tr");
    // order: c02 issue, c08 issue, c08 note (notes never interleave early rows)
    expect(rows).toHaveLength(3);
    expect(rows[1]?.text()).toContain("c08");
    expect(rows[2]?.text()).toContain("Annual prepay holds");
  });
});
