<script lang="ts">
    import type { Project } from "$lib/models/project";
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


<div class="flex-1">
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start flex-1">

    <!-- LEFT: Stat (ohne zusätzliche Box!) -->
    <div class="stats shadow rounded-box p-4 bg-base-100">
      <div class="stat">
        <div class="stat-title">Current Projects</div>
        <div class="stat-value">20</div>
        <div class="stat-desc">none</div>
      </div>
    </div>

    <!-- RIGHT: Table -->
    <div class="rounded-box shadow bg-base-100 p-4 overflow-x-auto flex-2">
      <table class="table">
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Job</th>
            <th>Favorite Color</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>1</th>
            <td>Cy Ganderton</td>
            <td>Quality Control Specialist</td>
            <td>Blue</td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</div>




<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <div class="bg-white-200 p-4">
        <button class="btn btn-primary" on:click={newProject}
            >New Project</button
        >
    </div>
    <div class="bg-white-200 p-4">
        <button class="btn btn-secondary" on:click={printOutProjectState}
            >Print Project State</button
        >
    </div>
    <div class="bg-white-200 p-4">
        <button class="btn btn-secondary" on:click={modifyProject}
            >Modify Project</button
        >
    </div>
    <div class="bg-white-200 p-4">
        <button class="btn btn-secondary" on:click={showCurrentProject}
            >Show Current Project</button
        >
    </div>
</div>

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
