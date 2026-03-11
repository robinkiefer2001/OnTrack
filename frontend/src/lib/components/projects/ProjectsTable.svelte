<script lang="ts">
  import type { Project, ProjectStatus, HourlyRate } from "$lib/modules/projects/contracts";
  import { createEventDispatcher } from "svelte";
  import { getCurrentPhase, isProjectOnTrack, getProjectBudgetSummary, getTaskCost } from "$lib/modules/projects/business";
  import { formatBudget, dueDateLabel } from "$lib/utils/format";
  import { DEFAULT_HOURLY_RATES } from "$lib/modules/projects/rates";
  import { t } from "$lib/language";

  export let projects: Project[] = [];
  export let selectedRow: number | null = null;
  export let hourlyRates: HourlyRate[] = DEFAULT_HOURLY_RATES;

  const dispatch = createEventDispatcher<{
    rowSelect: { index: number; project: Project };
  }>();

  function projectStatusLabel(status: ProjectStatus) {
    if (status === "Initiation") return $t.projectStatus.initiation;
    if (status === "Planning") return $t.projectStatus.planning;
    if (status === "Execution") return $t.projectStatus.execution;
    if (status === "Closure") return $t.projectStatus.closure;
    if (status === "Closed") return $t.projectStatus.closed;
    return $t.projectStatus.cancelled;
  }

  function getPhaseLabel(phaseName: string | null): string {
    if (!phaseName) return "-";
    if (phaseName === "Initiation") return $t.projects.initiation;
    if (phaseName === "Planing") return $t.projects.planning;
    if (phaseName === "Execution") return $t.projects.execution;
    if (phaseName === "Closure") return $t.projects.closure;
    return phaseName;
  }

</script>

<div class="rounded-4xl shadow border border-gray-200 bg-base-100 p-4 overflow-x-auto flex-2 max-w-7xl justify-items-center-safe mx-auto px-6">
  <div class="h-150 w-full">
    <table class="table">
      <thead>
        <tr>
          <th>{$t.projects.projectNumber}</th>
          <th>{$t.projects.customer}</th>
          <th>{$t.projects.projectManager}</th>
          <th>{$t.projects.budget}</th>
          <th>{$t.common.status}</th> 
          <th>{$t.projects.dueDate}</th>
        </tr>
      </thead>
      <tbody class = "rounded-4xl">
        {#each projects as p, index}
          <tr
            class={`cursor-pointer transition-colors ${
              selectedRow === index ? "bg-blue-100" : "hover:bg-gray-100"
            }`}
            on:click={() => dispatch("rowSelect", { index, project: p })}
          >
            <td>{p.projectID}</td>
            <td>{p.customerName}</td>
            <td>{p.projectManager}</td>
            <td>{formatBudget(p.budget)}</td>
            <td>{projectStatusLabel(p.projectstatus as ProjectStatus)}</td>
            <td>{dueDateLabel(p.dueDate)}</td>
          </tr>

          <!-- Preview Row -->
          {#if selectedRow === index}
            <tr class="bg-base-200">
              <td colspan="6" class="p-0">
                <div class="p-6 space-y-4">
                  <div class="grid grid-cols-3 gap-6">
                    <!-- Current Phase -->
                    <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                      <p class="text-sm font-medium text-gray-600 mb-2">{$t.projects.currentPhase}</p>
                      <p class="text-2xl font-bold text-blue-600">
                        {getPhaseLabel(getCurrentPhase(p))}
                      </p>
                    </div>

                    <!-- On Track Status -->
                    <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                      <p class="text-sm font-medium text-gray-600 mb-2">{$t.common.status}</p>
                      <div class="flex items-center gap-2">
                        <div
                          class={`w-4 h-4 rounded-full ${
                            isProjectOnTrack(p) ? "bg-green-500" : "bg-red-500"
                          }`}
                        ></div>
                        <p class={`text-2xl font-bold ${isProjectOnTrack(p) ? 'text-green-600' : 'text-red-600'}`}>
                          {isProjectOnTrack(p) ? $t.projects.onTrack : $t.projects.behind}
                        </p>
                      </div>
                    </div>

                    <!-- Budget Usage -->
                    <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                      <p class="text-sm font-medium text-gray-600 mb-2">{$t.projects.budgetUsage}</p>
                      <p class={`text-2xl font-bold ${getProjectBudgetSummary(p, hourlyRates).percentageUsed > 100 ? "text-red-600" : "text-green-600"}`}>
                        {getProjectBudgetSummary(p, hourlyRates).percentageUsed.toFixed(0)}%
                      </p>
                    </div>
                  </div>

                  <!-- Budget Bar -->
                  <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                    <div class="mb-2 flex justify-between items-center">
                      <span class="text-sm font-medium text-gray-700">{$t.projects.budgetAllocation}</span>
                      <span class="text-sm text-gray-600">
                        {formatBudget(getProjectBudgetSummary(p, hourlyRates).assignedBudget)} / {formatBudget(p.budget)}
                      </span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        class={`h-3 rounded-full transition-all ${
                          getProjectBudgetSummary(p, hourlyRates).percentageUsed > 100
                            ? "bg-red-600"
                            : "bg-green-500"
                        }`}
                        style={`width: ${Math.min(getProjectBudgetSummary(p, hourlyRates).percentageUsed, 100)}%`}
                      ></div>
                    </div>
                    <div class="mt-3 flex justify-between text-xs text-gray-600">
                      <span>{$t.projects.assignedBudget}: {formatBudget(getProjectBudgetSummary(p, hourlyRates).assignedBudget)}</span>
                      <span>{$t.projects.reserve}: {formatBudget(getProjectBudgetSummary(p, hourlyRates).reserveBudget)}</span>
                    </div>
                  </div>

                  <!-- Task Summary -->
                  <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                    <p class="text-sm font-medium text-gray-700 mb-2">{$t.projects.tasks}</p>
                    <p class="text-lg font-semibold text-gray-900">
                      {p.Tasks.length} {p.Tasks.length === 1 ? $t.projects.taskName : $t.projects.tasks}
                    </p>
                  </div>
                </div>
              </td>
            </tr>
          {/if}
        {/each}
      </tbody>
    </table>
  </div>
</div>

