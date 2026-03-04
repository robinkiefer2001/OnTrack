export interface Project {
    title: string;
    customerID: number | null;
    projectID: number | null;
    customerName: string;
    dueDate: Date | null;
    startDate: Date | null;
    budget: number | null;
    projectManager: string;
    projectstatus: ProjectStatus;
}

export type ProjectStatus =
  | "Initiation"
  | "Planning"
  | "Execution"
  | "Monitoring"
  | "Closure"
  | "Closed"
  | "Cancelled";

  export interface customer {
    customerID: number;
    companyName: string;
    contactName: string;
    email: string;
    phone: string;
    zip: number;
    
  }

  export interface customerEmployee {
    customerID: number;
    employeeID: number;

    firstName: string;
    lastName: string;
    phone: string | null;
    email: string;
    jobTitle: string | null;
    department: string | null;
}