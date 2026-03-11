export interface Project {
  title: string;
  customerID: number | null;
  projectID: number | null;

  initiationPhase: ProjectPhase[];
  planingPhase: ProjectPhase[];
  executionPhase: ProjectPhase[];
  closurePhase: ProjectPhase[];

  customerName: string;
  dueDate: Date | null;
  startDate: Date | null;
  budget: number | null;
  projectManager: string;
  projectstatus: ProjectStatus;
  Tasks: Task[];
}

export interface ProjectPhase {
  phaseid: number | null;
  projectID: number;
  startDate: Date | null;
  dueDate: Date | null;
  phaseName: "Initiation" | "Planing" | "Execution" | "Closure";
}

export interface Task {
  taskID: number;
  projectID: number;
  phaseId: number | null;
  title: string;
  description: string;
  projectPhase: string | null;
  status: "To Do" | "In Progress" | "Done" | "Pending";
  assignedTo: string;
  dueDate: Date | null;
  startDate: Date | null;
  notificationSent: boolean;
  estimatedHours: number | null;
  hourlyRateType: string;
  subtasks: Subtask[];
}

export interface Subtask {
  subtaskID: number;
  taskID: number;
  title: string;
  description: string;
  status: "To Do" | "In Progress" | "Done" | "Pending";
  assignedTo: string;
  dueDate: Date | null;
  startDate: Date | null;
  estimatedHours: number | null;
  hourlyRateType: string;
}

export interface HourlyRate {
  rateID: number;
  rateType: string;
  hourlyRate: number;
  isDefault: boolean;
}

export interface ProjectSettings {
  projectID: number;
  hourlyRates: HourlyRate[];
}

export type ProjectStatus =
  | "Initiation"
  | "Planning"
  | "Execution"
  | "Closure"
  | "Closed"
  | "Cancelled";

export interface Customer {
  customerID: number;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  zip: number;
}

export interface CustomerEmployee {
  customerID: number;
  employeeID: number;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string;
  jobTitle: string | null;
  department: string | null;
}
