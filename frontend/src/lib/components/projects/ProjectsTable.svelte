<script lang="ts">
  import type { Project, ProjectStatus } from "$lib/models/project";
  import { createEventDispatcher } from "svelte";
  import { formatBudget, dueDateLabel } from "$lib/features/projects/projectUtils";
  import { t } from "$lib/language";

  export let projects: Project[] = [];
  export let selectedRow: number | null = null;

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


</script>

<div class="rounded-box shadow bg-base-100 p-4 overflow-x-auto flex-2">
  <div class="h-150">
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
      <tbody>
        {#each projects as p, index}
          <tr
            class={`cursor-pointer transition-colors ${
              selectedRow === index ? "bg-gray-200" : "hover:bg-gray-100"
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
        {/each}
      </tbody>
    </table>
  </div>
</div>
