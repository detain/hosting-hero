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
 *
 * Every other notice kind (dunning stages, refunds, SLA credits, budget
 * locks, write-offs) has NO alert/terms key in either pack — those rows keep
 * chrome's own copy (`null` = declined fit, pinned in corpusDrift.test.ts so
 * a future alert.<kind> author lights the seam up rather than leaving it
 * silently unwired).
 */
import { getEra } from "./eraState.ts";
import { hasKey, t, type PackId } from "./packStore.ts";

/** Pack prose for a ticker row of `kind`, or null when no key genuinely fits.
 *  The `eraYear` default resolves through the SHARED era toggle, so a caller
 *  inside a computed tracks the shell's button; `alert.churn-fuse` is flat
 *  today and re-derives byte-identically across flips. */
export function noticeWireCopy(
  kind: string,
  customerLabel: string | null,
  packId: PackId = "shared-web",
  eraYear: number = getEra(),
): string | null {
  if (kind !== "cliff-lapsed" || customerLabel === null) return null;
  const key = "alert.churn-fuse";
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
