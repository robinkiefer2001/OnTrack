<script lang="ts">
  import onTrackCorpFav from '$lib/assets/onTrackCorpFav.png';
  import '../app.css';
  

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={onTrackCorpFav}/>
</svelte:head>


<h1 class="stileTitle"><img src={onTrackCorpFav} alt="OnTrack Logo" class="corpTitleLogo"/> OnTrack</h1>
<div class="navbar bg-base-100 shadow-sm navdesigne">
  <div class="flex-1">
    <a class="btn btn-ghost text-xl navButtons" href="none">Home</a>
    <a class="btn btn-ghost text-xl navButtons" href="projects">Projects</a>
    <a class="btn btn-ghost text-xl navButtons" href="customers">Customers</a>
    <a class="btn btn-ghost text-xl navButtons" href="employees">Employees</a>
    <a class="btn btn-ghost text-xl navButtons" href="tasks">Tasks</a>
  </div>
  <div class="flex gap-2">
    <input type="text" placeholder="Search" class="input input-bordered w-24 md:w-auto" />
  </div>
</div>
<div class="divMainSplit">
  <div class="divSideBar">
    <div class="avatar avatar-placeholder">
      <div class="bg-neutral text-neutral-content w-24 h-24 rounded-full ml-8 mt-2">
    <span class="text-3xl">MM</span>
      </div>
    <button class="btn btn-ghost text-sm navButtons">My Profile</button>
</div>

  </div>
  <div class="divMain">

  </div>

</div>

  <main class="flex-1 bg-base-100 p-6">
    {@render children()}
  </main>



