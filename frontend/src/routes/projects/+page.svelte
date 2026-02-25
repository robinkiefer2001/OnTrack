<script lang="ts">
    import onTrackCorpFav from "$lib/assets/onTrackCorpFav.png";
    interface Project {
        title: string;
        customerID: number | null;
        projectID: number | null;
        customerName: string;
        dueDate: Date | null;
        startDate: Date | null;
        budget: number | null;
        projectManager: string;
    }
    let currentProject: Project | null = null;

    function newProject() {
        currentProject = {
            title: "",
            customerID: null,
            customerName: "",
            budget: null,
            dueDate: null,
            startDate: null,
            projectID: null,
            projectManager: "",
        };
    }

    function printOutProjectState() {
        console.log(currentProject);
    }

    function showCurrentProject() {
        console.log(currentProject);
    }

    function cancelNewProject() {
        currentProject = null;
    }

    function modifyProject() {

    }

    function submitNewProject() {
        // Here you would typically send the currentProject data to your backend API
        console.log("Submitting project:", currentProject);
        // After submission, you might want to reset the form or navigate away
        currentProject = null;
    }
</script>

<header>
    <h1 class="sideTitle"><img class="sideTitleIcon" src={onTrackCorpFav} alt="o" />nTrack</h1>
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
                            aria-disabled="true">Projects</a
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
                    on:click={modifyProject}>Modify Project</button
                >
                <button
                    class="sideButton"
                    type="button"
                    on:click={printOutProjectState}>Print Project State</button>
            </div>
        </div>
        <div class="divMain">
            {#if currentProject}
                <h2>Create your Project</h2>
                <div class="divSpliter">
                    <div class="divFormSplit">
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
                            <div>
                                <button class="btn btn-secondary formPrj" type="button">Select Customer</button>
                            </div>
                            <div>
                                <p class="formPrj">Project Manager</p>
                                <input
                                    class="form-control formPrj"
                                    type="text"
                                    placeholder="John Doe"
                                    aria-label="default input example"
                                    bind:value={currentProject.projectManager}
                                />
                            </div>
                            <div>
                                <p class="formPrj">Project ID</p>
                                <input
                                    class="form-control formPrj"
                                    type="text"
                                    placeholder="12345"
                                    aria-label="default input example"
                                    bind:value={currentProject.projectID}
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
                            <div>
                                <p class="formPrj">Budget</p>
                                <input
                                    class="form-control formPrj"
                                    type="text"
                                    placeholder="1000000"
                                    aria-label="default input example"
                                    bind:value={currentProject.budget}
                                />
                            </div>
                            <div>
                                <p class="formPrj">Due Date</p>
                                <input
                                    class="form-control formPrj"
                                    type="date"
                                    aria-label="default input example"
                                    bind:value={currentProject.dueDate}
                                />
                            </div>
                            <div>
                                <p class="formPrj">Start Date</p>
                                <input
                                    class="form-control formPrj"
                                    type="date"
                                    aria-label="default input example"
                                    bind:value={currentProject.startDate}
                                />
                            </div>
                        </div>
                    </div>
                    <div class="divFormSubmitSplit">
                        <div class="divFormCancel">
                            <button
                                class="btn btn-primary btn-lg formControlButton"
                                type="button"
                                on:click={cancelNewProject}>cancel</button
                            >
                        </div>
                        <div class="divFormShow">
                            <button
                                class="btn btn-primary btn-lg formControlButton"
                                type="button"
                                on:click={showCurrentProject}>show</button
                            >
                        </div>
                        <div class="divFormSubmit">
                            <button
                                class="btn btn-primary btn-lg formControlButton"
                                type="button"
                                on:click={submitNewProject}>submit</button
                            >
                        </div>
                    </div>
                </div>
            {/if}
        </div>
    </div>
</header>
