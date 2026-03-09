<script lang="ts">
  import onTrackCorpFav from "$lib/assets/onTrackCorpFav.png";
  import "../app.css";
  import { Chart } from 'chart.js';
  import { onMount } from 'svelte';
  import { goto } from "$app/navigation";
  import { t } from "$lib/language";
  import { currentUser, getUserInitials, type CurrentUser } from "$lib/stores/userStore";
  import { customerEmployeeList } from "$lib/models/mockupData";
  
  let { children } = $props();
  let navSearch = $state("");

  function runGlobalSearch() {
    const query = navSearch.trim();
    goto(query ? `/projects?q=${encodeURIComponent(query)}` : "/projects");
  }

  function switchUser(user: CurrentUser) {
    currentUser.switchUser(user);
  }
</script>

<svelte:head>
  <link rel="icon" href={onTrackCorpFav} />
</svelte:head>

<h1 class="stileTitle">
  <img src={onTrackCorpFav} alt="OnTrack Logo" class="corpTitleLogo" /> OnTrack
</h1>
<div class="navbar shadow-sm navdesigne" data-theme="aqua">
  <div class="flex-1">
  <label for="my-drawer-4" aria-label="open sidebar" class="btn btn-square btn-ghost"></label>
  </div>
  <div class="flex gap-2">
    <input
      type="text"
      placeholder={$t.common.search}
      class="input input-bordered w-24 md:w-auto"
      bind:value={navSearch}
      onkeydown={(e) => {
        if (e.key === "Enter") runGlobalSearch();
      }}
    />
  </div>
</div>
<div class="divMainSplit">
  <div class="divSideBar">
    <ul class="menu bg-base-200 w-56 rounded-box ulSideBar" >
      <li class="items-center item dropdown dropdown-bottom dropdown-end">
        <div
          tabindex="0"
          role="button"
          class="avatar avatar-placeholder bg-neutral text-neutral-content w-24 h-24 rounded-full mb-2 cursor-pointer hover:opacity-80 transition"
        >
          <span class="text-3xl items-center ml-1.5">{getUserInitials($currentUser.firstName, $currentUser.lastName)}</span>
        </div>
        <div tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-96">
          <div class="px-4 py-2 border-b">
            <p class="font-semibold text-sm">{$currentUser.firstName} {$currentUser.lastName}</p>
            <p class="text-xs text-gray-600">{$currentUser.jobTitle}</p>
            <p class="text-xs text-gray-500">{$currentUser.email}</p>
          </div>
          <div class="divider my-1"></div>
          <div class="px-4 py-2">
            <p class="text-xs font-semibold text-gray-700 mb-2">DEVELOPMENT: Switch User</p>
            <div class="max-h-64 overflow-y-auto">
              {#each customerEmployeeList as employee (employee.employeeID)}
                {#if employee.employeeID !== $currentUser.employeeID}
                  <button
                    onclick={() => switchUser(employee)}
                    class="w-full text-left px-3 py-2 rounded hover:bg-base-300 transition text-sm"
                  >
                    <div class="flex items-center gap-2">
                      <div class="avatar avatar-placeholder bg-primary text-white w-6 h-6 rounded-full">
                        <span class="text-xs">{getUserInitials(employee.firstName, employee.lastName)}</span>
                      </div>
                      <div>
                        <p class="font-medium">{employee.firstName} {employee.lastName}</p>
                        <p class="text-xs text-gray-600">{employee.department}</p>
                      </div>
                    </div>
                  </button>
                {:else}
                  <div class="w-full text-left px-3 py-2 rounded bg-primary text-white text-sm">
                    <div class="flex items-center gap-2">
                      <div class="avatar avatar-placeholder bg-white text-primary w-6 h-6 rounded-full">
                        <span class="text-xs">{getUserInitials(employee.firstName, employee.lastName)}</span>
                      </div>
                      <div>
                        <p class="font-medium">{employee.firstName} {employee.lastName}</p>
                        <p class="text-xs opacity-90">Current User</p>
                      </div>
                    </div>
                  </div>
                {/if}
              {/each}
            </div>
          </div>
        </div>
      </li>
      <li><a href="./">{$t.nav.home}</a></li>
      <li><a href="projects">{$t.nav.projects}</a></li>
      <li><a href="customers">{$t.nav.customers}</a></li>
      <li><a href="employees">{$t.nav.employees}</a></li>
      <li><a href="tasks">{$t.nav.tasks}</a></li>
      <li><a href="myprofile">{$t.nav.myProfile}</a></li>
      <li><a href="settings">{$t.nav.settings}</a></li>
      <li><a href="admin">{$t.nav.admin}</a></li>
    </ul>
  </div>

  <div class="divMain">
  {@render children()}
  </div>
</div>
