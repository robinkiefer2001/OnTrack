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
  import TimelineChart from "./TimelineChart.svelte";

  // State
  let initProject: Project | null = null;
  let selectedProject: Project | null = null;
  let selectedCustomer: Customer | null = null;
  let showCustomerSelect = false;
  let selectedRow: number | null = null;
  let showForm = false;
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
  $: if (initProject?.initiationPhase[0]?.dueDate && initProject?.planingPhase[0]) {
    initProject.planingPhase[0].startDate = initProject.initiationPhase[0].dueDate;
  }
  $: if (initProject?.planingPhase[0]?.dueDate && initProject?.executionPhase[0]) {
    initProject.executionPhase[0].startDate = initProject.planingPhase[0].dueDate;
  }
  $: if (initProject?.executionPhase[0]?.dueDate && initProject?.closurePhase[0]) {
    initProject.closurePhase[0].startDate = initProject.executionPhase[0].dueDate;
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

    const { start, end } = getPhaseRange(name);
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

  function toggleSelect(index: number): boolean {
    const isSameRow = selectedRow === index;
    selectedRow = isSameRow ? null : index;
    return !isSameRow;
  }

  function cancelNewProject() {
    initProject = null;
    showForm = false;
  }

  function toDateOrNull(value: Date | string | null): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  function toInputDate(value: Date | string | null): string | null {
    const date = toDateOrNull(value);
    return date ? date.toISOString().split("T")[0] : null;
  }

  function getPhaseRange(phaseName: ProjectPhase["phaseName"] | "") {
    if (!initProject || !phaseName) return { start: null, end: null };

    const phaseMap: Record<ProjectPhase["phaseName"], ProjectPhase[] | undefined> = {
      Initiation: initProject.initiationPhase,
      Planing: initProject.planingPhase,
      Execution: initProject.executionPhase,
      Closure: initProject.closurePhase,
    };

    const phase = phaseMap[phaseName]?.[0];
    const start = toInputDate(phase?.startDate ?? null);
    const end = toInputDate(phase?.dueDate ?? null);
    return { start, end };
  }

  function addTask() {
    if (!initProject || !newTask.title.trim()) return;

    const taskStart = toDateOrNull(newTask.startDate);
    const taskEnd = toDateOrNull(newTask.dueDate);

    if (!newTask.projectPhase || !taskStart || !taskEnd) return;

    const { start: phaseStartRaw, end: phaseEndRaw } = getPhaseRange(
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

  function formatBudget(value: number | null) {
    if (value == null) return "-";
    return new Intl.NumberFormat("de-CH", {
      style: "currency",
      currency: "CHF",
      minimumFractionDigits: 2,
    }).format(value);
  }

  function showCurrentProject() {}

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

<!-- Top-Menü -->
<ul
  class="menu menu-vertical lg:menu-horizontal bg-base-100 rounded-box gap-4 mb-4"
>
  <li>
    <button class="btn btn-neutral" on:click={newProject}>New Project</button>
  </li>
  {#if selectedProject == null}
    <li>
      <button class="btn btn-neutral" disabled on:click={printOutProjectState}>
        Print Project State
      </button>
    </li>
    <li>
      <button class="btn btn-neutral" disabled>Modify Project</button>
    </li>
    <li>
      <button class="btn" disabled>Show Current Project</button>
    </li>
  {:else}
    <li>
      <button class="btn" on:click={printOutProjectState}>
        Print Project State
      </button>
    </li>
    <li>
      <button
        class="btn"
        on:click={() => {
          /* modifyProject */
        }}
      >
        Modify Project
      </button>
    </li>
    <li>
      <button class="btn" on:click={showCurrentProject}>
        Show Current Project
      </button>
    </li>
  {/if}

  <label class="input mt-4">
    <input type="search" required placeholder="Search" />
  </label>
</ul>

<!-- Projektliste (immer sichtbar) -->
<div class="rounded-box shadow bg-base-100 p-4 overflow-x-auto flex-2">
  <div class="h-150">
    <table class="table">
      <thead>
        <tr>
          <th>Project Nr.</th>
          <th>Customer</th>
          <th>Project Manager</th>
          <th>Budget</th>
          <th>Status</th>
          <th>Due Date</th>
        </tr>
      </thead>
      <tbody>
        {#each $projectList as p, index}
          <tr
            class={`cursor-pointer transition-colors ${
              selectedRow === index ? "bg-gray-200" : "hover:bg-gray-100"
            }`}
            on:click={() => {
              const isSelected = toggleSelect(index);
              selectedProject = isSelected
                ? {
                    title: p.title,
                    customerID: p.customerID,
                    customerName: p.customerName,
                    budget: p.budget,
                    dueDate: p.dueDate,
                    startDate: p.startDate,
                    projectID: p.projectID,
                    projectManager: p.projectManager,
                    projectstatus: p.projectstatus as ProjectStatus,
                    Tasks: p.Tasks,
                    initiationPhase: p.initiationPhase,
                    planingPhase: p.planingPhase,
                    executionPhase: p.executionPhase,
                    closurePhase: p.closurePhase,
                  }
                : null;
            }}
          >
            <td>{p.projectID}</td>
            <td>{p.customerName}</td>
            <td>{p.projectManager}</td>
            <td>{formatBudget(p.budget)}</td>
            <td>{p.projectstatus as ProjectStatus}</td>
            <td>
              {p.dueDate
                ? p.dueDate.toLocaleDateString("de-CH", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "-"}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

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
                min={toInputDate(initProject!.initiationPhase[0].startDate) || undefined}
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
                min={toInputDate(initProject!.planingPhase[0].startDate) || undefined}
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
                min={toInputDate(initProject!.executionPhase[0].startDate) || undefined}
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
                    >Initiation</button>
                  </li>
                  <li>
                    <button
                      type="button"
                      on:click={() => setTaskPhase("Planing")}
                    >Planning</button>
                  </li>
                  <li>
                    <button
                      type="button"
                      on:click={() => setTaskPhase("Execution")}
                    >Execution</button>
                  </li>
                  <li>
                    <button
                      type="button"
                      on:click={() => setTaskPhase("Closure")}
                    >Closure</button>
                  </li>
                </ul>
              </div>
              {#if newTask.projectPhase}
                <p class="text-sm mt-2 text-gray-600">
                  Selected: <span class="font-semibold">{newTask.projectPhase}</span>
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
                      phases={initProject ? {
                        initiation: initProject.initiationPhase,
                        planing: initProject.planingPhase,
                        execution: initProject.executionPhase,
                        closure: initProject.closurePhase
                      } : null}
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
