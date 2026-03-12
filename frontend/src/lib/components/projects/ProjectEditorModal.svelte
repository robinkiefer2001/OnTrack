<script lang="ts">
  import type { Customer, HourlyRate, Project, ProjectPhase, Task } from "$lib/modules/projects/contracts";
  import type { SubtaskDraft, SubtaskDraftItem, TaskDraft } from "$lib/modules/projects/models";
  import { TimelineChart } from "$lib/modules/projects/ui";
  import { toInputDate } from "$lib/utils/date";
  import { t } from "$lib/language";

  export let initProject: Project | null = null;
  export let showCustomerSelect = false;
  export let customerSearchText = "";
  export let filteredCustomerList: Customer[] = [];
  export let newTask: TaskDraft;
  export let newSubtask: SubtaskDraft;
  export let currentTaskSubtasks: SubtaskDraftItem[] = [];
  export let selectedTasks = new Set<number>();
  export let hourlyRates: HourlyRate[] = [];
  export let taskPhaseRange: { start: string | null; end: string | null } = {
    start: null,
    end: null,
  };

  export let selectCustomer: () => void;
  export let setTaskPhase: (name: ProjectPhase["phaseName"]) => void;
  export let addSubtask: () => void;
  export let removeSubtask: (subtaskID: number | string) => void;
  export let addTask: () => void;
  export let toggleSelectAll: () => void;
  export let toggleTaskSelection: (taskID: number) => void;
  export let editTask: (taskID: number) => void;
  export let removeTask: (taskID: number) => void;
  export let deleteSelectedTasks: () => void;
  export let submitNewProject: () => void;
  export let cancelNewProject: () => void;

  let timelineChartRef: InstanceType<typeof TimelineChart> | null = null;
  let riskTitle = "";
  let riskImpact: "Low" | "Medium" | "High" = "Medium";
  let riskProbability: "Low" | "Medium" | "High" = "Medium";
  let riskMitigation = "";

  function addProjectRisk() {
    if (!initProject || !riskTitle.trim()) return;
    const next = {
      id: `risk-${Date.now()}`,
      title: riskTitle.trim(),
      impact: riskImpact,
      probability: riskProbability,
      mitigation: riskMitigation.trim(),
      isOpen: true,
    };
    initProject.risks = [...(initProject.risks || []), next];
    riskTitle = "";
    riskMitigation = "";
    riskImpact = "Medium";
    riskProbability = "Medium";
  }

  function removeProjectRisk(id: string) {
    if (!initProject?.risks) return;
    initProject.risks = initProject.risks.filter((risk) => risk.id !== id);
  }
</script>

<div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
  <div class="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
    <div class="tabs tabs-lift content-center">
      <input type="radio" name="my_tabs_1" class="tab" aria-label={$t.projects.projectDetails} checked={true} />
      <div class="tab-content bg-base-100 border-base-300 p-6">
        <div class="rounded-2xl border border-base-300 bg-base-100 p-5 mb-5">
          <h3 class="text-xl font-bold mb-4">{$t.projects.projectDetails}</h3>
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label class="form-control w-full md:col-span-2">
              <div class="label"><span class="label-text font-semibold">{$t.projects.projectName}</span></div>
              <input type="text" placeholder={$t.projects.typeHere} class="input input-bordered w-full" bind:value={initProject!.title} />
            </label>

            <div class="form-control w-full md:col-span-2 relative">
              <div class="label"><span class="label-text font-semibold">{$t.projects.customer}</span></div>
              <button
                type="button"
                class="input input-bordered w-full flex items-center justify-between text-left"
                on:click={selectCustomer}
              >
                <span class={initProject!.customerName ? "text-base-content" : "text-base-content/60"}>
                  {initProject!.customerName || $t.projects.selectCustomer}
                </span>
                <span class="text-xs opacity-70">▼</span>
              </button>

              {#if showCustomerSelect}
                <div class="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 rounded-xl border border-base-300 bg-base-100 p-3 shadow-xl">
                  <input
                    type="text"
                    placeholder={$t.projects.searchCustomer}
                    class="input input-bordered w-full mb-2"
                    bind:value={customerSearchText}
                  />
                  <div class="max-h-56 overflow-y-auto rounded-lg border border-base-200">
                    {#if filteredCustomerList.length > 0}
                      <ul class="menu bg-base-100 w-full">
                        {#each filteredCustomerList as c}
                          <li>
                            <button
                              type="button"
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
                    {:else}
                      <p class="p-3 text-sm text-base-content/60">{$t.home.noAssignments}</p>
                    {/if}
                  </div>
                  <div class="mt-2 flex justify-end">
                    <button type="button" class="btn btn-sm btn-ghost" on:click={() => (showCustomerSelect = false)}>{$t.common.close}</button>
                  </div>
                </div>
              {/if}
            </div>

            <label class="form-control w-full">
              <div class="label"><span class="label-text font-semibold">{$t.projects.projectManager}</span></div>
              <input type="text" placeholder={$t.projects.typeHere} class="input input-bordered w-full" bind:value={initProject!.projectManager} />
            </label>

            <label class="form-control w-full">
              <div class="label"><span class="label-text font-semibold">{$t.projects.budget}</span></div>
              <input type="number" placeholder={$t.projects.budgetPlaceholder} class="input input-bordered w-full" bind:value={initProject!.budget} min="0" step="0.01" />
            </label>

            <label class="form-control w-full">
              <div class="label"><span class="label-text font-semibold">{$t.projects.startDate}</span></div>
              <input type="date" placeholder={$t.projects.typeHere} class="input input-bordered w-full" bind:value={initProject!.startDate} />
            </label>

            <label class="form-control w-full">
              <div class="label"><span class="label-text font-semibold">{$t.projects.dueDate}</span></div>
              <input type="date" placeholder={$t.projects.typeHere} class="input input-bordered w-full" bind:value={initProject!.dueDate} />
            </label>
          </div>
        </div>

        <div class="divider"></div>
        <h3 class="text-xl font-bold mb-4">Project Risks</h3>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <label class="form-control w-full">
            <div class="label"><h3 class="text-lg font-bold mb-2">Risk Title</h3></div>
            <input type="text" class="input" placeholder="Risk summary" bind:value={riskTitle} />
          </label>
          <label class="form-control w-full">
            <div class="label"><h3 class="text-lg font-bold mb-2">Mitigation</h3></div>
            <input type="text" class="input" placeholder="Mitigation action" bind:value={riskMitigation} />
          </label>
          <label class="form-control w-full">
            <span class="label-text mb-2 block text-lg font-bold">Impact</span>
            <select class="select select-bordered" bind:value={riskImpact}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </label>
          <label class="form-control w-full">
            <span class="label-text mb-2 block text-lg font-bold">Probability</span>
            <select class="select select-bordered" bind:value={riskProbability}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </label>
        </div>
        <button type="button" class="btn btn-secondary mb-4" on:click={addProjectRisk} disabled={!riskTitle.trim()}>Add Risk</button>

        {#if initProject?.risks && initProject.risks.length > 0}
          <div class="overflow-x-auto mb-4">
            <table class="table w-full">
              <thead>
                <tr>
                  <th>Risk</th>
                  <th>Impact</th>
                  <th>Probability</th>
                  <th>Mitigation</th>
                  <th>{$t.projects.action}</th>
                </tr>
              </thead>
              <tbody>
                {#each initProject.risks as risk (risk.id)}
                  <tr>
                    <td>{risk.title}</td>
                    <td>{risk.impact}</td>
                    <td>{risk.probability}</td>
                    <td>{risk.mitigation || "-"}</td>
                    <td><button type="button" class="btn btn-sm btn-error btn-outline" on:click={() => removeProjectRisk(risk.id)}>{$t.common.delete}</button></td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </div>

      <input type="radio" name="my_tabs_1" class="tab" aria-label={$t.projects.projectPhases} />
      <div class="tab-content bg-base-100 border-base-300 px-6 py-4">
        <div class="grid grid-cols-2 gap-4 mb-4">
          <label class="form-control w-full">
            <div class="label"><h3 class="text-xl font-bold mb-4">{$t.projects.initiation}</h3></div>
            <p>{$t.projects.startDate}</p>
            <input type="date" class="input" bind:value={initProject!.initiationPhase[0].startDate} readonly />
            <p>{$t.projects.dueDate}</p>
            <input type="date" class="input" bind:value={initProject!.initiationPhase[0].dueDate} min={toInputDate(initProject!.initiationPhase[0].startDate) || undefined} max={toInputDate(initProject!.dueDate) || undefined} />
          </label>
          <label class="form-control w-full">
            <div class="label"><h3 class="text-xl font-bold mb-4">{$t.projects.planning}</h3></div>
            <p>{$t.projects.startDate}</p>
            <input type="date" class="input" bind:value={initProject!.planingPhase[0].startDate} readonly />
            <p>{$t.projects.dueDate}</p>
            <input type="date" class="input" bind:value={initProject!.planingPhase[0].dueDate} min={toInputDate(initProject!.planingPhase[0].startDate) || undefined} max={toInputDate(initProject!.dueDate) || undefined} />
          </label>
          <label class="form-control w-full">
            <div class="label"><h3 class="text-xl font-bold mb-4">{$t.projects.execution}</h3></div>
            <p>{$t.projects.startDate}</p>
            <input type="date" class="input" bind:value={initProject!.executionPhase[0].startDate} readonly />
            <p>{$t.projects.dueDate}</p>
            <input type="date" class="input" bind:value={initProject!.executionPhase[0].dueDate} min={toInputDate(initProject!.executionPhase[0].startDate) || undefined} max={toInputDate(initProject!.dueDate) || undefined} />
          </label>
          <label class="form-control w-full">
            <div class="label"><h3 class="text-xl font-bold mb-4">{$t.projects.closure}</h3></div>
            <p>{$t.projects.startDate}</p>
            <input type="date" class="input" bind:value={initProject!.closurePhase[0].startDate} readonly />
            <p>{$t.projects.dueDate}</p>
            <input type="date" class="input" bind:value={initProject!.closurePhase[0].dueDate} readonly />
          </label>
        </div>
      </div>

      <input type="radio" name="my_tabs_1" class="tab" aria-label={$t.projects.tasks} checked />
      <div class="tab-content bg-base-100 border-base-300 px-6 py-4">
        <div class="grid grid-cols-2 gap-4 mb-4">
          <label class="form-control w-full">
            <div class="label"><h3 class="text-xl font-bold mb-4">{$t.projects.taskName}</h3></div>
            <input type="text" class="input" placeholder={$t.projects.enterTaskName} bind:value={newTask.title} />
          </label>
          <label class="form-control w-full">
            <div class="label"><h3 class="text-xl font-bold mb-4">{$t.projects.assignedTo}</h3></div>
            <input type="text" class="input" placeholder={$t.projects.namePlaceholder} bind:value={newTask.assignedTo} />
          </label>
          <div class="form-control w-full">
            <h3 class="text-xl font-bold mb-4">{$t.common.status}</h3>
            <input type="text" class="input input-bordered w-full" value={$t.taskStatus.pending} readonly disabled />
          </div>
          <label class="form-control w-full">
            <div class="label"><h3 class="text-xl font-bold mb-2">{$t.projects.phase}</h3></div>
            <select class="select select-bordered w-full" bind:value={newTask.projectPhase} on:change={(e) => setTaskPhase(e.currentTarget.value as ProjectPhase["phaseName"])}>
              <option disabled selected value="">{$t.projects.selectPhase}</option>
              <option value="Initiation">{$t.projects.initiation}</option>
              <option value="Planing">{$t.projects.planning}</option>
              <option value="Execution">{$t.projects.execution}</option>
              <option value="Closure">{$t.projects.closure}</option>
            </select>
          </label>
          <label class="form-control w-full">
            <div class="label"><h3 class="text-xl font-bold mb-4">{$t.projects.startDate}</h3></div>
            <input type="date" class="input" bind:value={newTask.startDate} min={taskPhaseRange.start || undefined} max={taskPhaseRange.end || undefined} disabled={!newTask.projectPhase} />
          </label>
          <label class="form-control w-full">
            <div class="label"><h3 class="text-xl font-bold mb-4">{$t.projects.dueDate}</h3></div>
            <input type="date" class="input" bind:value={newTask.dueDate} min={taskPhaseRange.start || undefined} max={taskPhaseRange.end || undefined} disabled={!newTask.projectPhase} />
          </label>
          <label class="form-control w-full">
            <div class="label"><h3 class="text-xl font-bold mb-4">{$t.common.description}</h3></div>
            <textarea class="textarea span-2" rows="3" placeholder={$t.projects.descriptionPlaceholder} bind:value={newTask.description}></textarea>
          </label>
          <label class="form-control w-full">
            <div class="label"><h3 class="text-lg font-bold mb-2">{$t.projects.estimatedHours}</h3></div>
            <input type="number" class="input" placeholder={$t.projects.taskHoursPlaceholder} bind:value={newTask.estimatedHours} min="0" step="0.5" />
          </label>
          <label class="form-control w-full">
            <div class="label"><h3 class="text-xl font-bold mb-4">{$t.projects.hourlyRateType}</h3></div>
            <select class="select select-bordered w-full" bind:value={newTask.hourlyRateType}>
              {#each hourlyRates as rate (rate.rateID)}
                <option value={rate.rateType}>{rate.rateType}</option>
              {/each}
            </select>
          </label>
          <label class="form-control w-full">
            <div class="label"><h3 class="text-lg font-bold mb-2">Critical Task</h3></div>
            <input type="checkbox" class="checkbox" bind:checked={newTask.isCritical} />
          </label>
          <label class="form-control w-full">
            <div class="label"><h3 class="text-lg font-bold mb-2">Risk Note</h3></div>
            <textarea class="textarea" rows="2" placeholder="Risk note for this task" bind:value={newTask.riskNote}></textarea>
          </label>
        </div>

        <div class="divider"></div>
        <h3 class="text-xl font-bold mb-4">{$t.projects.addSubtasks}</h3>

        <div class="grid grid-cols-2 gap-4 mb-4">
          <label class="form-control w-full"><div class="label"><h3 class="text-lg font-bold mb-2">{$t.projects.subtaskName}</h3></div><input type="text" class="input" placeholder={$t.projects.enterSubtaskName} bind:value={newSubtask.title} /></label>
          <label class="form-control w-full"><div class="label"><h3 class="text-lg font-bold mb-2">{$t.projects.assignedTo}</h3></div><input type="text" class="input" placeholder={$t.projects.namePlaceholder} bind:value={newSubtask.assignedTo} /></label>
          <label class="form-control w-full"><div class="label"><h3 class="text-lg font-bold mb-2">{$t.projects.startDate}</h3></div><input type="date" class="input" bind:value={newSubtask.startDate} min={taskPhaseRange.start || undefined} max={taskPhaseRange.end || undefined} /></label>
          <label class="form-control w-full"><div class="label"><h3 class="text-lg font-bold mb-2">{$t.projects.dueDate}</h3></div><input type="date" class="input" bind:value={newSubtask.dueDate} min={taskPhaseRange.start || undefined} max={taskPhaseRange.end || undefined} /></label>
          <label class="form-control w-full"><div class="label"><h3 class="text-sm font-bold mb-2">{$t.projects.estimatedHours}</h3></div><input type="number" class="input input-sm" placeholder={$t.projects.subtaskHoursPlaceholder} bind:value={newSubtask.estimatedHours} min="0" step="0.5" /></label>
          <label class="form-control w-full"><div class="label"><h3 class="text-lg font-bold mb-2">{$t.projects.hourlyRateType}</h3></div><select class="select select-bordered w-full" bind:value={newSubtask.hourlyRateType}>{#each hourlyRates as rate (rate.rateID)}<option value={rate.rateType}>{rate.rateType}</option>{/each}</select></label>
          <label class="form-control w-full"><div class="label"><h3 class="text-lg font-bold mb-2">{$t.common.description}</h3></div><textarea class="textarea" rows="2" placeholder={$t.projects.subtaskDescriptionPlaceholder} bind:value={newSubtask.description}></textarea></label>
          <label class="form-control w-full"><div class="label"><h3 class="text-lg font-bold mb-2">Critical Subtask</h3></div><input type="checkbox" class="checkbox" bind:checked={newSubtask.isCritical} /></label>
          <label class="form-control w-full"><div class="label"><h3 class="text-lg font-bold mb-2">Risk Note</h3></div><textarea class="textarea" rows="2" placeholder="Risk note for this subtask" bind:value={newSubtask.riskNote}></textarea></label>
        </div>

        <button type="button" class="btn btn-secondary mb-4" on:click={addSubtask} disabled={!newSubtask.title.trim()}>{$t.projects.addSubtask}</button>

        {#if currentTaskSubtasks.length > 0}
          <h4 class="text-lg font-bold mb-3">{$t.projects.currentSubtasks} ({currentTaskSubtasks.length})</h4>
          <div class="overflow-x-auto mb-4">
            <table class="table w-full">
              <thead><tr><th>{$t.projects.subtasks}</th><th>Critical</th><th>Risk</th><th>{$t.projects.assignedTo}</th><th>{$t.common.hours}</th><th>{$t.projects.duration}</th><th>{$t.projects.action}</th></tr></thead>
              <tbody>
                {#each currentTaskSubtasks as subtask (subtask.subtaskID)}
                  <tr>
                    <td><div><p class="font-semibold">{subtask.title}</p><p class="text-sm text-gray-500">{subtask.description || "-"}</p></div></td>
                    <td>{subtask.isCritical ? "Yes" : "No"}</td>
                    <td class="max-w-xs truncate">{subtask.riskNote || "-"}</td>
                    <td>{subtask.assignedTo || "-"}</td>
                    <td><span class="font-semibold">{subtask.estimatedHours || 0}h</span></td>
                    <td>
                      {#if subtask.startDate && subtask.dueDate}
                        {Math.ceil((new Date(subtask.dueDate).getTime() - new Date(subtask.startDate).getTime()) / (1000 * 60 * 60 * 24))}d
                      {:else}
                        <span class="text-gray-400 italic">{$t.common.optional}</span>
                      {/if}
                    </td>
                    <td><button type="button" class="btn btn-sm btn-error btn-outline" on:click={() => removeSubtask(subtask.subtaskID)}>{$t.common.delete}</button></td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}

        <button type="button" class="btn btn-primary mb-4" on:click={addTask} disabled={!newTask.title.trim() || !newTask.projectPhase}>{$t.projects.addTask}</button>

        <h3 class="text-xl font-bold mb-4">{$t.projects.tasks} ({initProject?.Tasks.length || 0})</h3>

        {#if initProject && initProject.Tasks.length > 0}
          <div class="overflow-x-auto">
            <table class="table w-full">
              <thead>
                <tr>
                  <th><input type="checkbox" class="checkbox" checked={initProject.Tasks.length > 0 && selectedTasks.size === initProject.Tasks.length} on:change={toggleSelectAll} /></th>
                  <th>{$t.projects.taskName}</th><th>{$t.common.description}</th><th>Critical</th><th>Risk</th><th>{$t.projects.assignedTo}</th><th>{$t.common.status}</th><th>{$t.projects.phase}</th><th>{$t.projects.dueDate}</th><th>{$t.projects.action}</th>
                </tr>
              </thead>
              <tbody>
                {#each initProject.Tasks as task}
                  <tr>
                    <td><input type="checkbox" class="checkbox" checked={selectedTasks.has(task.taskID)} on:change={() => toggleTaskSelection(task.taskID)} /></td>
                    <td class="font-semibold">{task.title}</td>
                    <td class="max-w-xs truncate">{task.description || "-"}</td>
                    <td>{task.isCritical ? "Yes" : "No"}</td>
                    <td class="max-w-xs truncate">{task.riskNote || "-"}</td>
                    <td>{task.assignedTo || "-"}</td>
                    <td>
                      <span class="badge h-auto min-h-8 px-3 py-1 whitespace-nowrap" class:badge-neutral={task.status === "Pending"} class:badge-success={task.status === "Done"} class:badge-warning={task.status === "In Progress"} class:badge-info={task.status === "To Do"}>
                        {task.status === "Pending" ? $t.taskStatus.pending : task.status === "To Do" ? $t.taskStatus.toDo : task.status === "In Progress" ? $t.taskStatus.inProgress : $t.taskStatus.done}
                      </span>
                    </td>
                    <td><span class="badge badge-outline">{task.projectPhase || "-"}</span></td>
                    <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString("de-CH") : "-"}</td>
                    <td class="space-x-2">
                      <button type="button" class="btn btn-sm btn-warning btn-outline" on:click={() => editTask(task.taskID)}>{$t.common.edit}</button>
                      <button type="button" class="btn btn-sm btn-error btn-outline" on:click={() => removeTask(task.taskID)}>{$t.common.delete}</button>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {:else}
          <div class="alert alert-info mt-4"><span>{$t.projects.noTasksYet}</span></div>
        {/if}

        {#if initProject?.Tasks.length}
          <div class="flex gap-4 mb-4 mt-8">
            <button class="btn btn-error" on:click={deleteSelectedTasks} disabled={selectedTasks.size === 0}>
              {$t.projects.deleteSelected} ({selectedTasks.size})
            </button>
          </div>

          <ul class="menu menu-horizontal bg-base-100 rounded-box gap-2 mb-4">
            <li><button class="btn btn-soft" on:click={() => timelineChartRef?.resetFocus()}>{$t.projects.focus}</button></li>
          </ul>
        {/if}

        <TimelineChart
          bind:this={timelineChartRef}
          start={initProject?.startDate}
          end={initProject?.dueDate}
          tasks={initProject?.Tasks || []}
          phases={
            initProject
              ? {
                  initiation: initProject.initiationPhase,
                  planing: initProject.planingPhase,
                  execution: initProject.executionPhase,
                  closure: initProject.closurePhase,
                }
              : null
          }
        />
      </div>

      <input type="radio" name="my_tabs_1" class="tab" aria-label={$t.projects.notifications} checked />
      <div class="tab-content bg-base-100 border-base-300 p-6"></div>
    </div>

    <div class="flex gap-4 mt-4">
      <button type="button" class="btn" on:click={submitNewProject}>{$t.common.submit}</button>
      <button type="button" class="btn btn-neutral" on:click={cancelNewProject}>{$t.common.cancel}</button>
    </div>
  </div>
</div>
