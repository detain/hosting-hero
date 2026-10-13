/**
 * Death watch (batch-E v0, chrome consumer) — reads the OD-25(a) canonical
 * company deaths OFF THE WIRE, nothing else.
 *
 * The economy lane (economy/death.ts, tick.ts foldCompanyDeath) emits the
 * notices; the proto runner rolls every EconomyNotice onto the projection as
 * an `economy-notice` whose detail is `<engineKind>:<contractId>` — so a
 * death rider looks like `death-imminent:company` or
 * `company-dissolved:company`. E2b CLOSED the seam: the wire now carries the
 * engine's own `causeId` (`economy:death:{imminent|dissolved}:<cause>:<minute>`)
 * as a structured field on every economy-notice rider, and parseDeathRider
 * reads the cause from it first, falling back to detail-shape detection for
 * older producers.
 *
 * §9.9 "Failure is Narrated, Not Punished": the copy here is the fallback
 * voice — dry, accurate, never comedic at the moment of loss. The pack line
 * (alert.death-imminent / alert.company-dissolved, ZERO-SLOT, lane L4) wins
 * whenever it resolves; these consts stand behind `??`.
 */
import type { EventNotice } from "../shared/protocol";

/* ───────────────────────── engine mirror (drift-pinned in tests) ───────────────────────── */

/** The three canonical causes (economy/death.ts CompanyDeathCause). The
 *  drift-pin test greps the engine source for the literal array — this is a
 *  MIRROR, chrome must never invent a fourth way to die. */
export type CompanyDeathCause = "float-insolvency" | "covenant-default" | "churn-collapse";

export const COMPANY_DEATH_CAUSES: readonly CompanyDeathCause[] = Object.freeze([
  "float-insolvency",
  "covenant-default",
  "churn-collapse",
]);

export type DeathWatchPhase = "notice" | "dissolved";

/** Engine notice kinds that mark the death ladder (EconomyNotice union). */
export const DEATH_ENGINE_KINDS: Readonly<Record<string, DeathWatchPhase>> = Object.freeze({
  "death-imminent": "notice",
  "company-dissolved": "dissolved",
});

/* ───────────────────────── rider parsing ───────────────────────── */

export interface DeathRider {
  /** Which rung of the ladder this rider is. */
  readonly phase: DeathWatchPhase;
  /** The runner's two-segment detail, verbatim (`death-imminent:company`). */
  readonly detail: string;
  /** Contract the engine attached — "company" for both rungs by design. */
  readonly contractId: string;
  /** The canonical cause. E2b: resolved from the notice's structured
   *  `causeId` first (the runner forwards every EconomyNotice.causeId),
   *  then from a widened detail shape, else null — never guessed. */
  readonly cause: CompanyDeathCause | null;
}

const CAUSE_IN_DETAIL = /death:(?:imminent|dissolved):([a-z-]+):\d+/;

function causeOf(token: string | undefined): CompanyDeathCause | null {
  return token !== undefined && (COMPANY_DEATH_CAUSES as readonly string[]).includes(token)
    ? (token as CompanyDeathCause)
    : null;
}

/** Parse one wire notice; null unless it is a death rider. The structured
 *  `causeId` (E2b) is the first authority; a widened detail
 *  `death-imminent:company:<cause>` (or a causeId-shaped tail concatenated
 *  into the detail by older runner builds) still resolves without change. */
/** Input is the WIDEST-NARROW shape: only `kind`, `detail` and `causeId` are
 *  ever read, so callers holding a rendered StackAlert row (plain-string
 *  lane) can re-parse without forging an EntityId. */
export function parseDeathRider(
  notice: Pick<EventNotice, "kind" | "detail" | "causeId">,
): DeathRider | null {
  if (notice.kind !== "economy-notice") return null;
  const detail = notice.detail;
  if (detail === undefined) return null;
  const colon = detail.indexOf(":");
  if (colon === -1) return null;
  const engineKind = detail.slice(0, colon);
  const phase = DEATH_ENGINE_KINDS[engineKind];
  if (phase === undefined) return null;
  const rest = detail.slice(colon + 1);
  const second = rest.indexOf(":");
  const contractId = second === -1 ? rest : rest.slice(0, second);
  const fromDetail = second === -1 ? null : causeOf(rest.slice(second + 1));
  const fromCauseId = notice.causeId === undefined ? null : causeOf(CAUSE_IN_DETAIL.exec(notice.causeId)?.[1]);
  return Object.freeze({
    phase,
    detail,
    contractId,
    cause: fromCauseId ?? fromDetail ?? causeOf(CAUSE_IN_DETAIL.exec(detail)?.[1]),
  });
}

/** Fold a frame's notices into the highest death rung seen. Dissolved wins
 *  over imminent; re-ingesting the same frame cannot un-die (monotone by
 *  construction — callers accumulate across frames). */
export function extractDeathPhase(notices: readonly EventNotice[]): DeathWatchPhase | null {
  let phase: DeathWatchPhase | null = null;
  for (const notice of notices) {
    const rider = parseDeathRider(notice);
    if (rider === null) continue;
    if (rider.phase === "dissolved") return "dissolved";
    phase = "notice";
  }
  return phase;
}

/** First cause the wire ever revealed (null while the seam is two-segment). */
export function extractDeathCause(notices: readonly EventNotice[]): CompanyDeathCause | null {
  for (const notice of notices) {
    const rider = parseDeathRider(notice);
    if (rider?.cause !== null && rider?.cause !== undefined) return rider.cause;
  }
  return null;
}

/* ───────────────────────── provisional voices (§9.9 sober) ───────────────────────── */
/* PROVISIONAL copy rows — owner-ratify batch. The PACK line wins wherever it
 * resolves (noticeWireCopy, lane L4); these stand behind `??` and name the
 * cause only through the closed mirror above. */

/** Warning strip (death-imminent rung). */
export const DEATH_WATCH_VOICE = Object.freeze({
  headline: "Death watch armed",
  line:
    "The register has stayed empty against what is owed, day after day. One more unpaid fold and the ledger stops on its own.",
} as const);

/** Obituary headline (company-dissolved rung). */
export const DISSOLVED_HEADLINE = "The company is dissolved.";

/** Per-cause epilogue — the narration §9.9 promises: the REAL mechanism,
 *  dry and accurate. Keyed by the closed cause mirror. */
export const CAUSAL_EPILOGUE: Readonly<Record<CompanyDeathCause, string>> = Object.freeze({
  "float-insolvency":
    "The float ran out. Free cash stayed below zero for three business days while the ledger kept refusing settlements — insolvency is not an event, it is a streak you refused to break.",
  "covenant-default":
    "The covenants broke and stayed broken past the grace window. The company had sold promises it was no longer keeping — runway, error budget, both reviewed and both missed.",
  "churn-collapse":
    "The customers left. Churn held above the collapse floor for three straight business months until the MRR could no longer cover the lights.",
});

/** Honest line when the cause never crossed the wire (today's two-segment
 *  seam): say what IS known, never guess at what is not. */
export const CAUSE_UNKNOWN_EPILOGUE =
  "The final fold does not name its cause on this wire. Read it from the replay: the notices carry the minute, the ledger carries the money.";

/* ───────────────────────── pricing rider mirror (report-only reader) ───────────────────────── */

/** Receipt details the door's verdicts carry for the 9th verb (chrome reads
 *  them off intent-executed / intent-refused notices). E2b CLOSED the seam:
 *  an executed adjust-price receipt rides `<verb>: target=<kind>:<id>,
 *  price=<µ$>` — the handler's detail crossed the wire on the receipt
 *  (IntentReceipt.detail), mirroring the refused `<verb>: <reason>` shape. */
export const ADJUST_PRICE_VERB = "adjust-price";

/** Does this receipt notice talk about pricing? */
export function isPricingReceipt(notice: EventNotice): boolean {
  return (
    (notice.kind === "intent-executed" || notice.kind === "intent-refused") &&
    notice.detail?.startsWith(`${ADJUST_PRICE_VERB}`) === true
  );
}
