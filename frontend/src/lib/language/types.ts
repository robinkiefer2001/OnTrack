export type Language = "de" | "en";

export interface Translations {
  // Navigation
  nav: {
    home: string;
    projects: string;
    myProfile: string;
    employees: string;
    customers: string;
    settings: string;
    tasks: string;
    admin: string;
  };

  // Common
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    close: string;
    search: string;
    select: string;
    back: string;
    submit: string;
    actions: string;
    status: string;
    description: string;
    optional: string;
    hours: string;
    percent: string;
    cost: string;
    expand: string;
    collapse: string;
  };

  // Settings
  settings: {
    title: string;
    language: string;
    languageSettings: string;
    selectLanguage: string;
    hourlyRates: string;
    hourlyRatesTitle: string;
    rateType: string;
    ratePerHour: string;
    defaultRate: string;
    addRate: string;
    deleteRate: string;
    setAsDefault: string;
    areYouSure: string;
  };

  // Projects
  projects: {
    title: string;
    newProject: string;
    projectDetails: string;
    projectName: string;
    projectManager: string;
    customer: string;
    budget: string;
    totalHoursPool: string;
    startDate: string;
    dueDate: string;
    phases: string;
    tasks: string;
    addTask: string;
    taskName: string;
    assignedTo: string;
    phase: string;
    estimatedHours: string;
    hoursInput: string;
    percentOfPool: string;
    percentOfTask: string;
    hourlyRateType: string;
    subtasks: string;
    addSubtask: string;
    addSubtasks: string;
    currentSubtasks: string;
    subtaskName: string;
    duration: string;
    action: string;
    noTasks: string;
    selectCustomer: string;
    projectPhases: string;
    projectTimeline: string;
    projectSummary: string;
    assignedBudget: string;
    reserveBudget: string;
    budgetAllocation: string;
    hoursAndCosts: string;
    totalHoursPoolLabel: string;
    hoursAllocated: string;
    totalEstimatedCost: string;
    hoursUsage: string;
    availableHours: string;
    basedOnRates: string;
    hoursPoolExceeded: string;
    exceedMessage: string;
    budgetVsCost: string;
    initiation: string;
    planning: string;
    execution: string;
    closure: string;
    start: string;
    end: string;
    searchCustomer: string;
    enterTaskName: string;
    enterSubtaskName: string;
    namePlaceholder: string;
    descriptionPlaceholder: string;
    subtaskDescriptionPlaceholder: string;
    noTasksYet: string;
    selectPhase: string;
    deleteSelected: string;
    focus: string;
    projectNumber: string;
    printProjectState: string;
    modifyProject: string;
    showProject: string;
    notifications: string;
    typeHere: string;
    budgetPlaceholder: string;
    taskHoursPlaceholder: string;
    subtaskHoursPlaceholder: string;
    includingSubtasks: string;
    ofBudget: string;
    fullTextSearch: string;
    filterProjectManager: string;
    filterCustomer: string;
    allProjectManagers: string;
    allCustomers: string;
    currentPhase: string;
    onTrack: string;
    behind: string;
    budgetUsage: string;
    reserve: string;
    teamMembers: string;
    memberName: string;
    assignedTasks: string;
    memberBudget: string;
    memberWorkload: string;
    memberStatus: string;
    noTeamMembers: string;
    role: string;
    member: string;
  };

  // Customers
  customers: {
    title: string;
    companyName: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: string;
  };

  // Task Status
  taskStatus: {
    pending: string;
    toDo: string;
    inProgress: string;
    done: string;
  };

  // Project Status
  projectStatus: {
    initiation: string;
    planning: string;
    execution: string;
    closure: string;
    closed: string;
    cancelled: string;
  };

  // Messages
  messages: {
    subtaskDateBeforeTask: string;
    subtaskDateAfterTask: string;
    projectCreated: string;
    taskAdded: string;
    subtaskAdded: string;
    budgetExceeded: string;
  };

  // Home
  home: {
    welcome: string;
    description: string;
  };
}
