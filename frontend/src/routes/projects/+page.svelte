<script lang="ts">
    interface Project{
    title: string
    customer: string
    owner: string
}
    let currentProject: Project | null = null;

    function newProjcet() {
        currentProject = {
            title: "",
            customer: "",
            owner: ""
        };
    }

    function showCurrentProject() {
        console.log(currentProject);
    }
</script>

<header>
    <h1 class="sideTitel">onTrack</h1>
    <nav class="navbar navbar-expand-lg bg-body-tertiary">
        <div class="container-fluid">
            <button
                class="navbar-toggler"
                type="button"
                data-bs-target="#navbarNav"
                aria-controls="navbarNav"
                aria-expanded="false"
                aria-label="Toggle navigation"
            >
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav">
                    <li class="nav-item">
                        <a
                            class="nav-link active"
                            aria-current="page"
                            aria-disabled="true">Project</a
                        >
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="..">Home</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
    <div class="split">
        <div class="divSide">
            <div class="d-grid gap-2">
                <button type="button" class="sideButton" on:click={newProjcet}
                    >Create Project</button
                >
                <button class="sideButton" type="button" on:click={showCurrentProject}>Test</button>
            </div>
        </div>
        <div class="divMain">
            {#if currentProject}
                <h2>Create youre Project</h2>
                <li>
                    <list element>
                        <p>Project Titel</p>
                        <input
                            class="form-control"
                            type="text"
                            placeholder="DB Migration"
                            aria-label="default input example"
                            bind:value={currentProject.title}
                        />
                    </list>
                </li>
            {/if}
        </div>
    </div>
</header>
