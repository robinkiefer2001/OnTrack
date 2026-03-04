<script lang="ts">
  import type {
    Project,
    ProjectStatus,
    customer,
    Task
  } from "$lib/models/project";
  import {
    addToListProject,
    customerList,
    projectList
  } from "$lib/models/mockupData";
  import TimelineChart from "./TimelineChart.svelte";

  // State
  let initProject: Project | null = null;
  let selectedProject: Project | null = null;
  let selectedCustomer: customer | null = null;
  let showCustomerSelect = false;
  let selectedRow: number | null = null;
  let showForm = false;
  let timelineChartRef: InstanceType<typeof TimelineChart> | null = null;

  // Task form state
  let newTask = {
    title: "",
    description: "",
    status: "To Do" as "To Do" | "In Progress" | "Done",
    assignedTo: "",
    dueDate: null as Date | string | null
  };

  function newProject() {
    showForm = true;
    initProject = {
      title: "",
      customerID: null,
      customerName: "",
      budget: null,
      dueDate: null,
      startDate: null,
      projectID: null,
      projectManager: "",
      projectstatus: "Initiation" as ProjectStatus,
      Tasks: []
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

  function addTask() {
    if (!initProject || !newTask.title.trim()) return;

    const task: Task = {
      taskID: Date.now(),
      projectID: initProject.projectID || 0,
      title: newTask.title,
      description: newTask.description,
      status: newTask.status,
      assignedTo: newTask.assignedTo,
      dueDate: toDateOrNull(newTask.dueDate),
      notificationSent: false
    };

    initProject.Tasks = [...initProject.Tasks, task];

    newTask = {
      title: "",
      description: "",
      status: "To Do",
      assignedTo: "",
      dueDate: null
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
      dueDate: toDateOrNull(initProject.dueDate as Date | string | null)
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
      minimumFractionDigits: 2
    }).format(value);
  }

  function showCurrentProject() {}
</script>

<!-- Top-Menü -->
<ul class="menu menu-vertical lg:menu-horizontal bg-base-100 rounded-box gap-4 mb-4">
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
      <button class="btn" on:click={() => { /* modifyProject */ }}>
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
<div class="rounded-box shadow bg-base-100 p-4 overflow-x-auto flex-2 h-150">
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
                  Tasks: p.Tasks
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
                  year: "numeric"
                })
              : "-"}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>


{#if showForm}
    <div
        class="fixed inset-0 bg-black/40 flex items-center justify-center w-full h-full"
    >
        <div class="bg-white p-6 rounded-lg shadow-xl h-full w-full">
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
                            />
                            <button
                                class="btn btn-neutral"
                                on:click={selectCustomer}
                            >
                                Select Customer
                            </button>
                            {#if showCustomerSelect}
                                <div
                                    class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                                >
                                    <div
                                        class="bg-white p-4 rounded-lg shadow-xl w-80"
                                    >
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
                                                            initProject!.customerID =
                                                                c.customerID;
                                                            initProject!.customerName =
                                                                c.companyName;
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
                            <h3 class="text-xl font-bold mb-4">
                                Project Manager
                            </h3>
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
   

        <!-- Tab 2: Tasks + Timeline -->
        <input
          type="radio"
          name="my_tabs_1"
          class="tab"
          aria-label="Tasks"
        />
        <div class="tab-content bg-base-100 border-base-300 p-6">
          <h3 class="text-xl font-bold mb-4">Add Task</h3>

          <!-- Task-Form -->
          <div class="grid grid-cols-2 gap-4 mb-4">
            <label class="form-control w-full">
              <div class="label">
                <span class="label-text">Task Name *</span>
              </div>
              <input
                type="text"
                class="input input-bordered w-full"
                placeholder="Enter task name"
                bind:value={newTask.title}
              />
            </label>

            <label class="form-control w-full">
              <div class="label">
                <span class="label-text">Assigned to</span>
              </div>
              <input
                type="text"
                class="input input-bordered w-full"
                placeholder="Name"
                bind:value={newTask.assignedTo}
              />
            </label>

            <label class="form-control w-full">
              <div class="label">
                <span class="label-text">Status</span>
              </div>
              <select
                class="select select-bordered w-full"
                bind:value={newTask.status}
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </label>

            <label class="form-control w-full">
              <div class="label">
                <span class="label-text">Due Date</span>
              </div>
              <input
                type="date"
                class="input input-bordered w-full"
                bind:value={newTask.dueDate}
              />
            </label>

            <label class="form-control w-full col-span-2">
              <div class="label">
                <span class="label-text">Description</span>
              </div>
              <textarea
                class="textarea textarea-bordered w-full"
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
            disabled={!newTask.title.trim()}
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
                    <th>Task</th>
                    <th>Description</th>
                    <th>Assigned To</th>
                    <th>Status</th>
                    <th>Due Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {#each initProject.Tasks as task}
                    <tr>
                      <td class="font-semibold">{task.title}</td>
                      <td class="max-w-xs truncate">
                        {task.description || "-"}
                      </td>
                      <td>{task.assignedTo || "-"}</td>
                      <td>
                        <span
                          class="badge"
                          class:badge-success={task.status === "Done"}
                          class:badge-warning={task.status === "In Progress"}
                          class:badge-info={task.status === "To Do"}
                        >
                          {task.status}
                        </span>
                      </td>
                      <td>
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString("de-CH")
                          : "-"}
                      </td>
                      <td>
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
          <div class="flex gap-4 mb-4 mt-8">
            <button class="btn btn-neutral">Add Task</button>
            <button class="btn btn-neutral">Edit Task</button>
            <button class="btn btn-neutral">Delete Task</button>
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
            <li><button class="btn btn-soft">Edit</button></li>
            <li><button class="btn btn-soft">Save</button></li>
          </ul>

          <TimelineChart
            bind:this={timelineChartRef}
            start={initProject?.startDate}
            end={initProject?.dueDate}
          />
        </div>

        <!-- Tab 3: Notifications (leer) -->
        <input
          type="radio"
          name="my_tabs_1"
          class="tab"
          aria-label="Notifications"
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
