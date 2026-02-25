<script lang="ts">
    interface Project {
        title: string;
        customerID: number | null;
        owner: string;
    }
    let currentProject: Project | null = null;

    function newProject() {
        currentProject = {
            title: "",
            customerID: null,
            owner: "",
        };
    }

    function showCurrentProject() {
        console.log(currentProject);
    }
</script>

<header>
    <h1 class="sideTitle">onTrack</h1>
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
                            aria-disabled="true">New Project</a
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
                <button type="button" class="sideButton" on:click={newProject}
                    >Create Project</button
                >
                <button
                    class="sideButton"
                    type="button"
                    on:click={showCurrentProject}>Test</button
                >
            </div>
        </div>
        <div class="divMain">
            {#if currentProject}
                <h2>Create your Project</h2>
                <div class="divFormSplit divSpliter">
                    <div class="divFormPrjLeft">
                        <div>
                            <p class="formPrj">Project Title</p>
                            <input
                                class="form-control formPrj"
                                type="text"
                                placeholder="DB Migration"
                                aria-label="default input example"
                                bind:value={currentProject.title}
                            />
                        </div>
                    </div>
                    <div class="divFormPrjRight">
                        <div>
                            <p class="formPrj">CustomerID</p>
                            <input
                                class="form-control formPrj"
                                type="text"
                                placeholder="99999"
                                aria-label="default input example"
                                bind:value={currentProject.customerID}
                            />
                        </div>
                    </div>
                </div>
            {/if}
        </div>
    </div>
</header>
