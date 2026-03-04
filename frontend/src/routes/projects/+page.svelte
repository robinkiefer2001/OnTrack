<script lang="ts">
    import type { Project, ProjectStatus } from "$lib/models/project";
    import { projectList } from "$lib/models/mockupData";

    // State Variables
    let currentProject: Project | null = null;
    let selectedRow: number | null = null;


    // Event Handlers
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
            projectstatus: "Initiation" as ProjectStatus,
        };
    }

    function toggleSelect(id: number) {
        selectedRow = selectedRow === id ? null : id;
    }

    function checkOn() {
        console.log("checkbox clicked");
    }

    function cancelNewProject() {
        currentProject = null;
    }

    function modifyProject() {}

    function submitNewProject() {
        // Here you would typically send the currentProject data to your backend API

        // After submission, you might want to reset the form or navigate away
        currentProject = null;
    }

    // Debug Functions
    function printOutProjectState() {
        console.log(currentProject);
    }

    function showCurrentProject() {
        console.log(currentProject);
    }
</script>

<ul class="menu menu-vertical lg:menu-horizontal bg-base-100 rounded-box">
    <li>
        <a>
            <button class="btn btn-neutral" on:click={newProject}
                >New Project</button
            >
        </a>
    </li>
    {#if currentProject == null}
        <li>
            <a>
                <button
                    class="btn btn-neutral"
                    disabled
                    on:click={printOutProjectState}>Print Project State</button
                >
            </a>
        </li>
        <li>
            <a>
                <button
                    class="btn btn-neutral"
                    disabled
                    on:click={modifyProject}>Modify Project</button
                >
            </a>
        </li>
        <li>
            <a>
                <button class="btn" disabled on:click={showCurrentProject}
                    >Show Current Project</button
                >
            </a>
        </li>
    {:else}
        <li>
            <a>
                <button class="btn" on:click={printOutProjectState}
                    >Print Project State</button
                >
            </a>
        </li>
        <li>
            <a>
                <button class="btn" on:click={modifyProject}
                    >Modify Project</button
                >
            </a>
        </li>
        <li>
            <a>
                <button class="btn" on:click={showCurrentProject}
                    >Show Current Project</button
                >
            </a>
        </li>
    {/if}
</ul>

<div class="rounded-box shadow bg-base-100 p-4 overflow-x-auto flex-2">
    <label class="input">
        <svg
            class="h-[1em] opacity-50"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
        >
            <g
                stroke-linejoin="round"
                stroke-linecap="round"
                stroke-width="2.5"
                fill="none"
                stroke="currentColor"
            >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
            </g>
        </svg>
        <input type="search" required placeholder="Search" />
    </label>
    <table class="table">
        <thead>
            <tr>
                <th>Project Nr.</th>
                <th>Customer</th>
                <th>Project Manager</th>
                <th>Budget</th>
                <th>Status</th>
                <th>Due Date</th>
            </tr>
        </thead>
        <tbody class="">
            {#each projectList as p}
                <tr
                    class="cursor-pointer hover:bg-gray-100 transition-colors"
                    on:click={() => {
                        toggleSelect(p.projectID);
                        currentProject = {
                            title: p.title,
                            customerName: p.customerName,
                            budget: p.budget,
                            dueDate: p.dueDate,
                            startDate: p.startDate,
                            projectID: p.projectID,
                            projectManager: p.projectManager,
                            projectstatus: p.status as ProjectStatus,
                        };
                    }}
                >
                    <td>{p.projectID}</td>
                    <td>{p.customerName}</td>
                    <td>{p.projectManager}</td>
                    <td>${p.budget}</td>
                    <td>{p.status as ProjectStatus}</td>
                    <td>{p.dueDate}</td>
                    <td>{p.startDate}</td>
                </tr>
            {/each}
        </tbody>
    </table>
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
