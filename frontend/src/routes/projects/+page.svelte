<script lang="ts">
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

    function modifyProject() {}

    function submitNewProject() {
        // Here you would typically send the currentProject data to your backend API
        console.log("Submitting project:", currentProject);
        // After submission, you might want to reset the form or navigate away
        currentProject = null;
    }
</script>

<div class="split">
    <div class="divMain">
        <div class="d-grid gap-2">
            <button type="button" class="sideButton" on:click={newProject}>
                Create Project
            </button>
            <button type="button" class="sideButton" on:click={modifyProject}>
                Modify Project
            </button>
            <button
                type="button"
                class="sideButton"
                on:click={printOutProjectState}
            >
                Print Project State
            </button>
        </div>
    </div>
</div>
/* This section will only be rendered if currentProject is not null
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
                    <button class="btn btn-secondary formPrj" type="button"
                        >Select Customer</button
                    >
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
*/