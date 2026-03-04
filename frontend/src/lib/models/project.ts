export interface Project {
    title: string;
    customerID: number | null;
    projectID: number | null;
    customerName: string;
    dueDate: Date | null;
    startDate: Date | null;
    budget: number | null;
    projectManager: string;
}