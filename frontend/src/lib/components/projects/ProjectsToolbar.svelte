<script lang="ts">
  import type { Project } from "$lib/models/project";
  import { createEventDispatcher } from "svelte";
  import { t } from "$lib/language";

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
</script>

<ul class="flex flex-wrap items-center gap-4 mb-4 bg-base-100 rounded-box p-4">
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
