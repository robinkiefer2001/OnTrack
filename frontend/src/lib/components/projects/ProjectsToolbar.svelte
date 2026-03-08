<script lang="ts">
  import type { Project } from "$lib/models/project";
  import { createEventDispatcher } from "svelte";

  export let selectedProject: Project | null = null;

  const dispatch = createEventDispatcher<{
    newProject: void;
    printProjectState: void;
    modifyProject: void;
    showCurrentProject: void;
  }>();
</script>

<ul
  class="menu menu-vertical lg:menu-horizontal bg-base-100 rounded-box gap-4 mb-4"
>
  <li>
    <button class="btn btn-neutral" on:click={() => dispatch("newProject")}
      >New Project</button
    >
  </li>

  {#if selectedProject == null}
    <li>
      <button class="btn btn-neutral" disabled>Print Project State</button>
    </li>
    <li>
      <button class="btn btn-neutral" disabled>Modify Project</button>
    </li>
    <li>
      <button class="btn" disabled>Show Project</button>
    </li>
  {:else}
    <li>
      <button class="btn" on:click={() => dispatch("printProjectState")}
        >Print Project State</button
      >
    </li>
    <li>
      <button class="btn" on:click={() => dispatch("modifyProject")}
        >Modify Project</button
      >
    </li>
    <li>
      <button class="btn" on:click={() => dispatch("showCurrentProject")}
        >Show Project</button
      >
    </li>
  {/if}

  <label class="input mt-4">
    <input type="search" required placeholder="Search" />
  </label>
</ul>
