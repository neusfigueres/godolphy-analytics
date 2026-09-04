// Secondary entry point: React components.
// Import types from the engine so consumers don't need two imports.
export type {
  ServiceStat,
  AtRiskClient,
  DashMetrics,
  MonthPoint,
  TopClient,
  ProfessionalStat,
  OpportunityItem,
  DashData,
  AlertItem,
} from "./engine";

export {
  TopClients,
  AtRiskClients,
  ProfessionalTable,
  ServiceTable,
  AlertsPanel,
} from "./components/index";
