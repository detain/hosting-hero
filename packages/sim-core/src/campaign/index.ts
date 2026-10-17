/**
 * campaign/ — the ordered chapter chain (ADR-0018 program 1b, L-CP1).
 *
 * A CampaignDoc is authored data: chapters naming ScenarioDocs, plus thin
 * carry rules. The chain executes each chapter through an injected
 * CampaignAuthority (host wraps scenario/runScenario — the engine is never
 * imported here), settles the run through save/settle.ts, and projects carry
 * into the next chapter. Death mid-campaign spawns a §9.9 failure_restart
 * successor whose first chapter spends the inheritance manifest exactly once.
 *
 * Zero GameState/EconomyState/CompanyNode field additions: the state-freeze
 * law rides; every fact a campaign needs already has a facet.
 */

export {
  CAMPAIGN_SCHEMA,
  CARRY_STAFF_CAP,
  CARRY_CAST_CAP,
  CampaignError,
  parseCampaignMoney,
  parseCampaignDoc,
  toCampaignWire,
} from "./doc.ts";
export type {
  CampaignCarryCashFloor,
  CampaignCarryRules,
  CampaignChapterSpec,
  CampaignChapterRecord,
  CampaignDoc,
  CampaignErrorCode,
} from "./doc.ts";

export { projectChapterCarry, applyCarryToDoc } from "./carry.ts";
export type { CampaignCarryProjection, CarryStaffFact } from "./carry.ts";

export {
  seedForChapter,
  childManifestSpent,
  spendInheritanceOnChild,
  runCampaign,
  digestCampaignReport,
} from "./chain.ts";
export type { CampaignAuthority, CampaignRunOptions, CampaignReport } from "./chain.ts";
