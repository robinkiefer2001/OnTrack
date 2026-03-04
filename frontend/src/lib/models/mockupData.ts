import type { customer, customerEmployee, Project, ProjectStatus } from "./project";

const firstNames = [
    "Liam",
    "Emma",
    "Noah",
    "Olivia",
    "Elijah",
    "Ava",
    "Sophia",
    "Mason",
    "Isabella",
    "Lucas",
    "Mia",
    "Charlotte",
    "Amelia",
    "James",
    "Benjamin",
];

const lastNames = [
    "Miller",
    "Schmidt",
    "Wagner",
    "Fischer",
    "Meyer",
    "Hoffmann",
    "Schneider",
    "Bauer",
    "Klein",
    "Wolf",
    "Becker",
    "Hartmann",
];

const companyPrefixes = [
    "Nova",
    "Apex",
    "Vertex",
    "Blue",
    "Prime",
    "Quantum",
    "Nimbus",
    "Atlas",
    "Delta",
    "Pulse",
    "Skyline",
    "Orbit",
];

const companySuffixes = ["Solutions", "Systems", "Labs", "Consulting", "Works", "Group"];

const jobTitles = [
    "Project Coordinator",
    "Team Lead",
    "Operations Manager",
    "Business Analyst",
    "Technical Specialist",
    "Product Owner",
];

const departments = ["Operations", "IT", "Finance", "Sales", "Marketing", "HR"];

const projectTitles = [
    "Cloud Migration",
    "CRM Rollout",
    "Security Audit",
    "Mobile App Upgrade",
    "Data Warehouse Build",
    "API Platform",
    "ERP Integration",
    "Analytics Dashboard",
    "Website Relaunch",
    "Helpdesk Automation",
    "Compliance Program",
    "Process Optimization",
    "Infrastructure Refresh",
    "Customer Portal",
    "AI Prototype",
    "Reporting Overhaul",
];

const statuses: ProjectStatus[] = [
    "Initiation",
    "Planning",
    "Execution",
    "Monitoring",
    "Closure",
    "Closed",
    "Cancelled",
];

function randomFrom<T>(list: T[]): T {
    return list[Math.floor(Math.random() * list.length)];
}

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildFullName(): string {
    return `${randomFrom(firstNames)} ${randomFrom(lastNames)}`;
}

function buildCompanyName(index: number): string {
    return `${randomFrom(companyPrefixes)} ${randomFrom(companySuffixes)} ${index + 1}`;
}

export const customerList: customer[] = Array.from({ length: 10 }, (_, index) => {
    const customerID = 10000 + index;
    const contactName = buildFullName();
    const companyName = buildCompanyName(index);
    const companySlug = companyName.toLowerCase().replace(/\s+/g, "");

    return {
        customerID,
        companyName,
        contactName,
        email: `contact@${companySlug}.com`,
        phone: `+49 30 ${randomInt(1000000, 9999999)}`,
        zip: randomInt(10000, 99999),
    };
});

export const customerEmployeeList: customerEmployee[] = customerList.flatMap((customer) =>
    Array.from({ length: 5 }, (_, index) => {
        const firstName = randomFrom(firstNames);
        const lastName = randomFrom(lastNames);

        return {
            customerID: customer.customerID,
            employeeID: customer.customerID * 100 + index + 1,
            firstName,
            lastName,
            phone: `+49 170 ${randomInt(1000000, 9999999)}`,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${customer.companyName
                .toLowerCase()
                .replace(/\s+/g, "")}.com`,
            jobTitle: randomFrom(jobTitles),
            department: randomFrom(departments),
        };
    }),
);

export const projectList: Project[] = Array.from({ length: 20 }, (_, index) => {
    const projectCustomer = randomFrom(customerList);
    const managers = customerEmployeeList.filter(
        (employee) => employee.customerID === projectCustomer.customerID,
    );
    const manager = randomFrom(managers);
    const startDate = new Date(2026, randomInt(0, 11), randomInt(1, 28));
    const dueDate = new Date(startDate);
    dueDate.setDate(dueDate.getDate() + randomInt(30, 240));

    return {
        title: `${randomFrom(projectTitles)} ${index + 1}`,
        customerID: projectCustomer.customerID,
        customerName: projectCustomer.companyName,
        budget: randomInt(50000, 1500000),
        dueDate,
        startDate,
        projectID: 50000 + index,
        projectManager: `${manager.firstName} ${manager.lastName}`,
        projectstatus: randomFrom(statuses),
    };
});