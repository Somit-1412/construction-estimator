import type { CalculationSnapshot } from "./calculationSnapshot";

export type ProjectStatus =
  | "submitted"
  | "payment_received"
  | "in_progress"
  | "completed";

export type Project = {
  id: string;
  projectName: string;
  clientName: string;
  clientEmail: string;
  location: string;
  status: ProjectStatus;
  calculationSnapshot: CalculationSnapshot | null;
  createdAt: string;
};