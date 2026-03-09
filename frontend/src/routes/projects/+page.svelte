<script lang="ts">
  import type {
    Project,
    ProjectStatus,
    Customer,
    ProjectPhase,
    Task,
    HourlyRate,
  } from "$lib/models/project";
  import {
    addToListProject,
    customerList,
    projectList,
  } from "$lib/models/mockupData";
  import { loadHourlyRates } from "$lib/models/hourlyRates";
  import ProjectsTable from "$lib/components/projects/ProjectsTable.svelte";
  import TaskRow from "$lib/components/projects/TaskRow.svelte";
  import PhaseBudgetStats from "$lib/components/projects/PhaseBudgetStats.svelte";
  import ProjectSummary from "$lib/components/projects/ProjectSummary.svelte";
  import {
    formatBudget,
    dueDateLabel,
  } from "$lib/features/projects/projectUtils";
  import ProjectsToolbar from "$lib/components/projects/ProjectsToolbar.svelte";
  import {
    getPhaseRange,
    getTaskCost,
    toDateOrNull,
    toInputDate,
  } from "$lib/features/projects/projectUtils";
  import { page } from "$app/stores";
  import TimelineChart from "./TimelineChart.svelte";
  import { t } from "$lib/language";

  // State
  let initProject: Project | null = null;
  let selectedProject: Project | null = null;
  let selectedCustomer: Customer | null = null;
  let showCustomerSelect = false;
  let selectedRow: number | null = null;
  let showForm = false;
  let currentProjectView = false;
  let timelineChartRef: InstanceType<typeof TimelineChart> | null = null;
  let hourlyRates: HourlyRate[] = loadHourlyRates();
  let projectFullTextSearch = "";
  let projectManagerFilter = "";
  let customerFilter = "";
  let customerSearchText = "";
  let lastQueryFromUrl = "";
  let projectManagers: string[] = [];
  let customers: string[] = [];
  let filteredProjects: Project[] = [];
  let filteredCustomerList: Customer[] = [];
  let expandedTeamMembers = new Set<string>();

  // Task form state
  let newTask = {
    title: "",
    description: "",
    status: "Pending",
    assignedTo: "",
    phaseid: null as number | null,
    projectPhase: "",
    dueDate: null as Date | string | null,
    startDate: null as Date | string | null,
    estimatedHours: null as number | null,
    hourlyRateType: "SystemEngineer",
  };

  // Subtask form state
  let newSubtask = {
    title: "",
    description: "",
    status: "Pending",
    assignedTo: "",
    dueDate: null as Date | string | null,
    startDate: null as Date | string | null,
    estimatedHours: null as number | null,
    hourlyRateType: "SystemEngineer",
  };

  let currentTaskSubtasks: Array<{
    subtaskID: number;
    taskID: number;
    title: string;
    description: string;
    status: "To Do" | "In Progress" | "Done" | "Pending";
    assignedTo: string;
    startDate: Date | null;
    dueDate: Date | null;
    estimatedHours: number | null;
    hourlyRateType: string;
  }> = [];

  // Selected tasks for bulk actions
  let selectedTasks = new Set<number>();

  $: projectManagers = Array.from(
    new Set(
      $projectList
        .map((p) => (p.projectManager || "").trim())
        .filter((v) => v.length > 0),
    ),
  ).sort((a, b) => a.localeCompare(b));

  $: customers = Array.from(
    new Set(
      $projectList
        .map((p) => (p.customerName || "").trim())
        .filter((v) => v.length > 0),
    ),
  ).sort((a, b) => a.localeCompare(b));

  $: filteredProjects = $projectList.filter((p) => {
    const fullText = projectFullTextSearch.trim().toLowerCase();
    const matchesProjectManager = !projectManagerFilter || p.projectManager === projectManagerFilter;
    const matchesCustomer = !customerFilter || p.customerName === customerFilter;

    if (!matchesProjectManager || !matchesCustomer) return false;
    if (!fullText) return true;

    const haystack = [
      p.title,
      p.customerName,
      p.projectManager,
      String(p.projectID || ""),
      p.projectstatus,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(fullText);
  });

  $: {
    const q = ($page.url.searchParams.get("q") || "").trim();
    if (q !== lastQueryFromUrl) {
      projectFullTextSearch = q;
      lastQueryFromUrl = q;
    }
  }

  $: filteredCustomerList = customerList.filter((c) => {
    const q = customerSearchText.trim().toLowerCase();
    if (!q) return true;
    return [c.companyName, c.contactName, c.email, c.phone]
      .join(" ")
      .toLowerCase()
      .includes(q);
  });

  $: taskPhaseRange = getPhaseRange(
    initProject,
    (newTask.projectPhase || "") as ProjectPhase["phaseName"] | "",
  );

  // Bidirectional sync: Project start = Initiation start
  $: if (initProject?.startDate && initProject?.initiationPhase[0]) {
    initProject.initiationPhase[0].startDate = initProject.startDate;
  }

  // Bidirectional sync: Project end = Closure end
  $: if (initProject?.dueDate && initProject?.closurePhase[0]) {
    initProject.closurePhase[0].dueDate = initProject.dueDate;
  }

  // Sync Initiation start back to Project start
  $: if (initProject?.initiationPhase[0]?.startDate && initProject) {
    if (initProject.startDate !== initProject.initiationPhase[0].startDate) {
      initProject.startDate = initProject.initiationPhase[0].startDate;
    }
  }

  // Sync Closure end back to Project end
  $: if (initProject?.closurePhase[0]?.dueDate && initProject) {
    if (initProject.dueDate !== initProject.closurePhase[0].dueDate) {
      initProject.dueDate = initProject.closurePhase[0].dueDate;
    }
  }

  // Synchronize phase dates: start date of next phase = due date of previous phase
  $: if (
    initProject?.initiationPhase[0]?.dueDate &&
    initProject?.planingPhase[0]
  ) {
    initProject.planingPhase[0].startDate =
      initProject.initiationPhase[0].dueDate;
  }
  $: if (
    initProject?.planingPhase[0]?.dueDate &&
    initProject?.executionPhase[0]
  ) {
    initProject.executionPhase[0].startDate =
      initProject.planingPhase[0].dueDate;
  }
  $: if (
    initProject?.executionPhase[0]?.dueDate &&
    initProject?.closurePhase[0]
  ) {
    initProject.closurePhase[0].startDate =
      initProject.executionPhase[0].dueDate;
  }

  function setTaskPhase(name: ProjectPhase["phaseName"]) {
    if (!initProject) return;

    newTask.projectPhase = name;
    // passende PhaseId aus deinen Arrays holen:
    const map: Record<ProjectPhase["phaseName"], number | null> = {
      Initiation: initProject.initiationPhase[0]?.phaseid ?? null,
      Planing: initProject.planingPhase[0]?.phaseid ?? null,
      Execution: initProject.executionPhase[0]?.phaseid ?? null,
      Closure: initProject.closurePhase[0]?.phaseid ?? null,
    };

    newTask.phaseid = map[name];

    const { start, end } = getPhaseRange(initProject, name);
    newTask.startDate = start;
    newTask.dueDate = end;
  }

  function newProject() {
    showForm = true;

    const projectId = Date.now(); // temporäre ID

    initProject = {
      title: "",
      customerID: null,
      customerName: "",
      budget: null,
      dueDate: null,
      startDate: null,
      projectID: projectId,
      projectManager: "",
      projectstatus: "Initiation" as ProjectStatus,
      initiationPhase: [
        {
          phaseid: projectId + 0,
          projectID: projectId,
          phaseName: "Initiation",
          startDate: null,
          dueDate: null,
        },
      ] as ProjectPhase[],
      planingPhase: [
        {
          phaseid: projectId + 1,
          projectID: projectId,
          phaseName: "Planing",
          startDate: null,
          dueDate: null,
        },
      ] as ProjectPhase[],
      executionPhase: [
        {
          phaseid: projectId + 2,
          projectID: projectId,
          phaseName: "Execution",
          startDate: null,
          dueDate: null,
        },
      ] as ProjectPhase[],
      closurePhase: [
        {
          phaseid: projectId + 3,
          projectID: projectId,
          phaseName: "Closure",
          startDate: null,
          dueDate: null,
        },
      ] as ProjectPhase[],
      Tasks: [],
    };
  }

  function selectCustomer() {
    showCustomerSelect = true;
    customerSearchText = "";
    return selectedCustomer;
  }

  function getAssignedBudget(project: Project): number {
    return (project.Tasks || []).reduce(
      (sum, task) => sum + getTaskCost(task, hourlyRates),
      0,
    );
  }

  function getTeamMembers(project: Project) {
    const members: Record<
      string,
      {
        name: string;
        role: "ProjectManager" | "Member";
        tasks: Task[];
        totalHours: number;
        totalBudget: number;
        isOnTrack: boolean;
      }
    > = {};

    // Add project manager as a member
    if (project.projectManager && project.projectManager.trim()) {
      const pmName = project.projectManager.trim();
      members[pmName] = {
        name: pmName,
        role: "ProjectManager",
        tasks: [],
        totalHours: 0,
        totalBudget: 0,
        isOnTrack: true,
      };
    }

    // Add all members from tasks
    (project.Tasks || []).forEach((task) => {
      const memberName = (task.assignedTo || "Unassigned").trim();
      if (!members[memberName]) {
        members[memberName] = {
          name: memberName,
          role: "Member",
          tasks: [],
          totalHours: 0,
          totalBudget: 0,
          isOnTrack: true,
        };
      }

      members[memberName].tasks.push(task);

      // Add task and subtask hours
      const taskHours = (task.estimatedHours || 0);
      const subtaskHours = (task.subtasks || []).reduce(
        (sum, st) => sum + (st.estimatedHours || 0),
        0,
      );
      members[memberName].totalHours += taskHours + subtaskHours;

      // Add task cost
      members[memberName].totalBudget += getTaskCost(task, hourlyRates);

      // Check if task is on track (not "Done" and before due date, or Done)
      const today = new Date();
      const taskDueDate = task.dueDate ? new Date(task.dueDate) : null;
      if (
        task.status !== "Done" &&
        taskDueDate &&
        today > taskDueDate
      ) {
        members[memberName].isOnTrack = false;
      }
    });

    // Sort: ProjectManager first, then others by name
    return Object.values(members).sort((a, b) => {
      if (a.role === "ProjectManager" && b.role !== "ProjectManager") return -1;
      if (a.role !== "ProjectManager" && b.role === "ProjectManager") return 1;
      return a.name.localeCompare(b.name);
    });
  }

  function cancelNewProject() {
    initProject = null;
    showForm = false;
  }

  function addTask() {
    if (!initProject || !newTask.title.trim()) return;

    const taskStart = toDateOrNull(newTask.startDate);
    const taskEnd = toDateOrNull(newTask.dueDate);

    if (!newTask.projectPhase || !taskStart || !taskEnd) return;

    const { start: phaseStartRaw, end: phaseEndRaw } = getPhaseRange(
      initProject,
      newTask.projectPhase as ProjectPhase["phaseName"],
    );
    const phaseStart = toDateOrNull(phaseStartRaw);
    const phaseEnd = toDateOrNull(phaseEndRaw);

    if (phaseStart && taskStart < phaseStart) return;
    if (phaseEnd && taskEnd > phaseEnd) return;
    if (taskStart > taskEnd) return;

    const task: Task = {
      taskID: Date.now(),
      projectID: initProject.projectID || 0,
      title: newTask.title,
      phaseId: newTask.phaseid,
      projectPhase: newTask.projectPhase,
      description: newTask.description,
      status: newTask.status as "Pending",
      assignedTo: newTask.assignedTo,
      dueDate: taskEnd,
      startDate: taskStart,
      notificationSent: false,
      estimatedHours: newTask.estimatedHours,
      hourlyRateType: newTask.hourlyRateType,
      subtasks: currentTaskSubtasks,
    };

    if (initProject.budget && initProject.budget > 0) {
      const nextAssignedBudget = getAssignedBudget(initProject) + getTaskCost(task, hourlyRates);
      if (nextAssignedBudget > initProject.budget) {
        alert($t.messages.budgetExceeded);
        return;
      }
    }

    initProject.Tasks = [...initProject.Tasks, task];

    newTask = {
      title: "",
      description: "",
      status: "Pending",
      assignedTo: "",
      dueDate: null,
      startDate: null,
      phaseid: null,
      projectPhase: "",
      estimatedHours: null,
      hourlyRateType: "SystemEngineer",
    };

    currentTaskSubtasks = [];
    newSubtask = {
      title: "",
      description: "",
      status: "Pending",
      assignedTo: "",
      dueDate: null,
      startDate: null,
      estimatedHours: null,
      hourlyRateType: "SystemEngineer",
    };
  }

  function removeTask(taskID: number) {
    if (!initProject) return;
    initProject.Tasks = initProject.Tasks.filter((t) => t.taskID !== taskID);
  }

  function addSubtask() {
    if (!newSubtask.title.trim()) return;

    const subtaskStart = toDateOrNull(newSubtask.startDate);
    const subtaskEnd = toDateOrNull(newSubtask.dueDate);
    const taskStart = toDateOrNull(newTask.startDate);
    const taskEnd = toDateOrNull(newTask.dueDate);

    // Validierung: Wenn Daten angegeben, müssen sie innerhalb der Task-Dauer sein
    if (subtaskStart && subtaskEnd) {
      if (subtaskStart > subtaskEnd) return;

      if (taskStart && subtaskStart < taskStart) {
        alert($t.messages.subtaskDateBeforeTask);
        return;
      }
      if (taskEnd && subtaskEnd > taskEnd) {
        alert($t.messages.subtaskDateAfterTask);
        return;
      }
    }

    const subtask = {
      subtaskID: Date.now() + Math.random(),
      taskID: 0, // Will be set when task is created
      title: newSubtask.title,
      description: newSubtask.description,
      status: newSubtask.status as "Pending",
      assignedTo: newSubtask.assignedTo,
      dueDate: subtaskEnd,
      startDate: subtaskStart,
      estimatedHours: newSubtask.estimatedHours,
      hourlyRateType: newSubtask.hourlyRateType,
    };

    currentTaskSubtasks = [...currentTaskSubtasks, subtask];

    newSubtask = {
      title: "",
      description: "",
      status: "Pending",
      assignedTo: "",
      dueDate: null,
      startDate: null,
      estimatedHours: null,
      hourlyRateType: "SystemEngineer",
    };
  }

  function removeSubtask(subtaskID: number | string) {
    currentTaskSubtasks = currentTaskSubtasks.filter(
      (st) => st.subtaskID !== subtaskID,
    );
  }

  function submitNewProject() {
    if (!initProject) return;

    const parsedBudget =
      initProject.budget === null || initProject.budget === 0
        ? null
        : Number(initProject.budget);

    const normalizedProject: Project = {
      ...initProject,
      budget: Number.isNaN(parsedBudget) ? null : parsedBudget,
      startDate: toDateOrNull(initProject.startDate as Date | string | null),
      dueDate: toDateOrNull(initProject.dueDate as Date | string | null),
    };

    if (normalizedProject.budget && normalizedProject.budget > 0) {
      const assignedBudget = getAssignedBudget(normalizedProject);
      if (assignedBudget > normalizedProject.budget) {
        alert($t.messages.budgetExceeded);
        return;
      }
    }

    showForm = false;
    addToListProject(normalizedProject);
    initProject = null;
  }

  function printOutProjectState() {
    console.log(initProject);
  }

  function showCurrentProject() {
    if (!selectedProject) return;

    currentProjectView = true;
  }

  function handleRowSelect(
    event: CustomEvent<{ index: number; project: Project }>,
  ) {
    const {
      detail: { index, project },
    } = event;
    const isSameRow = selectedRow === index;

    selectedRow = isSameRow ? null : index;
    selectedProject = isSameRow
      ? null
      : {
          title: project.title,
          customerID: project.customerID,
          customerName: project.customerName,
          budget: project.budget,
          dueDate: project.dueDate,
          startDate: project.startDate,
          projectID: project.projectID,
          projectManager: project.projectManager,
          projectstatus: project.projectstatus as ProjectStatus,
          Tasks: project.Tasks,
          initiationPhase: project.initiationPhase,
          planingPhase: project.planingPhase,
          executionPhase: project.executionPhase,
          closurePhase: project.closurePhase,
        };
  }

  function editTask(taskID: number) {
    if (!initProject) return;

    const task = initProject.Tasks.find((t) => t.taskID === taskID);
    if (!task) return;

    // Load task data into form
    newTask = {
      title: task.title,
      description: task.description || "",
      status: task.status,
      assignedTo: task.assignedTo || "",
      phaseid: task.phaseId,
      projectPhase: task.projectPhase || "",
      dueDate: task.dueDate ? task.dueDate.toISOString().split("T")[0] : null,
      startDate: task.startDate
        ? task.startDate.toISOString().split("T")[0]
        : null,
      estimatedHours: task.estimatedHours,
      hourlyRateType: task.hourlyRateType,
    };

    // Load subtasks
    currentTaskSubtasks = task.subtasks || [];

    // Remove the task from the list (it will be re-added when user clicks "Add Task")
    removeTask(taskID);
  }

  function toggleTaskSelection(taskID: number) {
    if (selectedTasks.has(taskID)) {
      selectedTasks.delete(taskID);
    } else {
      selectedTasks.add(taskID);
    }
    selectedTasks = selectedTasks; // Trigger reactivity
  }

  function toggleSelectAll() {
    if (!initProject) return;

    if (selectedTasks.size === initProject.Tasks.length) {
      selectedTasks.clear();
    } else {
      selectedTasks = new Set(initProject.Tasks.map((t) => t.taskID));
    }
    selectedTasks = selectedTasks; // Trigger reactivity
  }

  function deleteSelectedTasks() {
    if (!initProject || selectedTasks.size === 0) return;

    initProject.Tasks = initProject.Tasks.filter(
      (t) => !selectedTasks.has(t.taskID),
    );
    selectedTasks.clear();
    selectedTasks = selectedTasks; // Trigger reactivity
  }
</script>

<ProjectsToolbar
  {selectedProject}
  bind:fullTextSearch={projectFullTextSearch}
  bind:projectManagerFilter={projectManagerFilter}
  bind:customerFilter={customerFilter}
  {projectManagers}
  {customers}
  on:newProject={newProject}
  on:printProjectState={printOutProjectState}
  on:modifyProject={() => {
    /* modifyProject */
  }}
  on:showCurrentProject={showCurrentProject}
/>

<ProjectsTable
  projects={filteredProjects}
  {selectedRow}
  {hourlyRates}
  on:rowSelect={handleRowSelect}
/>

{#if currentProjectView}
  <div class="fixed inset-0 z-50 bg-gray-50 overflow-y-auto">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div
        class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between"
      >
        <div>
          <h1 class="text-3xl font-bold text-gray-900">
            {selectedProject?.title ?? "Project Details"}
          </h1>
          <p class="text-sm text-gray-500 mt-1">
            {selectedProject?.customerName ?? ""}
          </p>
        </div>
        <button
          class="btn btn-circle btn-ghost"
          on:click={() => (currentProjectView = false)}
          aria-label="Close project view"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-6 py-8">
      <!-- Project Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">{$t.projects.projectManager}</p>
              <p class="text-xl font-semibold text-gray-900 mt-1">
                {selectedProject?.projectManager ?? "-"}
              </p>
            </div>
            <div class="bg-blue-100 rounded-full p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">{$t.projects.budget}</p>
              <p class="text-xl font-semibold text-gray-900 mt-1">
                {formatBudget(selectedProject?.budget ?? null)}
              </p>
            </div>
            <div class="bg-green-100 rounded-full p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">{$t.projects.startDate}</p>
              <p class="text-xl font-semibold text-gray-900 mt-1">
                {dueDateLabel(selectedProject?.startDate ?? null)}
              </p>
            </div>
            <div class="bg-purple-100 rounded-full p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">{$t.projects.dueDate}</p>
              <p class="text-xl font-semibold text-gray-900 mt-1">
                {dueDateLabel(selectedProject?.dueDate ?? null)}
              </p>
            </div>
            <div class="bg-orange-100 rounded-full p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 text-orange-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Project Phases -->
      <div
        class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
      >
        <h2 class="text-2xl font-bold text-gray-900 mb-6">{$t.projects.projectPhases}</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="border-l-4 border-blue-500 pl-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">{$t.projects.initiation}</h3>
            <div class="space-y-1">
              <p class="text-sm text-gray-600">
                <span class="font-medium">{$t.projects.start}:</span>
                {dueDateLabel(
                  selectedProject?.initiationPhase[0]?.startDate ?? null,
                )}
              </p>
              <p class="text-sm text-gray-600">
                <span class="font-medium">{$t.projects.end}:</span>
                {dueDateLabel(
                  selectedProject?.initiationPhase[0]?.dueDate ?? null,
                )}
              </p>
            </div>
          </div>

          <div class="border-l-4 border-green-500 pl-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">{$t.projects.planning}</h3>
            <div class="space-y-1">
              <p class="text-sm text-gray-600">
                <span class="font-medium">{$t.projects.start}:</span>
                {dueDateLabel(
                  selectedProject?.planingPhase[0]?.startDate ?? null,
                )}
              </p>
              <p class="text-sm text-gray-600">
                <span class="font-medium">{$t.projects.end}:</span>
                {dueDateLabel(
                  selectedProject?.planingPhase[0]?.dueDate ?? null,
                )}
              </p>
            </div>
          </div>

          <div class="border-l-4 border-yellow-500 pl-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">{$t.projects.execution}</h3>
            <div class="space-y-1">
              <p class="text-sm text-gray-600">
                <span class="font-medium">{$t.projects.start}:</span>
                {dueDateLabel(
                  selectedProject?.executionPhase[0]?.startDate ?? null,
                )}
              </p>
              <p class="text-sm text-gray-600">
                <span class="font-medium">{$t.projects.end}:</span>
                {dueDateLabel(
                  selectedProject?.executionPhase[0]?.dueDate ?? null,
                )}
              </p>
            </div>
          </div>

          <div class="border-l-4 border-purple-500 pl-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">{$t.projects.closure}</h3>
            <div class="space-y-1">
              <p class="text-sm text-gray-600">
                <span class="font-medium">{$t.projects.start}:</span>
                {dueDateLabel(
                  selectedProject?.closurePhase[0]?.startDate ?? null,
                )}
              </p>
              <p class="text-sm text-gray-600">
                <span class="font-medium">{$t.projects.end}:</span>
                {dueDateLabel(
                  selectedProject?.closurePhase[0]?.dueDate ?? null,
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Project Hours & Cost Summary -->
      {#if selectedProject}
        <ProjectSummary project={selectedProject} rates={hourlyRates} />
      {/if}

      <!-- Phase Budget Stats -->
      {#if selectedProject}
        <PhaseBudgetStats project={selectedProject} rates={hourlyRates} />
      {/if}

      <!-- Timeline Chart -->
      <div
        class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
      >
        <h2 class="text-2xl font-bold text-gray-900 mb-6">{$t.projects.projectTimeline}</h2>
        <TimelineChart
          start={selectedProject?.startDate}
          end={selectedProject?.dueDate}
          tasks={selectedProject?.Tasks || []}
          phases={selectedProject
            ? {
                initiation: selectedProject.initiationPhase,
                planing: selectedProject.planingPhase,
                execution: selectedProject.executionPhase,
                closure: selectedProject.closurePhase,
              }
            : null}
        />
      </div>

      <!-- Team Members Overview -->
      {#if selectedProject}
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">{$t.projects.teamMembers}</h2>

          {#if getTeamMembers(selectedProject).length > 0}
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-gray-200">
                    <th class="w-12"></th>
                    <th class="text-left py-3 px-4 font-semibold text-gray-700">{$t.projects.memberName}</th>
                    <th class="text-center py-3 px-4 font-semibold text-gray-700">{$t.projects.role}</th>
                    <th class="text-center py-3 px-4 font-semibold text-gray-700">{$t.projects.assignedTasks}</th>
                    <th class="text-center py-3 px-4 font-semibold text-gray-700">{$t.projects.memberWorkload}</th>
                    <th class="text-right py-3 px-4 font-semibold text-gray-700">{$t.projects.memberBudget}</th>
                    <th class="text-center py-3 px-4 font-semibold text-gray-700">{$t.projects.memberStatus}</th>
                  </tr>
                </thead>
                <tbody>
                  {#each getTeamMembers(selectedProject) as member (member.name)}
                    <tr 
                      class="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      on:click={() => {
                        if (expandedTeamMembers.has(member.name)) {
                          expandedTeamMembers.delete(member.name);
                        } else {
                          expandedTeamMembers.add(member.name);
                        }
                        expandedTeamMembers = expandedTeamMembers;
                      }}
                    >
                      <td class="py-3 px-4 text-center">
                        <button class="btn btn-sm btn-ghost" on:click|stopPropagation>
                          {expandedTeamMembers.has(member.name) ? '−' : '+'}
                        </button>
                      </td>
                      <td class="py-3 px-4">
                        <p class="font-medium text-gray-900">{member.name}</p>
                      </td>
                      <td class="py-3 px-4 text-center">
                        <span class={`badge ${member.role === 'ProjectManager' ? 'badge-primary' : 'badge-outline'}`}>
                          {member.role === 'ProjectManager' ? $t.projects.projectManager : $t.projects.member}
                        </span>
                      </td>
                      <td class="py-3 px-4 text-center">
                        <span class="badge badge-outline">{member.tasks.length}</span>
                      </td>
                      <td class="py-3 px-4 text-center">
                        <p class="font-semibold text-gray-900">{member.totalHours}h</p>
                      </td>
                      <td class="py-3 px-4 text-right">
                        <p class="font-semibold text-gray-900">{formatBudget(member.totalBudget)}</p>
                      </td>
                      <td class="py-3 px-4 text-center">
                        <div class="flex items-center justify-center gap-2">
                          <div
                            class={`w-3 h-3 rounded-full ${
                              member.isOnTrack ? "bg-green-500" : "bg-red-500"
                            }`}
                          ></div>
                          <span class={`text-sm font-semibold ${member.isOnTrack ? 'text-green-600' : 'text-red-600'}`}>
                            {member.isOnTrack ? $t.projects.onTrack : $t.projects.behind}
                          </span>
                        </div>
                      </td>
                    </tr>

                    <!-- Expanded Details Row -->
                    {#if expandedTeamMembers.has(member.name) && member.tasks.length > 0}
                      <tr class="bg-gray-50 border-b border-gray-100">
                        <td colspan="7" class="p-0">
                          <div class="p-6 space-y-4">
                            <h4 class="text-lg font-semibold text-gray-900 mb-4">
                              {$t.projects.tasks} & {$t.projects.subtasks}
                            </h4>
                            <div class="space-y-3">
                              {#each member.tasks as task}
                                <div class="border-l-4 border-blue-500 pl-4 py-2 bg-white rounded p-3">
                                  <div class="flex items-start justify-between gap-4">
                                    <div class="flex-1">
                                      <p class="font-semibold text-gray-900">{task.title}</p>
                                      <p class="text-sm text-gray-600 mt-1">{task.description || '-'}</p>
                                      <div class="flex gap-2 mt-2">
                                        <span
                                          class="badge h-auto min-h-7 px-2 py-0.5 whitespace-nowrap text-xs"
                                          class:badge-neutral={task.status === "Pending"}
                                          class:badge-success={task.status === "Done"}
                                          class:badge-warning={task.status === "In Progress"}
                                          class:badge-info={task.status === "To Do"}
                                        >
                                          {task.status === "Pending"
                                            ? $t.taskStatus.pending
                                            : task.status === "To Do"
                                              ? $t.taskStatus.toDo
                                              : task.status === "In Progress"
                                                ? $t.taskStatus.inProgress
                                                : $t.taskStatus.done}
                                        </span>
                                        {#if task.projectPhase}
                                          <span class="badge badge-outline badge-sm">{task.projectPhase}</span>
                                        {/if}
                                      </div>
                                    </div>
                                    <div class="text-right whitespace-nowrap">
                                      <p class="text-sm text-gray-600">{task.estimatedHours || 0}h</p>
                                      <p class="text-sm font-semibold text-gray-900">
                                        {formatBudget(getTaskCost(task, hourlyRates))}
                                      </p>
                                      {#if task.dueDate}
                                        <p class="text-xs text-gray-500 mt-1">
                                          {dueDateLabel(task.dueDate)}
                                        </p>
                                      {/if}
                                    </div>
                                  </div>

                                  <!-- Subtasks -->
                                  {#if task.subtasks && task.subtasks.length > 0}
                                    <div class="mt-3 ml-4 space-y-2 border-l-2 border-gray-300 pl-4">
                                      {#each task.subtasks as subtask}
                                        <div class="py-2 bg-gray-100 rounded p-3">
                                          <div class="flex items-start justify-between gap-3">
                                            <div class="flex-1">
                                              <div class="flex items-center gap-2">
                                                <p class="font-medium text-gray-800 text-sm">{subtask.title}</p>
                                                {#if subtask.assignedTo}
                                                  <span class="text-xs text-gray-600 bg-white px-2 py-1 rounded">
                                                    {subtask.assignedTo}
                                                  </span>
                                                {/if}
                                              </div>
                                              {#if subtask.description}
                                                <p class="text-xs text-gray-600 mt-1">{subtask.description}</p>
                                              {/if}
                                              <div class="flex gap-2 mt-2">
                                                <span
                                                  class="badge badge-sm h-auto px-2 py-0.5"
                                                  class:badge-neutral={subtask.status === "Pending"}
                                                  class:badge-success={subtask.status === "Done"}
                                                  class:badge-warning={subtask.status === "In Progress"}
                                                  class:badge-info={subtask.status === "To Do"}
                                                >
                                                  {subtask.status === "Pending"
                                                    ? $t.taskStatus.pending
                                                    : subtask.status === "To Do"
                                                      ? $t.taskStatus.toDo
                                                      : subtask.status === "In Progress"
                                                        ? $t.taskStatus.inProgress
                                                        : $t.taskStatus.done}
                                                </span>
                                              </div>
                                            </div>
                                            <div class="text-right whitespace-nowrap text-xs">
                                              <p class="text-gray-600">{subtask.estimatedHours || 0}h</p>
                                              {#if subtask.dueDate}
                                                <p class="text-gray-500 mt-1">
                                                  {dueDateLabel(subtask.dueDate)}
                                                </p>
                                              {/if}
                                            </div>
                                          </div>
                                        </div>
                                      {/each}
                                    </div>
                                  {/if}
                                </div>
                              {/each}
                            </div>
                          </div>
                        </td>
                      </tr>
                    {/if}
                  {/each}
                </tbody>
              </table>
            </div>
          {:else}
            <div class="text-center py-8">
              <p class="text-gray-500">{$t.projects.noTeamMembers}</p>
            </div>
          {/if}
        </div>
      {/if}

      <!-- Tasks List -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-900">
            {$t.projects.tasks} ({selectedProject?.Tasks.length || 0})
          </h2>
        </div>

        {#if selectedProject && selectedProject.Tasks.length > 0}
          <div class="overflow-x-auto">
            <table class="table w-full">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="text-left py-3 px-4 font-semibold text-gray-700"
                    >{$t.projects.taskName}</th
                  >
                  <th class="text-left py-3 px-4 font-semibold text-gray-700"
                    >{$t.common.description}</th
                  >
                  <th class="text-left py-3 px-4 font-semibold text-gray-700"
                    >{$t.projects.assignedTo}</th
                  >
                  <th class="text-left py-3 px-4 font-semibold text-gray-700"
                    >{$t.common.status}</th
                  >
                  <th class="text-left py-3 px-4 font-semibold text-gray-700"
                    >{$t.projects.phase}</th
                  >
                  <th class="text-left py-3 px-4 font-semibold text-gray-700"
                    >{$t.projects.startDate}</th
                  >
                  <th class="text-left py-3 px-4 font-semibold text-gray-700"
                    >{$t.projects.dueDate}</th
                  >
                  <th class="text-left py-3 px-4 font-semibold text-gray-700"
                    >{$t.common.hours}</th
                  >
                  <th class="text-left py-3 px-4 font-semibold text-gray-700"
                    >{$t.common.cost}</th
                  >
                </tr>
              </thead>
              <tbody>
                {#each selectedProject.Tasks as task}
                  <TaskRow
                    {task}
                    rates={hourlyRates}
                    projectBudget={selectedProject.budget}
                  />
                {/each}
              </tbody>
            </table>
          </div>
        {:else}
          <div class="text-center py-12">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-16 w-16 mx-auto text-gray-300 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
            <p class="text-gray-500 text-lg">
              {$t.projects.noTasks}
            </p>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

{#if showForm}
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div
      class="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6"
    >
      <div class="tabs tabs-lift content-center">
        <input
          type="radio"
          name="my_tabs_1"
          class="tab"
          aria-label={$t.projects.projectDetails}
          checked={true}
        />
        <div class="tab-content bg-base-100 border-base-300 p-6">
          <div class="grid grid-cols-3 gap-6 mb-4">
            <div class="flex-1">
              <p class="text-2xl font-bold mb-4">{$t.projects.projectName}</p>
              <input
                type="text"
                placeholder={$t.projects.typeHere}
                class="input"
                bind:value={initProject!.title}
              />
            </div>
            <div class="flex-1">
              <p class="text-2xl font-bold mb-4">{$t.projects.customer}</p>
              <input
                type="text"
                placeholder={$t.projects.typeHere}
                class="input"
                bind:value={initProject!.customerName}
                readonly
                required
              />
              <button class="btn btn-neutral" on:click={selectCustomer}>
                {$t.projects.selectCustomer}
              </button>
              {#if showCustomerSelect}
                <div
                  class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                >
                  <div class="bg-white p-4 rounded-lg shadow-xl w-80">
                    <input
                      type="text"
                      placeholder={$t.projects.searchCustomer}
                      class="input w-full mb-4"
                      bind:value={customerSearchText}
                    />
                    <ul class="menu bg-base-100 w-full">
                      {#each filteredCustomerList as c}
                        <li>
                          <button
                            on:click={() => {
                              initProject!.customerID = c.customerID;
                              initProject!.customerName = c.companyName;
                              showCustomerSelect = false;
                            }}
                          >
                            {c.companyName}
                          </button>
                        </li>
                      {/each}
                    </ul>
                    <button
                      class="btn btn-neutral absolute top-4 right-4"
                      on:click={() => {
                        showCustomerSelect = false;
                      }}
                    >
                      {$t.common.close}</button
                    >
                  </div>
                </div>
              {/if}
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-bold mb-4">{$t.projects.projectManager}</h3>
              <input
                type="text"
                placeholder={$t.projects.typeHere}
                class="input"
                bind:value={initProject!.projectManager}
              />
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-bold mb-4">{$t.projects.budget}</h3>
              <input
                type="number"
                placeholder={$t.projects.budgetPlaceholder}
                class="input"
                bind:value={initProject!.budget}
                min="0"
                step="0.01"
              />
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-bold mb-4">{$t.projects.startDate}</h3>
              <input
                type="date"
                placeholder={$t.projects.typeHere}
                class="input"
                bind:value={initProject!.startDate}
              />
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-bold mb-4">{$t.projects.dueDate}</h3>
              <input
                type="date"
                placeholder={$t.projects.typeHere}
                class="input"
                bind:value={initProject!.dueDate}
              />
            </div>
          </div>
        </div>
        <input
          type="radio"
          name="my_tabs_1"
          class="tab"
          aria-label={$t.projects.projectPhases}
        />
        <div class="tab-content bg-base-100 border-base-300 px-6 py-4">
          <!-- Task-Form -->
          <div class="grid grid-cols-2 gap-4 mb-4">
            <label class="form-control w-full">
              <div class="label">
                <h3 class="text-xl font-bold mb-4">{$t.projects.initiation}</h3>
              </div>
              <p>{$t.projects.startDate}</p>
              <input
                type="date"
                class="input"
                bind:value={initProject!.initiationPhase[0].startDate}
                readonly
              />
              <p>{$t.projects.dueDate}</p>
              <input
                type="date"
                class="input"
                bind:value={initProject!.initiationPhase[0].dueDate}
                min={toInputDate(initProject!.initiationPhase[0].startDate) ||
                  undefined}
                max={toInputDate(initProject!.dueDate) || undefined}
              />
            </label>
            <label class="form-control w-full">
              <div class="label">
                <h3 class="text-xl font-bold mb-4">{$t.projects.planning}</h3>
              </div>
              <p>{$t.projects.startDate}</p>
              <input
                type="date"
                class="input"
                bind:value={initProject!.planingPhase[0].startDate}
                readonly
              />
              <p>{$t.projects.dueDate}</p>
              <input
                type="date"
                class="input"
                bind:value={initProject!.planingPhase[0].dueDate}
                min={toInputDate(initProject!.planingPhase[0].startDate) ||
                  undefined}
                max={toInputDate(initProject!.dueDate) || undefined}
              />
            </label>
            <label class="form-control w-full">
              <div class="label">
                <h3 class="text-xl font-bold mb-4">{$t.projects.execution}</h3>
              </div>
              <p>{$t.projects.startDate}</p>
              <input
                type="date"
                class="input"
                bind:value={initProject!.executionPhase[0].startDate}
                readonly
              />
              <p>{$t.projects.dueDate}</p>
              <input
                type="date"
                class="input"
                bind:value={initProject!.executionPhase[0].dueDate}
                min={toInputDate(initProject!.executionPhase[0].startDate) ||
                  undefined}
                max={toInputDate(initProject!.dueDate) || undefined}
              />
            </label>
            <label class="form-control w-full">
              <div class="label">
                <h3 class="text-xl font-bold mb-4">{$t.projects.closure}</h3>
              </div>
              <p>{$t.projects.startDate}</p>
              <input
                type="date"
                class="input"
                bind:value={initProject!.closurePhase[0].startDate}
                readonly
              />
              <p>{$t.projects.dueDate}</p>
              <input
                type="date"
                class="input"
                bind:value={initProject!.closurePhase[0].dueDate}
                readonly
              />
            </label>
          </div>
        </div>

        <!-- Tab 2: Tasks + Timeline -->
        <input
          type="radio"
          name="my_tabs_1"
          class="tab"
          aria-label={$t.projects.tasks}
          checked
        />
        <div class="tab-content bg-base-100 border-base-300 px-6 py-4">
          <!-- Task-Form -->
          <div class="grid grid-cols-2 gap-4 mb-4">
            <label class="form-control w-full">
              <div class="label">
                <h3 class="text-xl font-bold mb-4">{$t.projects.taskName}</h3>
              </div>
              <input
                type="text"
                class="input"
                placeholder={$t.projects.enterTaskName}
                bind:value={newTask.title}
              />
            </label>

            <label class="form-control w-full">
              <div class="label">
                <h3 class="text-xl font-bold mb-4">{$t.projects.assignedTo}</h3>
              </div>
              <input
                type="text"
                class="input"
                placeholder={$t.projects.namePlaceholder}
                bind:value={newTask.assignedTo}
              />
            </label>

            <div class="form-control w-full">
              <h3 class="text-xl font-bold mb-4">{$t.common.status}</h3>
              <input
                type="text"
                class="input input-bordered w-full"
                value={$t.taskStatus.pending}
                readonly
                disabled
              />
            </div>

            <label class="form-control w-full">
              <div class="label">
                <h3 class="text-xl font-bold mb-2">{$t.projects.phase}</h3>
              </div>

              <select
                class="select select-bordered w-full"
                bind:value={newTask.projectPhase}
                on:change={(e) =>
                  setTaskPhase(
                    e.currentTarget.value as ProjectPhase["phaseName"],
                  )}
              >
                <option disabled selected value="">{$t.projects.selectPhase}</option>
                <option value="Initiation">{$t.projects.initiation}</option>
                <option value="Planing">{$t.projects.planning}</option>
                <option value="Execution">{$t.projects.execution}</option>
                <option value="Closure">{$t.projects.closure}</option>
              </select>
            </label>

            <label class="form-control w-full">
              <div class="label">
                <h3 class="text-xl font-bold mb-4">{$t.projects.startDate}</h3>
              </div>
              <input
                type="date"
                class="input"
                bind:value={newTask.startDate}
                min={taskPhaseRange.start || undefined}
                max={taskPhaseRange.end || undefined}
                disabled={!newTask.projectPhase}
              />
            </label>

            <label class="form-control w-full">
              <div class="label">
                <h3 class="text-xl font-bold mb-4">{$t.projects.dueDate}</h3>
              </div>
              <input
                type="date"
                class="input"
                bind:value={newTask.dueDate}
                min={taskPhaseRange.start || undefined}
                max={taskPhaseRange.end || undefined}
                disabled={!newTask.projectPhase}
              />
            </label>

            <label class="form-control w-full">
              <div class="label">
                <h3 class="text-xl font-bold mb-4">{$t.common.description}</h3>
              </div>
              <textarea
                class="textarea span-2"
                rows="3"
                placeholder={$t.projects.descriptionPlaceholder}
                bind:value={newTask.description}
              ></textarea>
            </label>

            <label class="form-control w-full">
              <div class="label">
                <h3 class="text-lg font-bold mb-2">{$t.projects.estimatedHours}</h3>
              </div>
              <input
                type="number"
                class="input"
                placeholder={$t.projects.taskHoursPlaceholder}
                bind:value={newTask.estimatedHours}
                min="0"
                step="0.5"
              />
            </label>

            <label class="form-control w-full">
              <div class="label">
                <h3 class="text-xl font-bold mb-4">{$t.projects.hourlyRateType}</h3>
              </div>
              <select
                class="select select-bordered w-full"
                bind:value={newTask.hourlyRateType}
              >
                {#each hourlyRates as rate (rate.rateID)}
                  <option value={rate.rateType}>{rate.rateType}</option>
                {/each}
              </select>
            </label>
          </div>

          <!-- Subtasks Section -->
          <div class="divider"></div>
          <h3 class="text-xl font-bold mb-4">{$t.projects.addSubtasks}</h3>

          <div class="grid grid-cols-2 gap-4 mb-4">
            <label class="form-control w-full">
              <div class="label">
                <h3 class="text-lg font-bold mb-2">{$t.projects.subtaskName}</h3>
              </div>
              <input
                type="text"
                class="input"
                placeholder={$t.projects.enterSubtaskName}
                bind:value={newSubtask.title}
              />
            </label>

            <label class="form-control w-full">
              <div class="label">
                <h3 class="text-lg font-bold mb-2">{$t.projects.assignedTo}</h3>
              </div>
              <input
                type="text"
                class="input"
                placeholder={$t.projects.namePlaceholder}
                bind:value={newSubtask.assignedTo}
              />
            </label>

            <label class="form-control w-full">
              <div class="label">
                <h3 class="text-lg font-bold mb-2">{$t.projects.startDate}</h3>
              </div>
              <input
                type="date"
                class="input"
                bind:value={newSubtask.startDate}
                min={taskPhaseRange.start || undefined}
                max={taskPhaseRange.end || undefined}
              />
            </label>

            <label class="form-control w-full">
              <div class="label">
                <h3 class="text-lg font-bold mb-2">{$t.projects.dueDate}</h3>
              </div>
              <input
                type="date"
                class="input"
                bind:value={newSubtask.dueDate}
                min={taskPhaseRange.start || undefined}
                max={taskPhaseRange.end || undefined}
              />
            </label>

            <label class="form-control w-full">
              <div class="label">
                <h3 class="text-sm font-bold mb-2">{$t.projects.estimatedHours}</h3>
              </div>
              <input
                type="number"
                class="input input-sm"
                placeholder={$t.projects.subtaskHoursPlaceholder}
                bind:value={newSubtask.estimatedHours}
                min="0"
                step="0.5"
              />
            </label>

            <label class="form-control w-full">
              <div class="label">
                <h3 class="text-lg font-bold mb-2">{$t.projects.hourlyRateType}</h3>
              </div>
              <select
                class="select select-bordered w-full"
                bind:value={newSubtask.hourlyRateType}
              >
                {#each hourlyRates as rate (rate.rateID)}
                  <option value={rate.rateType}>{rate.rateType}</option>
                {/each}
              </select>
            </label>

            <label class="form-control w-full">
              <div class="label">
                <h3 class="text-lg font-bold mb-2">{$t.common.description}</h3>
              </div>
              <textarea
                class="textarea"
                rows="2"
                placeholder={$t.projects.subtaskDescriptionPlaceholder}
                bind:value={newSubtask.description}
              ></textarea>
            </label>
          </div>

          <button
            type="button"
            class="btn btn-secondary mb-4"
            on:click={addSubtask}
            disabled={!newSubtask.title.trim()}
          >
            {$t.projects.addSubtask}
          </button>

          <!-- Subtasks List -->
          {#if currentTaskSubtasks.length > 0}
            <h4 class="text-lg font-bold mb-3">
              {$t.projects.currentSubtasks} ({currentTaskSubtasks.length})
            </h4>
            <div class="overflow-x-auto mb-4">
              <table class="table w-full">
                <thead>
                  <tr>
                    <th>{$t.projects.subtasks}</th>
                    <th>{$t.projects.assignedTo}</th>
                    <th>{$t.common.hours}</th>
                    <th>{$t.projects.duration}</th>
                    <th>{$t.projects.action}</th>
                  </tr>
                </thead>
                <tbody>
                  {#each currentTaskSubtasks as subtask (subtask.subtaskID)}
                    <tr>
                      <td>
                        <div>
                          <p class="font-semibold">{subtask.title}</p>
                          <p class="text-sm text-gray-500">
                            {subtask.description || "-"}
                          </p>
                        </div>
                      </td>
                      <td>{subtask.assignedTo || "-"}</td>
                      <td>
                        <span class="font-semibold"
                          >{subtask.estimatedHours || 0}h</span
                        >
                      </td>
                      <td>
                        {#if subtask.startDate && subtask.dueDate}
                          {Math.ceil(
                            (new Date(subtask.dueDate).getTime() -
                              new Date(subtask.startDate).getTime()) /
                              (1000 * 60 * 60 * 24),
                          )}d
                        {:else}
                          <span class="text-gray-400 italic">{$t.common.optional}</span>
                        {/if}
                      </td>
                      <td>
                        <button
                          type="button"
                          class="btn btn-sm btn-error btn-outline"
                          on:click={() => removeSubtask(subtask.subtaskID)}
                        >
                          {$t.common.delete}
                        </button>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {/if}

          <button
            type="button"
            class="btn btn-primary mb-4"
            on:click={addTask}
            disabled={!newTask.title.trim() || !newTask.projectPhase}
          >
            {$t.projects.addTask}
          </button>

          <!-- Task-Liste -->
          <h3 class="text-xl font-bold mb-4">
            {$t.projects.tasks} ({initProject?.Tasks.length || 0})
          </h3>

          {#if initProject && initProject.Tasks.length > 0}
            <div class="overflow-x-auto">
              <table class="table w-full">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        class="checkbox"
                        checked={initProject.Tasks.length > 0 &&
                          selectedTasks.size === initProject.Tasks.length}
                        on:change={toggleSelectAll}
                      />
                    </th>
                    <th>{$t.projects.taskName}</th>
                    <th>{$t.common.description}</th>
                    <th>{$t.projects.assignedTo}</th>
                    <th>{$t.common.status}</th>
                    <th>{$t.projects.phase}</th>
                    <th>{$t.projects.dueDate}</th>
                    <th>{$t.projects.action}</th>
                  </tr>
                </thead>
                <tbody>
                  {#each initProject.Tasks as task}
                    <tr>
                      <td>
                        <input
                          type="checkbox"
                          class="checkbox"
                          checked={selectedTasks.has(task.taskID)}
                          on:change={() => toggleTaskSelection(task.taskID)}
                        />
                      </td>
                      <td class="font-semibold">{task.title}</td>
                      <td class="max-w-xs truncate">
                        {task.description || "-"}
                      </td>
                      <td>{task.assignedTo || "-"}</td>
                      <td>
                        <span
                          class="badge h-auto min-h-8 px-3 py-1 whitespace-nowrap"
                          class:badge-neutral={task.status === "Pending"}
                          class:badge-success={task.status === "Done"}
                          class:badge-warning={task.status === "In Progress"}
                          class:badge-info={task.status === "To Do"}
                        >
                          {task.status === "Pending"
                            ? $t.taskStatus.pending
                            : task.status === "To Do"
                              ? $t.taskStatus.toDo
                              : task.status === "In Progress"
                                ? $t.taskStatus.inProgress
                                : $t.taskStatus.done}
                        </span>
                      </td>
                      <td>
                        <span class="badge badge-outline">
                          {task.projectPhase || "-"}
                        </span>
                      </td>
                      <td>
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString("de-CH")
                          : "-"}
                      </td>
                      <td class="space-x-2">
                        <button
                          type="button"
                          class="btn btn-sm btn-warning btn-outline"
                          on:click={() => editTask(task.taskID)}
                        >
                          {$t.common.edit}
                        </button>
                        <button
                          type="button"
                          class="btn btn-sm btn-error btn-outline"
                          on:click={() => removeTask(task.taskID)}
                        >
                          {$t.common.delete}
                        </button>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {:else}
            <div class="alert alert-info mt-4">
              <span>{$t.projects.noTasksYet}</span>
            </div>
          {/if}

          <!-- Actions + Timeline -->
          {#if initProject?.Tasks.length}
            <div class="flex gap-4 mb-4 mt-8">
              <button
                class="btn btn-error"
                on:click={deleteSelectedTasks}
                disabled={selectedTasks.size === 0}
              >
                {$t.projects.deleteSelected} ({selectedTasks.size})
              </button>
            </div>

            <ul class="menu menu-horizontal bg-base-100 rounded-box gap-2 mb-4">
              <li>
                <button
                  class="btn btn-soft"
                  on:click={() => timelineChartRef?.resetFocus()}
                >
                  {$t.projects.focus}
                </button>
              </li>
            </ul>
          {/if}

          <TimelineChart
            bind:this={timelineChartRef}
            start={initProject?.startDate}
            end={initProject?.dueDate}
            tasks={initProject?.Tasks || []}
            phases={initProject
              ? {
                  initiation: initProject.initiationPhase,
                  planing: initProject.planingPhase,
                  execution: initProject.executionPhase,
                  closure: initProject.closurePhase,
                }
              : null}
          />
        </div>

        <!-- Tab 3: Notifications (leer) -->
        <input
          type="radio"
          name="my_tabs_1"
          class="tab"
          aria-label={$t.projects.notifications}
          checked
        />
        <div class="tab-content bg-base-100 border-base-300 p-6"></div>
      </div>

      <div class="flex gap-4 mt-4">
        <button type="button" class="btn" on:click={submitNewProject}>
          {$t.common.submit}
        </button>
        <button
          type="button"
          class="btn btn-neutral"
          on:click={cancelNewProject}
        >
          {$t.common.cancel}
        </button>
      </div>
    </div>
  </div>
{/if}
