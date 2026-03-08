<script lang="ts">
  import type { Project, ProjectStatus } from "$lib/models/project";
  import { createEventDispatcher } from "svelte";
  import { formatBudget, dueDateLabel } from "$lib/features/projects/projectUtils";

  export let projects: Project[] = [];
  export let selectedRow: number | null = null;

  const dispatch = createEventDispatcher<{
    rowSelect: { index: number; project: Project };
  }>();


</script>

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
            <td>{p.projectstatus as ProjectStatus}</td>
            <td>{dueDateLabel(p.dueDate)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
