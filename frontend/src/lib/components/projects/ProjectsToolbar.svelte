<script lang="ts">
  import type { Project } from "$lib/modules/projects/contracts";
  import { createEventDispatcher } from "svelte";
  import { t } from "$lib/language";
  import {
    countProjects,
    getProjectBudgetSummary,
    isClosedProject,
  } from "$lib/modules/projects/business";
  import { toDateOrNull } from "$lib/utils/date";
  import { formatBudget, formatHours } from "$lib/utils/format";

  export let projects: Project[] = [];
  export let allProjects: Project[] = [];
  export let totalAllProjects: Project[] = [];
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

  $: totalProjects = countProjects(totalAllProjects);
  $: activeProjects = allProjects.filter(
    (project) => !isClosedProject(project),
  ).length;
  $: overdueProjects = allProjects.filter((project) => {
    const dueDate = toDateOrNull(project.dueDate);
    if (!dueDate || isClosedProject(project)) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    return dueDate < today;
  }).length;
  $: overBudgetProjects = allProjects.filter(
    (project) => !isClosedProject(project) && getProjectBudgetSummary(project).isOverBudget,
  ).length;
  $: totalBudget = allProjects.reduce(
    (sum, project) => sum + (project.budget || 0),
    0,
  );
  $: totalHours = allProjects.reduce(
    (sum, project) => sum + getProjectBudgetSummary(project).totalHours,
    0,
  );
</script>

<div class="w-full rounded-4xl border border-base-300 overflow-hidden bg-white shadow-sm">
  <div class="stats stats-vertical xl:stats-horizontal w-full">
    <div class="stat">
      <div class="stat-title">{$t.home.totalProjects}</div>
      <div class="stat-value">{totalProjects}</div>
      <div class="stat-desc">{countProjects(projects)} {$t.home.visibleProjects}</div>
    </div>
    <div class="stat">
      <div class="stat-title">{$t.home.activeProjects}</div>
      <div class="stat-value">{activeProjects}</div>
    </div>
    <div class="stat {overdueProjects > 0 ? 'bg-error/5' : ''}">
      <div class="stat-title">{$t.home.overdueProjects}</div>
      <div class="stat-value {overdueProjects > 0 ? 'text-error' : ''}">{overdueProjects}</div>
    </div>
    <div class="stat {overBudgetProjects > 0 ? 'bg-warning/10' : ''}">
      <div class="stat-title">{$t.home.overBudgetProjects}</div>
      <div class="stat-value {overBudgetProjects > 0 ? 'text-warning' : 'text-success'}">{overBudgetProjects}</div>
      <div class="stat-desc">{overBudgetProjects > 0 ? $t.home.overBudgetDesc : $t.home.onTrackDesc}</div>
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
<div class="w-full rounded-4xl border border-base-300 overflow-hidden bg-white shadow-sm">
  <ul
    class="flex flex-wrap items-center gap-4 bg-base-100 p-4 px-6"
  >
    <li>
      <button class="btn btn-neutral" on:click={() => dispatch("newProject")}
        >{$t.projects.newProject}</button
      >
    </li>

    {#if selectedProject == null}
      <li>
        <button class="btn btn-neutral" disabled
          >{$t.projects.printProjectState}</button
        >
      </li>
      <li>
        <button class="btn btn-neutral" disabled
          >{$t.projects.modifyProject}</button
        >
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
