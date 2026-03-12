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

  function isProjectHealthy(project: Project): boolean {
    return isProjectOnTrack(project) && !getProjectBudgetSummary(project, hourlyRates).isOverBudget;
  }

  function getHealthLabel(project: Project): string {
    if (getProjectBudgetSummary(project, hourlyRates).isOverBudget) return $t.projects.overBudget;
    if (!isProjectOnTrack(project)) return $t.projects.behind;
    return $t.projects.onTrack;
  }

  function getHealthColor(project: Project): string {
    if (getProjectBudgetSummary(project, hourlyRates).isOverBudget) return "bg-red-500";
    if (!isProjectOnTrack(project)) return "bg-orange-400";
    return "bg-green-500";
  }

  function getHealthTextColor(project: Project): string {
    if (getProjectBudgetSummary(project, hourlyRates).isOverBudget) return "text-red-600";
    if (!isProjectOnTrack(project)) return "text-orange-500";
    return "text-green-600";
  }

</script>

<div class="w-full rounded-4xl border border-gray-200 bg-white overflow-hidden shadow-sm">
  <div class="overflow-x-auto max-h-[640px] overflow-y-auto">
    <table class="table w-full">
      <thead>
        <tr class="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
          <th class="w-8 pl-4"></th>
          <th>{$t.projects.projectNumber}</th>
          <th>{$t.projects.projectName}</th>
          <th>{$t.projects.customer}</th>
          <th>{$t.projects.projectManager}</th>
          <th>{$t.projects.budget}</th>
          <th>{$t.common.status}</th>
          <th>{$t.projects.dueDate}</th>
        </tr>
      </thead>
      <tbody>
        {#each projects as p, index}
          <tr
            class={`cursor-pointer transition-colors border-b border-gray-100 last:border-0 ${
              selectedRow === index ? "bg-blue-50" : "hover:bg-gray-50"
            }`}
            on:click={() => dispatch("rowSelect", { index, project: p })}
          >
            <td class="pl-4 pr-0">
              <div class={`w-2.5 h-2.5 rounded-full ${getHealthColor(p)}`} title={getHealthLabel(p)}></div>
            </td>
            <td class="text-gray-500 text-sm">{p.projectID}</td>
            <td class="font-medium text-gray-900">{p.title}</td>
            <td class="text-gray-600">{p.customerName}</td>
            <td class="text-gray-600">{p.projectManager}</td>
            <td class="text-gray-700 font-mono text-sm">{formatBudget(p.budget)}</td>
            <td>
              <span class="badge badge-sm badge-ghost text-xs">
                {projectStatusLabel(p.projectstatus as ProjectStatus)}
              </span>
            </td>
            <td class="text-gray-600 text-sm">{dueDateLabel(p.dueDate)}</td>
          </tr>

          <!-- Preview Row -->
          {#if selectedRow === index}
            <tr class="bg-gray-50">
              <td colspan="8" class="p-0">
                <div class="p-6 space-y-4 border-t border-gray-200">
                  <div class="grid grid-cols-3 gap-4">
                    <!-- Current Phase -->
                    <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                      <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{$t.projects.currentPhase}</p>
                      <p class="text-xl font-bold text-blue-600">
                        {getPhaseLabel(getCurrentPhase(p))}
                      </p>
                    </div>

                    <!-- Health Status -->
                    <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                      <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{$t.common.status}</p>
                      <div class="flex items-center gap-2">
                        <div class={`w-3 h-3 rounded-full ${getHealthColor(p)}`}></div>
                        <p class={`text-xl font-bold ${getHealthTextColor(p)}`}>
                          {getHealthLabel(p)}
                        </p>
                      </div>
                    </div>

                    <!-- Budget Usage -->
                    <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                      <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{$t.projects.budgetUsage}</p>
                      <p class={`text-xl font-bold ${getProjectBudgetSummary(p, hourlyRates).isOverBudget ? "text-red-600" : "text-green-600"}`}>
                        {getProjectBudgetSummary(p, hourlyRates).percentageUsed.toFixed(0)}%
                      </p>
                    </div>
                  </div>

                  <!-- Budget Bar -->
                  <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                    <div class="mb-2 flex justify-between items-center">
                      <span class="text-sm font-medium text-gray-700">{$t.projects.budgetAllocation}</span>
                      <span class="text-sm text-gray-500">
                        {formatBudget(getProjectBudgetSummary(p, hourlyRates).assignedBudget)} / {formatBudget(p.budget)}
                      </span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        class={`h-2.5 rounded-full transition-all ${
                          getProjectBudgetSummary(p, hourlyRates).isOverBudget
                            ? "bg-red-500"
                            : getProjectBudgetSummary(p, hourlyRates).percentageUsed > 80
                              ? "bg-orange-400"
                              : "bg-green-500"
                        }`}
                        style={`width: ${Math.min(getProjectBudgetSummary(p, hourlyRates).percentageUsed, 100)}%`}
                      ></div>
                    </div>
                    <div class="mt-2 flex justify-between text-xs text-gray-500">
                      <span>{$t.projects.assignedBudget}: {formatBudget(getProjectBudgetSummary(p, hourlyRates).assignedBudget)}</span>
                      <span>{$t.projects.reserve}: {formatBudget(getProjectBudgetSummary(p, hourlyRates).reserveBudget)}</span>
                    </div>
                  </div>

                  <!-- Task Summary -->
                  <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                    <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{$t.projects.tasks}</p>
                    <p class="text-xl font-semibold text-gray-900">
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

