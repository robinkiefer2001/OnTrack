<script lang="ts">
  import onTrackCorpFav from "$lib/assets/onTrackCorpFav.png";
  import "../app.css";
  import { Chart } from 'chart.js';
  import { onMount } from 'svelte';
  import { goto } from "$app/navigation";
  import { t } from "$lib/language";
  let { children } = $props();
  let navSearch = $state("");

  function runGlobalSearch() {
    const query = navSearch.trim();
    goto(query ? `/projects?q=${encodeURIComponent(query)}` : "/projects");
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
      <li class="items-center item">
        <div
          class="avatar avatar-placeholder bg-neutral text-neutral-content w-24 h-24 rounded-full mb-2"
        >
          <span class="text-3xl items-center ml-1.5">MM</span>
        </div>
      </li>
      <li><a href="./">{$t.nav.home}</a></li>
      <li><a href="projects">{$t.nav.projects}</a></li>
      <li><a href="customers">{$t.nav.customers}</a></li>
      <li><a href="employees">{$t.nav.employees}</a></li>
      <li><a href="tasks">{$t.nav.tasks}</a></li>
      <li><a href="myprofile">{$t.nav.myProfile}</a></li>
      <li><a href="settings">{$t.nav.settings}</a></li>
    </ul>
  </div>

  <div class="divMain">
  {@render children()}
  </div>
</div>
