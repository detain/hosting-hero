/**
 * i18n · notice-wire copy — the honest G5 seams where a pack key replaces
 * chrome's hand-written prose 1:1.
 *
 * The economy notice wire (ticker) and the invoice tape are LEDGER truth;
 * the packs own the CUSTOMER-FACING words for the same events. Two fits are
 * genuine today:
 *
 *   - kind `cliff-lapsed`  → decision `alert.churn-fuse` {customer}
 *     ("Cancellation in progress … the fuse tripped before renewal") — the
 *     cliff lapse IS the cancellation-before-renewal the key was authored for.
 *   - an `issued` tape row on an ANNUAL-prepay deal → decision
 *     `terms.prepay-lock` {introPrice}{termMonths} — the lock law the
 *     renewal-cliff story keeps paying for.
 *   - kind `contract-activated` → decision `alert.contract-activated`
 *     {customer} (rest-host-wiring handoff #2, keys landed by the docs-sync
 *     lane) — the pending→live phase the key was authored for, verbatim.
 *   - kind `chargeback-posted`  → decision `alert.chargeback-posted`
 *     {customer} — fee charged + reversal booked, as the key says.
 *
 * `covenant-breached` has its pack key (`alert.covenant-breached` {company})
 * but the ticker's data path knows only CUSTOMER labels — no company display
 * name exists in the g5 script to fill {company} honestly, so inventing one
 * is declined; that row keeps gates/g5/noticeSurface.ts's provisional voice
 * until a company-label seam ships (disclosed in the lane report).
 *
 *   - kinds `death-imminent` / `company-dissolved` → decision
 *     `alert.death-imminent` / `alert.company-dissolved` (OD-25(a), lane L4).
 *     These two keys are authored ZERO-SLOT precisely because of the
 *     covenant lesson: the company's own collapse needs no name tag, so the
 *     pack line resolves label-independently through SLOT_FREE_DECISION_KEYS
 *     and the ticker's `contractId: "company"` rows light up the seam today.
 *
 * Every other notice kind (dunning stages, refunds, SLA credits, budget
 * locks, write-offs) has NO alert/terms key in either pack — those rows keep
 * chrome's own copy (`null` = declined fit, pinned in corpusDrift.test.ts so
 * a future alert.<kind> author lights the seam up rather than leaving it
 * silently unwired).
 */
import { getEra } from "./eraState.ts";
import { hasKey, t, type PackId } from "./packStore.ts";

/** Notice kind → decision key whose single {customer} slot the ticker can
 *  fill from the row's signer. Data-driven on purpose: shipping another
 *  `alert.<kind> {customer}` key means adding ONE row here, and the
 *  noticeSurface provisional voice behind `??` retires itself. */
const CUSTOMER_SLOT_KEYS: Readonly<Record<string, string>> = Object.freeze({
  "cliff-lapsed": "alert.churn-fuse",
  "contract-activated": "alert.contract-activated",
  "chargeback-posted": "alert.chargeback-posted",
});

/** Notice kind → decision key authored ZERO-SLOT: the sentence needs nothing
 *  the wire doesn't carry, so `customerLabel: null` never declines it. The
 *  canonical-death pair (economy notices ride contractId "company" — there is
 *  no customer, and per the covenant finding no company label either). */
const SLOT_FREE_DECISION_KEYS: Readonly<Record<string, string>> = Object.freeze({
  "death-imminent": "alert.death-imminent",
  "company-dissolved": "alert.company-dissolved",
});

/** Pack prose for a ticker row of `kind`, or null when no key genuinely fits.
 *  The `eraYear` default resolves through the SHARED era toggle, so a caller
 *  inside a computed tracks the shell's button; all five alert keys here are
 *  flat today and re-derive byte-identically across flips. Zero-slot keys
 *  answer first — they cannot be blocked by a missing label. */
export function noticeWireCopy(
  kind: string,
  customerLabel: string | null,
  packId: PackId = "shared-web",
  eraYear: number = getEra(),
): string | null {
  const slotFreeKey = SLOT_FREE_DECISION_KEYS[kind];
  if (slotFreeKey !== undefined) {
    return hasKey(packId, slotFreeKey) ? t(packId, slotFreeKey, {}, eraYear) : null;
  }
  if (customerLabel === null) return null; // slot cannot be invented
  const key = CUSTOMER_SLOT_KEYS[kind];
  if (key === undefined) return null;
  if (!hasKey(packId, key)) return null;
  return t(packId, key, { customer: customerLabel }, eraYear);
}

/** The prepay-lock law line for an annual issue row (era from the shared
 *  toggle by default; `terms.prepay-lock` is flat today). */
export function prepayLockCopy(
  introPrice: string,
  termMonths: number,
  packId: PackId = "shared-web",
  eraYear: number = getEra(),
): string | null {
  const key = "terms.prepay-lock";
  if (!hasKey(packId, key)) return null;
  return t(packId, key, { introPrice, termMonths }, eraYear);
}
