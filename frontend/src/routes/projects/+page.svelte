<script lang="ts">
  import type {
    Project,
    ProjectStatus,
    Customer,
    ProjectPhase,
    Task,
  } from "$lib/models/project";
  import {
    addToListProject,
    customerList,
    projectList,
  } from "$lib/models/mockupData";
  import ProjectsTable from "$lib/components/projects/ProjectsTable.svelte";
  import {
    formatBudget,
    dueDateLabel,
  } from "$lib/features/projects/projectUtils";
  import ProjectsToolbar from "$lib/components/projects/ProjectsToolbar.svelte";
  import {
    getPhaseRange,
    toDateOrNull,
    toInputDate,
  } from "$lib/features/projects/projectUtils";
  import TimelineChart from "./TimelineChart.svelte";

  // State
  let initProject: Project | null = null;
  let selectedProject: Project | null = null;
  let selectedCustomer: Customer | null = null;
  let showCustomerSelect = false;
  let selectedRow: number | null = null;
  let showForm = false;
  let currentProjectView = false;
  let timelineChartRef: InstanceType<typeof TimelineChart> | null = null;

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
  };

  // Selected tasks for bulk actions
  let selectedTasks = new Set<number>();
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
    return selectedCustomer;
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
    };

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
    };
  }

  function removeTask(taskID: number) {
    if (!initProject) return;
    initProject.Tasks = initProject.Tasks.filter((t) => t.taskID !== taskID);
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
    };

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
  on:newProject={newProject}
  on:printProjectState={printOutProjectState}
  on:modifyProject={() => {
    /* modifyProject */
  }}
  on:showCurrentProject={showCurrentProject}
/>

<ProjectsTable
  projects={$projectList}
  {selectedRow}
  on:rowSelect={handleRowSelect}
/>

{#if currentProjectView}
  <div class="fixed inset-0 z-50 bg-gray-50 overflow-y-auto">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
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
              <p class="text-sm font-medium text-gray-500">Project Manager</p>
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
              <p class="text-sm font-medium text-gray-500">Budget</p>
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
              <p class="text-sm font-medium text-gray-500">Start Date</p>
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
              <p class="text-sm font-medium text-gray-500">Due Date</p>
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
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Project Phases</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="border-l-4 border-blue-500 pl-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Initiation</h3>
            <div class="space-y-1">
              <p class="text-sm text-gray-600">
                <span class="font-medium">Start:</span>
                {dueDateLabel(selectedProject?.initiationPhase[0]?.startDate ?? null)}
              </p>
              <p class="text-sm text-gray-600">
                <span class="font-medium">End:</span>
                {dueDateLabel(selectedProject?.initiationPhase[0]?.dueDate ?? null)}
              </p>
            </div>
          </div>

          <div class="border-l-4 border-green-500 pl-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Planning</h3>
            <div class="space-y-1">
              <p class="text-sm text-gray-600">
                <span class="font-medium">Start:</span>
                {dueDateLabel(selectedProject?.planingPhase[0]?.startDate ?? null)}
              </p>
              <p class="text-sm text-gray-600">
                <span class="font-medium">End:</span>
                {dueDateLabel(selectedProject?.planingPhase[0]?.dueDate ?? null)}
              </p>
            </div>
          </div>

          <div class="border-l-4 border-yellow-500 pl-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Execution</h3>
            <div class="space-y-1">
              <p class="text-sm text-gray-600">
                <span class="font-medium">Start:</span>
                {dueDateLabel(selectedProject?.executionPhase[0]?.startDate ?? null)}
              </p>
              <p class="text-sm text-gray-600">
                <span class="font-medium">End:</span>
                {dueDateLabel(selectedProject?.executionPhase[0]?.dueDate ?? null)}
              </p>
            </div>
          </div>

          <div class="border-l-4 border-purple-500 pl-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Closure</h3>
            <div class="space-y-1">
              <p class="text-sm text-gray-600">
                <span class="font-medium">Start:</span>
                {dueDateLabel(selectedProject?.closurePhase[0]?.startDate ?? null)}
              </p>
              <p class="text-sm text-gray-600">
                <span class="font-medium">End:</span>
                {dueDateLabel(selectedProject?.closurePhase[0]?.dueDate ?? null)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Timeline Chart -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Project Timeline</h2>
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

      <!-- Tasks List -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-900">
            Tasks ({selectedProject?.Tasks.length || 0})
          </h2>
        </div>

        {#if selectedProject && selectedProject.Tasks.length > 0}
          <div class="overflow-x-auto">
            <table class="table w-full">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="text-left py-3 px-4 font-semibold text-gray-700">Task</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-700">Assigned To</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-700">Phase</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-700">Start Date</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-700">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {#each selectedProject.Tasks as task}
                  <tr class="border-b border-gray-100 hover:bg-gray-50">
                    <td class="py-3 px-4 font-medium text-gray-900">{task.title}</td>
                    <td class="py-3 px-4 text-gray-600 max-w-xs truncate">
                      {task.description || "-"}
                    </td>
                    <td class="py-3 px-4 text-gray-600">{task.assignedTo || "-"}</td>
                    <td class="py-3 px-4">
                      <span
                        class="badge"
                        class:badge-neutral={task.status === "Pending"}
                        class:badge-success={task.status === "Done"}
                        class:badge-warning={task.status === "In Progress"}
                        class:badge-info={task.status === "To Do"}
                      >
                        {task.status}
                      </span>
                    </td>
                    <td class="py-3 px-4">
                      <span class="badge badge-outline">
                        {task.projectPhase || "-"}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-gray-600">
                      {task.startDate
                        ? new Date(task.startDate).toLocaleDateString("de-CH")
                        : "-"}
                    </td>
                    <td class="py-3 px-4 text-gray-600">
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString("de-CH")
                        : "-"}
                    </td>
                  </tr>
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
            <p class="text-gray-500 text-lg">No tasks available for this project</p>
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
          aria-label="Project Details"
          checked={true}
        />
        <div class="tab-content bg-base-100 border-base-300 p-6">
          <div class="grid grid-cols-3 gap-6 mb-4">
            <div class="flex-1">
              <p class="text-2xl font-bold mb-4">Project Name</p>
              <input
                type="text"
                placeholder="Type here"
                class="input"
                bind:value={initProject!.title}
              />
            </div>
            <div class="flex-1">
              <p class="text-2xl font-bold mb-4">Customer</p>
              <input
                type="text"
                placeholder="Type here"
                class="input"
                bind:value={initProject!.customerName}
                readonly
                required
              />
              <button class="btn btn-neutral" on:click={selectCustomer}>
                Select Customer
              </button>
              {#if showCustomerSelect}
                <div
                  class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                >
                  <div class="bg-white p-4 rounded-lg shadow-xl w-80">
                    <input
                      type="text"
                      placeholder="Search Customer"
                      class="input w-full mb-4"
                    />
                    <ul class="menu bg-base-100 w-full">
                      {#each customerList as c}
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
                      Close</button
                    >
                  </div>
                </div>
              {/if}
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-bold mb-4">Project Manager</h3>
              <input
                type="text"
                placeholder="Type here"
                class="input"
                bind:value={initProject!.projectManager}
              />
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-bold mb-4">Budget</h3>
              <input
                type="text"
                placeholder="Type here"
                class="input"
                bind:value={initProject!.budget}
              />
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-bold mb-4">Start Date</h3>
              <input
                type="date"
                placeholder="Type here"
                class="input"
                bind:value={initProject!.startDate}
              />
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-bold mb-4">Due Date</h3>
              <input
                type="date"
                placeholder="Type here"
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
          aria-label="Project Phases"
        />
        <div class="tab-content bg-base-100 border-base-300 px-6 py-4">
          <!-- Task-Form -->
          <div class="grid grid-cols-2 gap-4 mb-4">
            <label class="form-control w-full">
              <div class="label">
                <h3 class="text-xl font-bold mb-4">Initiation</h3>
              </div>
              <p>Start Date</p>
              <input
                type="date"
                class="input"
                bind:value={initProject!.initiationPhase[0].startDate}
                readonly
              />
              <p>Due Date</p>
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
                <h3 class="text-xl font-bold mb-4">Planning</h3>
              </div>
              <p>Start Date</p>
              <input
                type="date"
                class="input"
                bind:value={initProject!.planingPhase[0].startDate}
                readonly
              />
              <p>Due Date</p>
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
                <h3 class="text-xl font-bold mb-4">Execution</h3>
              </div>
              <p>Start Date</p>
              <input
                type="date"
                class="input"
                bind:value={initProject!.executionPhase[0].startDate}
                readonly
              />
              <p>Due Date</p>
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
                <h3 class="text-xl font-bold mb-4">Closure</h3>
              </div>
              <p>Start Date</p>
              <input
                type="date"
                class="input"
                bind:value={initProject!.closurePhase[0].startDate}
                readonly
              />
              <p>Due Date</p>
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
          aria-label="Tasks"
          checked
        />
        <div class="tab-content bg-base-100 border-base-300 px-6 py-4">
          <!-- Task-Form -->
          <div class="grid grid-cols-2 gap-4 mb-4">
            <label class="form-control w-full">
              <div class="label">
                <h3 class="text-xl font-bold mb-4">Task Name</h3>
              </div>
              <input
                type="text"
                class="input"
                placeholder="Enter task name"
                bind:value={newTask.title}
              />
            </label>

            <label class="form-control w-full">
              <div class="label">
                <h3 class="text-xl font-bold mb-4">Assigned to</h3>
              </div>
              <input
                type="text"
                class="input"
                placeholder="Name"
                bind:value={newTask.assignedTo}
              />
            </label>

            <div class="form-control w-full">
              <span class="text-xl font-bold mb-4">Status</span>
              <input
                type="text"
                class="input input-bordered w-full"
                value="Pending"
                readonly
                disabled
              />
            </div>

            <div class="form-control w-full">
              <span class="text-xl font-bold mb-2">Phase</span>
              <div class="dropdown">
                <button type="button" class="btn m-1" aria-haspopup="menu">
                  Phase: {newTask.projectPhase || "Select Phase"}
                </button>
                <ul
                  class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
                >
                  <li>
                    <button
                      type="button"
                      on:click={() => setTaskPhase("Initiation")}
                      >Initiation</button
                    >
                  </li>
                  <li>
                    <button
                      type="button"
                      on:click={() => setTaskPhase("Planing")}>Planning</button
                    >
                  </li>
                  <li>
                    <button
                      type="button"
                      on:click={() => setTaskPhase("Execution")}
                      >Execution</button
                    >
                  </li>
                  <li>
                    <button
                      type="button"
                      on:click={() => setTaskPhase("Closure")}>Closure</button
                    >
                  </li>
                </ul>
              </div>
              {#if newTask.projectPhase}
                <p class="text-sm mt-2 text-gray-600">
                  Selected: <span class="font-semibold"
                    >{newTask.projectPhase}</span
                  >
                </p>
              {/if}
            </div>

            <label class="form-control w-full">
              <div class="label">
                <h3 class="text-xl font-bold mb-4">Start Date</h3>
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
                <h3 class="text-xl font-bold mb-4">Due Date</h3>
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
                <h3 class="text-xl font-bold mb-4">Description</h3>
              </div>
              <textarea
                class="textarea span-2"
                rows="3"
                placeholder="Description"
                bind:value={newTask.description}
              ></textarea>
            </label>
          </div>

          <button
            type="button"
            class="btn btn-primary mb-6"
            on:click={addTask}
            disabled={!newTask.title.trim() || !newTask.projectPhase}
          >
            Add Task
          </button>

          <!-- Task-Liste -->
          <h3 class="text-xl font-bold mb-4">
            Tasks ({initProject?.Tasks.length || 0})
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
                    <th>Task</th>
                    <th>Description</th>
                    <th>Assigned To</th>
                    <th>Status</th>
                    <th>Phase</th>
                    <th>Due Date</th>
                    <th>Action</th>
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
                          class="badge"
                          class:badge-neutral={task.status === "Pending"}
                          class:badge-success={task.status === "Done"}
                          class:badge-warning={task.status === "In Progress"}
                          class:badge-info={task.status === "To Do"}
                        >
                          {task.status}
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
                          Edit
                        </button>
                        <button
                          type="button"
                          class="btn btn-sm btn-error btn-outline"
                          on:click={() => removeTask(task.taskID)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {:else}
            <div class="alert alert-info mt-4">
              <span>No tasks recorded yet. Add a new task above.</span>
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
                Delete Selected ({selectedTasks.size})
              </button>
            </div>

            <ul class="menu menu-horizontal bg-base-100 rounded-box gap-2 mb-4">
              <li>
                <button
                  class="btn btn-soft"
                  on:click={() => timelineChartRef?.resetFocus()}
                >
                  Focus
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
          aria-label="Notifications"
          checked
        />
        <div class="tab-content bg-base-100 border-base-300 p-6"></div>
      </div>

      <div class="flex gap-4 mt-4">
        <button type="button" class="btn" on:click={submitNewProject}>
          Submit
        </button>
        <button
          type="button"
          class="btn btn-neutral"
          on:click={cancelNewProject}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
{/if}
