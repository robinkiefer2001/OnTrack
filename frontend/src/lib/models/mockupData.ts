import type {
    Customer,
    CustomerEmployee,
    Project,
    ProjectPhase,
    ProjectStatus,
} from "./project";
import { writable } from "svelte/store";

// Realistic German/Swiss employees
const germanEmployees = [
    { firstName: "Michael", lastName: "Mueller" },
    { firstName: "Sandra", lastName: "Schmidt" },
    { firstName: "Thomas", lastName: "Weber" },
    { firstName: "Claudia", lastName: "Keller" },
    { firstName: "Stefan", lastName: "Schneider" },
    { firstName: "Angela", lastName: "Fischer" },
    { firstName: "Peter", lastName: "Bauer" },
    { firstName: "Daniela", lastName: "Wolf" },
    { firstName: "Klaus", lastName: "Meyer" },
    { firstName: "Martina", lastName: "Hoffmann" },
];

const swissCompanies = [
    { name: "Siemens Schweiz", city: "Zurich", zip: "8050" },
    { name: "ABB Ltd", city: "Zurich", zip: "8050" },
    { name: "Roche Diagnostics", city: "Rotkreuz", zip: "6343" },
    { name: "Novartis", city: "Basel", zip: "4056" },
    { name: "SwissRe", city: "Zurich", zip: "8022" },
    { name: "UBS AG", city: "Zurich", zip: "8098" },
    { name: "Kraft Heinz", city: "Zurich", zip: "8050" },
    { name: "Holcim", city: "Zurich", zip: "8045" },
    { name: "SoftExpert AG", city: "Bern", zip: "3011" },
    { name: "TCS AG", city: "Zurich", zip: "8027" },
];

const jobTitles = [
    "Project Manager",
    "Technical Lead",
    "Business Analyst",
    "System Engineer",
    "QA Engineer",
    "Product Owner",
];

const departments = ["IT", "Finance", "Operations", "Sales", "Development"];

const realisticProjects = [
    { title: "ERP System Migration", budget: 850000, duration: 180 },
    { title: "Cloud Infrastructure Upgrade", budget: 620000, duration: 120 },
    { title: "Digital Transformation Initiative", budget: 1200000, duration: 210 },
    { title: "Mobile Banking App Development", budget: 450000, duration: 150 },
    { title: "Data Analytics Platform", budget: 380000, duration: 90 },
    { title: "Cybersecurity Audit & Implementation", budget: 290000, duration: 75 },
    { title: "Customer Portal Redesign", budget: 185000, duration: 60 },
    { title: "Business Process Automation", budget: 320000, duration: 120 },
    { title: "API Gateway Implementation", budget: 245000, duration: 90 },
    { title: "Performance Optimization", budget: 155000, duration: 45 },
];

const realisticTasks = [
    { name: "Requirements Gathering", hours: 40 },
    { name: "System Design & Architecture", hours: 80 },
    { name: "Development Sprint 1", hours: 160 },
    { name: "Development Sprint 2", hours: 160 },
    { name: "Testing & QA", hours: 120 },
    { name: "Documentation", hours: 60 },
    { name: "User Training", hours: 40 },
    { name: "Go-live Preparation", hours: 80 },
    { name: "Data Migration", hours: 100 },
    { name: "Integration Testing", hours: 90 },
];

const realisticSubtasks: Record<string, string[]> = {
    "Requirements Gathering": [
        "Stakeholder interviews",
        "Process analysis",
        "Requirements documentation",
    ],
    "System Design & Architecture": [
        "Technical architecture design",
        "Database schema design",
        "API specifications",
        "Security design review",
    ],
    "Development Sprint 1": [
        "Backend APIs implementation",
        "Database layer setup",
        "Authentication module",
    ],
    "Development Sprint 2": [
        "Frontend components",
        "User interface implementation",
        "Integration with APIs",
    ],
    "Testing & QA": [
        "Unit testing",
        "Integration testing",
        "Performance testing",
        "User acceptance testing",
    ],
    "Documentation": [
        "Technical documentation",
        "User manual creation",
        "API documentation",
    ],
    "User Training": [
        "Training material preparation",
        "Workshop sessions",
        "Support documentation",
    ],
    "Go-live Preparation": [
        "Environment setup",
        "Data validation",
        "Backup procedures",
        "Rollback plan",
    ],
    "Data Migration": [
        "Data extraction",
        "Data transformation",
        "Data validation",
        "Migration execution",
    ],
    "Integration Testing": [
        "Test case preparation",
        "System integration setup",
        "End-to-end testing",
    ],
};

const projectStatuses: ProjectStatus[] = [
    "Initiation",
    "Planning",
    "Execution",
    "Closure",
    "Closed",
];

const taskStatuses: ("To Do" | "In Progress" | "Done" | "Pending")[] = [
    "To Do",
    "In Progress",
    "Done",
    "Pending",
];

const hourlyRateTypes = ["SystemEngineer", "ProjectManager", "Developer", "QA", "BusinessAnalyst"];

export const customerList: Customer[] = swissCompanies.map((company, index) => ({
    customerID: 1000 + index,
    companyName: company.name,
    contactName: germanEmployees[index % germanEmployees.length].firstName + " " + germanEmployees[index % germanEmployees.length].lastName,
    email: `contact@${company.name.toLowerCase().replace(/\s+/g, "")}.ch`,
    phone: `+41 ${Math.floor(Math.random() * 89) + 1} ${Math.floor(Math.random() * 9000000) + 1000000}`,
    zip: parseInt(company.zip),
}));

export const customerEmployeeList: CustomerEmployee[] = customerList.flatMap((customer) =>
    germanEmployees.slice(0, 3).map((emp, index) => ({
        customerID: customer.customerID,
        employeeID: customer.customerID * 100 + index + 1,
        firstName: emp.firstName,
        lastName: emp.lastName,
        phone: `+41 79 ${Math.floor(Math.random() * 9000000) + 1000000}`,
        email: `${emp.firstName.toLowerCase()}.${emp.lastName.toLowerCase()}@${customer.companyName
            .toLowerCase()
            .replace(/\s+/g, "")}.ch`,
        jobTitle: jobTitles[Math.floor(Math.random() * jobTitles.length)],
        department: departments[Math.floor(Math.random() * departments.length)],
    })),
);

const initialProjectList: Project[] = realisticProjects.map((projTemplate, index) => {
    const customer = customerList[index % customerList.length];
    const managers = customerEmployeeList.filter((emp) => emp.customerID === customer.customerID);
    const manager = managers[0] || customerEmployeeList[0];
    
    const startDate = new Date(2026, 0 + Math.floor(index / 3), 1 + (index % 28));
    const dueDate = new Date(startDate);
    dueDate.setDate(dueDate.getDate() + projTemplate.duration);
    const projectID = 50000 + index;

    const phaseDuration = Math.floor(projTemplate.duration / 4);
    const initiationStart = new Date(startDate);
    const initiationDue = new Date(startDate.getTime() + phaseDuration * 24 * 60 * 60 * 1000);
    
    const planingStart = new Date(initiationDue);
    const planingDue = new Date(planingStart.getTime() + phaseDuration * 24 * 60 * 60 * 1000);
    
    const executionStart = new Date(planingDue);
    const executionDue = new Date(executionStart.getTime() + (phaseDuration * 1.5) * 24 * 60 * 60 * 1000);
    
    const closureStart = new Date(executionDue);
    const closureDue = new Date(dueDate);

    const buildPhase = (
        phaseid: number,
        phaseName: ProjectPhase["phaseName"],
        phaseStartDate: Date,
        phaseDueDate: Date,
    ): ProjectPhase => ({
        phaseid,
        projectID,
        phaseName,
        startDate: phaseStartDate,
        dueDate: phaseDueDate,
    });

    return {
        title: projTemplate.title,
        customerID: customer.customerID,
        customerName: customer.companyName,
        budget: projTemplate.budget,
        dueDate,
        startDate,
        projectID,
        projectManager: `${manager.firstName} ${manager.lastName}`,
        projectstatus: projectStatuses[Math.floor(Math.random() * projectStatuses.length)],
        initiationPhase: [
            buildPhase(projectID * 10 + 1, "Initiation", initiationStart, initiationDue),
        ],
        planingPhase: [
            buildPhase(projectID * 10 + 2, "Planing", planingStart, planingDue),
        ],
        executionPhase: [
            buildPhase(projectID * 10 + 3, "Execution", executionStart, executionDue),
        ],
        closurePhase: [
            buildPhase(projectID * 10 + 4, "Closure", closureStart, closureDue),
        ],
        Tasks: realisticTasks.map((taskTemplate, taskIndex) => {
            const phases: ProjectPhase["phaseName"][] = ["Initiation", "Planing", "Execution", "Closure"];
            const projectPhase = phases[Math.floor(Math.random() * phases.length)];
            
            const phaseLookup: Record<ProjectPhase["phaseName"], number> = {
                Initiation: projectID * 10 + 1,
                Planing: projectID * 10 + 2,
                Execution: projectID * 10 + 3,
                Closure: projectID * 10 + 4,
            };

            const taskStartDate = new Date(startDate);
            taskStartDate.setDate(taskStartDate.getDate() + Math.floor(Math.random() * 30));
            
            const taskDueDate = new Date(taskStartDate);
            taskDueDate.setDate(taskDueDate.getDate() + Math.floor(taskTemplate.hours / 8));

            const teamMember = managers[Math.floor(Math.random() * managers.length)];

            return {
                taskID: projectID * 100 + taskIndex,
                title: taskTemplate.name,
                startDate: taskStartDate,
                dueDate: taskDueDate,
                phaseId: phaseLookup[projectPhase],
                projectPhase,
                status: taskStatuses[Math.floor(Math.random() * taskStatuses.length)],
                projectID,
                description: `Task for ${projTemplate.title} - ${taskTemplate.name}`,
                assignedTo: `${teamMember.firstName} ${teamMember.lastName}`,
                notificationSent: false,
                estimatedHours: taskTemplate.hours,
                hourlyRateType: hourlyRateTypes[Math.floor(Math.random() * hourlyRateTypes.length)],
                subtasks: (realisticSubtasks[taskTemplate.name] || []).map((subtaskName, subtaskIndex) => {
                    const subtaskStartDate = new Date(taskStartDate);
                    subtaskStartDate.setDate(subtaskStartDate.getDate() + subtaskIndex);
                    
                    const subtaskDueDate = new Date(taskDueDate);
                    subtaskDueDate.setDate(subtaskDueDate.getDate() - Math.floor(Math.random() * 2));

                    const subtaskMember = managers[Math.floor(Math.random() * managers.length)];

                    return {
                        subtaskID: projectID * 1000 + taskIndex * 10 + subtaskIndex,
                        taskID: projectID * 100 + taskIndex,
                        title: subtaskName,
                        description: `Subtask: ${subtaskName}`,
                        status: taskStatuses[Math.floor(Math.random() * taskStatuses.length)],
                        assignedTo: `${subtaskMember.firstName} ${subtaskMember.lastName}`,
                        startDate: subtaskStartDate,
                        dueDate: subtaskDueDate,
                        estimatedHours: Math.floor(Math.random() * 30) + 5,
                        hourlyRateType: hourlyRateTypes[Math.floor(Math.random() * hourlyRateTypes.length)],
                    };
                }),
            };
        }),
    };
});

export const projectList = writable<Project[]>(initialProjectList);

export function addToListProject(project: Project) {
    projectList.update((projects) => [...projects, project]);
}