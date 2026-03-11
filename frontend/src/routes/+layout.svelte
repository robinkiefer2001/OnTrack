<script lang="ts">
  import onTrackCorpFav from "$lib/assets/onTrackCorpFav.png";
  import "../app.css";
  import { goto } from "$app/navigation";
  import { t } from "$lib/language";
  import { currentUser, getUserInitials, type CurrentUser } from "$lib/modules/user/store";
  import { customerEmployeeList } from "$lib/modules/projects/dataSource.mock";
  import type { CustomerEmployee } from "$lib/modules/projects/contracts";

  let { children } = $props();
  let navSearch = $state("");

  function runGlobalSearch() {
    const query = navSearch.trim();
    goto(query ? `/projects?q=${encodeURIComponent(query)}` : "/projects");
  }

  function switchUser(user: CurrentUser | CustomerEmployee) {
    currentUser.switchUser({
      employeeID: user.employeeID,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone ?? "",
      jobTitle: user.jobTitle ?? "",
      department: user.department ?? "",
      customerID: user.customerID,
    });
  }
</script>

<svelte:head>
  <link rel="icon" href={onTrackCorpFav} />
</svelte:head>

<nav class="sticky top-0 z-40 w-full border-b border-gray-200 bg-white">
  <div class="mx-auto flex h-16 items-center gap-6 px-6">

    <!-- Logo -->
    <a href="/" class="flex shrink-0 items-center gap-2.5 text-base font-semibold text-gray-900">
      <img src={onTrackCorpFav} alt="OnTrack Logo" class="h-7 w-7" />
      OnTrack
    </a>

    <!-- Nav links -->
    <div class="flex gap-1 text-sm font-medium text-gray-600">
      <a href="/" class="rounded-lg px-3 py-2 transition hover:bg-gray-100 hover:text-gray-900">{$t.nav.home}</a>
      <a href="/projects" class="rounded-lg px-3 py-2 transition hover:bg-gray-100 hover:text-gray-900">{$t.nav.projects}</a>
      <a href="/customers" class="rounded-lg px-3 py-2 transition hover:bg-gray-100 hover:text-gray-900">{$t.nav.customers}</a>
      <a href="/employees" class="rounded-lg px-3 py-2 transition hover:bg-gray-100 hover:text-gray-900">{$t.nav.employees}</a>
      <a href="/tasks" class="rounded-lg px-3 py-2 transition hover:bg-gray-100 hover:text-gray-900">{$t.nav.tasks}</a>
      <a href="/admin" class="rounded-lg px-3 py-2 transition hover:bg-gray-100 hover:text-gray-900">{$t.nav.admin}</a>
    </div>

    <!-- Right side -->
    <div class="ml-auto flex items-center gap-3">

      <!-- Search -->
      <input
        type="text"
        placeholder={$t.common.search}
        class="w-36 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 transition focus:w-52 focus:border-blue-300 focus:bg-white"
        bind:value={navSearch}
        onkeydown={(e) => { if (e.key === "Enter") runGlobalSearch(); }}
      />

      <!-- User dropdown -->
      <div class="dropdown dropdown-end dropdown-bottom">
        <div
          tabindex="0"
          role="button"
          class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700 transition hover:bg-blue-200"
        >
          {getUserInitials($currentUser.firstName, $currentUser.lastName)}
        </div>
        <div class="dropdown-content z-50 mt-2 w-80 rounded-2xl border border-gray-200 bg-white p-2 shadow-lg">
          <div class="border-b border-gray-100 px-3 py-2">
            <p class="text-sm font-semibold text-gray-900">{$currentUser.firstName} {$currentUser.lastName}</p>
            <p class="text-xs text-gray-600">{$currentUser.jobTitle}</p>
            <p class="text-xs text-gray-500">{$currentUser.email}</p>
          </div>
          <div class="mt-2 px-1">
            <p class="mb-2 px-2 text-xs font-semibold uppercase tracking-widest text-gray-400">Switch User</p>
            <div class="max-h-64 space-y-0.5 overflow-y-auto">
              {#each customerEmployeeList as employee (employee.employeeID)}
                {#if employee.employeeID !== $currentUser.employeeID}
                  <button
                    onclick={() => switchUser(employee)}
                    class="w-full rounded-xl px-3 py-2 text-left text-sm transition hover:bg-gray-100"
                  >
                    <div class="flex items-center gap-2">
                      <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                        {getUserInitials(employee.firstName, employee.lastName)}
                      </div>
                      <div>
                        <p class="font-medium text-gray-900">{employee.firstName} {employee.lastName}</p>
                        <p class="text-xs text-gray-500">{employee.department}</p>
                      </div>
                    </div>
                  </button>
                {:else}
                  <div class="rounded-xl bg-blue-50 px-3 py-2 text-sm">
                    <div class="flex items-center gap-2">
                      <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                        {getUserInitials(employee.firstName, employee.lastName)}
                      </div>
                      <div>
                        <p class="font-medium text-blue-900">{employee.firstName} {employee.lastName}</p>
                        <p class="text-xs text-blue-600">Current User</p>
                      </div>
                    </div>
                  </div>
                {/if}
              {/each}
            </div>
          </div>
          <div class="mt-2 grid grid-cols-2 gap-1 border-t border-gray-100 px-1 pt-2">
            <a href="/myprofile" class="rounded-xl px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-100">{$t.nav.myProfile}</a>
            <a href="/settings" class="rounded-xl px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-100">{$t.nav.settings}</a>
          </div>
        </div>
      </div>

    </div>
  </div>
</nav>

<main>
  {@render children()}
</main>
