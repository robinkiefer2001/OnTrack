<script lang="ts">
  import type { Project } from "$lib/models/project";
  import { createEventDispatcher } from "svelte";
  import { t } from "$lib/language";
  import {
    countProjects,
    formatBudget,
    getProjectBudgetSummary,
    toDateOrNull,
  } from "$lib/features/projects/projectUtils";

  export let projects: Project[] = [];
  export let allProjects: Project[] = [];
  export let selectedProject: Project | null = null;
  export let fullTextSearch = "";
  export let projectManagerFilter = "";
  export let customerFilter = "";
  export let projectManagers: string[] = [];
  export let customers: string[] = [];

  const dispatch = createEventDispatcher<{
    newProject: void;
    printProjectState: void;
    modifyProject: void;
    showCurrentProject: void;
  }>();


  function isClosedProject(project: Project): boolean {
    return project.projectstatus === "Closed" || project.projectstatus === "Cancelled";
  }

  function formatHours(totalHours: number): string {
    return `${totalHours.toLocaleString("de-CH")} h`;
  }

  $: totalProjects = countProjects(allProjects);
  $: activeProjects = allProjects.filter((project) => !isClosedProject(project)).length;
  $: overdueProjects = allProjects.filter((project) => {
    const dueDate = toDateOrNull(project.dueDate);
    if (!dueDate || isClosedProject(project)) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    return dueDate < today;
  }).length;
  $: totalBudget = allProjects.reduce((sum, project) => sum + (project.budget || 0), 0);
  $: totalHours = allProjects.reduce(
    (sum, project) => sum + getProjectBudgetSummary(project).totalHours,
    0,
  );

</script>

<div class="w-full flex justify-center-safe max-w-7xl">
<div class="stats stats-vertical xl:stats-horizontal bg-white border-base-300 overflow-hidden border rounded-4xl shadow-sm mb-4 max-w-7xl mx-auto">
<div class="stat">
  <div class="stat-title">{$t.home.totalProjects}</div>
  <div class="stat-value">{totalProjects}</div>
  </div>
  <div class="stat">
  <div class="stat-title">{$t.home.activeProjects}</div>
  <div class="stat-value">{activeProjects}</div>
  <div class="stat-desc">{countProjects(projects)} sichtbar</div>
  </div>
  <div class="stat">
  <div class="stat-title">{$t.home.overdueProjects}</div>
  <div class="stat-value text-error">{overdueProjects}</div>
  </div>
  <div class="stat">
  <div class="stat-title">{$t.home.totalBudget}</div>
  <div class="stat-value text-2xl">{formatBudget(totalBudget)}</div>
  </div>
  <div class="stat">
  <div class="stat-title">{$t.home.totalHours}</div>
  <div class="stat-value text-2xl">{formatHours(totalHours)}</div>
  </div>
</div>
</div>
<div class="bg-white max-w-7xl mx-auto border-base-300 overflow-hidden border rounded-4xl shadow-sm mb-4">
<ul class="flex flex-wrap items-center gap-4 bg-base-100 p-4 max-w-7xl justify-items-center-safe mx-auto px-6">
  <li>
    <button class="btn btn-neutral" on:click={() => dispatch("newProject")}
      >{$t.projects.newProject}</button
    >
  </li>

  {#if selectedProject == null}
    <li>
      <button class="btn btn-neutral" disabled>{$t.projects.printProjectState}</button>
    </li>
    <li>
      <button class="btn btn-neutral" disabled>{$t.projects.modifyProject}</button>
    </li>
    <li>
      <button class="btn" disabled>{$t.projects.showProject}</button>
    </li>
  {:else}
    <li>
      <button class="btn" on:click={() => dispatch("printProjectState")}
        >{$t.projects.printProjectState}</button
      >
    </li>
    <li>
      <button class="btn" on:click={() => dispatch("modifyProject")}
        >{$t.projects.modifyProject}</button
      >
    </li>
    <li>
      <button class="btn" on:click={() => dispatch("showCurrentProject")}
        >{$t.projects.showProject}</button
      >
    </li>
  {/if}
  <li>
    <label class="input">
      <input
        type="search"
        placeholder={$t.projects.fullTextSearch}
        bind:value={fullTextSearch}
      />
    </label>
  </li>

  <li>
    <select class="select select-bordered" bind:value={projectManagerFilter}>
      <option value="">{$t.projects.allProjectManagers}</option>
      {#each projectManagers as pm}
        <option value={pm}>{pm}</option>
      {/each}
    </select>
  </li>

  <li>
    <select class="select select-bordered" bind:value={customerFilter}>
      <option value="">{$t.projects.allCustomers}</option>
      {#each customers as customer}
        <option value={customer}>{customer}</option>
      {/each}
    </select>
  </li>
</ul>
</div>
