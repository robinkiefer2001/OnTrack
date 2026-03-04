<script lang="ts">
    import type {
        Project,
        ProjectStatus,
        customer,
        customerEmployee,
    } from "$lib/models/project";
    import {
        addToListProject,
        customerList,
        projectList,
    } from "$lib/models/mockupData";

    // State Variables
    let initProject: Project | null = null;
    let selectedProject: Project | null = null;
    let selectedCustomer: customer | null = null;
    let showCustomerSelect: boolean = false;
    let selectedRow: number | null = null;
    let showForm: boolean = false;

    // Event Handlers
    function newProject() {
        showForm = true;
        initProject = {
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

    function selectCustomer() {
        showCustomerSelect = true;
        return selectedCustomer;
    }

    function toggleSelect(id: number) {
        selectedRow = selectedRow === id ? null : id;
    }

    function checkOn() {
        console.log("checkbox clicked");
    }

    function cancelNewProject() {
        initProject = null;
        showForm = false;
    }

    function modifyProject() {}

    function submitNewProject() {
        // Here you would typically send the initProject data to your backend API
        if (initProject !== null) {
            addToListProject(initProject);
        }
        showForm = false;
        // After submission, you might want to reset the form or navigate away
        initProject = null;
    }

    // Debug Functions
    function printOutProjectState() {
        console.log(initProject);
    }

    function showCurrentProject() {}
</script>

<ul class="menu menu-vertical lg:menu-horizontal bg-base-100 rounded-box">
    <li>
        <a>
            <button class="btn btn-neutral" on:click={newProject}
                >New Project</button
            >
        </a>
    </li>
    {#if selectedProject == null}
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
    <a>
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
    </a>
</ul>

<div class="rounded-box shadow bg-base-100 p-4 overflow-x-auto flex-2 h-200">
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
                        toggleSelect(p.projectID!);
                        selectedProject = {
                            title: p.title,
                            customerID: p.customerID,
                            customerName: p.customerName,
                            budget: p.budget,
                            dueDate: p.dueDate,
                            startDate: p.startDate,
                            projectID: p.projectID,
                            projectManager: p.projectManager,
                            projectstatus: p.projectstatus as ProjectStatus,
                        };
                    }}
                >
                    <td>{p.projectID}</td>
                    <td>{p.customerName}</td>
                    <td>{p.projectManager}</td>
                    <td>CHF. {p.budget}</td>
                    <td>{p.projectstatus as ProjectStatus}</td>
                    <td>
                        {p.dueDate
                            ? p.dueDate.toLocaleDateString("de-CH", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                              })
                            : "-"}
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>

{#if showForm}
    <div
        class="fixed inset-0 bg-black/40 flex items-center justify-center w-full h-full"
    >
        <div class="bg-white p-6 rounded-lg shadow-xl h-full w-full">
            <!-- name of each tab group should be unique -->
            <div class="tabs tabs-lift content-center">
                <input
                    type="radio"
                    name="my_tabs_3"
                    class="tab"
                    aria-label="Project Details"
                    checked="checked"
                />

                <div class="tab-content bg-base-100 border-base-300 p-6">
                    <div class="grid grid-cols-3 gap-6 mb-4">
                        <div class="flex-1">
                            <p class="text-2xl font-bold mb-4">Project Name</p>
                            <input
                                type="text"
                                placeholder="Type here"
                                class="input"
                                bind:value={initProject!.title}
                            />
                        </div>
                        <div class="flex-1">
                            <p class="text-2xl font-bold mb-4">Customer</p>
                            <input
                                type="text"
                                placeholder="Type here"
                                class="input"
                                bind:value={initProject!.customerName}
                                readonly
                            />
                            <button
                                class="btn btn-neutral"
                                on:click={selectCustomer}
                            >
                                Select Customer
                            </button>
                            {#if showCustomerSelect}
                                <div
                                    class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                                >
                                    <div
                                        class="bg-white p-4 rounded-lg shadow-xl w-80"
                                    > 
                                    <input type="text" placeholder="Search Customer" class="input w-full mb-4" />
                                        <ul class="menu bg-base-100 w-full">
                                            {#each customerList as c}
                                                <li
                                                    on:click={() => {
                                                        initProject!.customerID =
                                                            c.customerID;
                                                        initProject!.customerName =
                                                            c.companyName;
                                                        showCustomerSelect = false;
                                                    }}
                                                >
                                                    <a>{c.companyName}</a>
                                                </li>
                                            {/each}
                                        </ul>
                                                                                                                                              <button
                                        class="btn btn-neutral absolute top-4 right-4"
                                        on:click={() => {
                                            showCustomerSelect = false;
                                        }}>
                                        Close</button>
  
                                    </div>
        
                                </div>
                                
                            {/if}
                        </div>
                        <div class="flex-1">
                            <p class="text-2xl font-bold mb-4">
                                Project Manager
                            </p>
                            <input
                                type="text"
                                placeholder="Type here"
                                class="input"
                                bind:value={initProject!.projectManager}
                            />
                        </div>
                        <div class="flex-1">
                            <p class="text-2xl font-bold mb-4">Budget</p>
                            <input
                                type="text"
                                placeholder="Type here"
                                class="input"
                                bind:value={initProject!.budget}
                            />
                        </div>
                        <div class="flex-1">
                            <p class="text-2xl font-bold mb-4">Start Date</p>
                            <input
                                type="date"
                                placeholder="Type here"
                                class="input"
                                bind:value={initProject!.startDate}
                            />
                        </div>
                        <div class="flex-1">
                            <p class="text-2xl font-bold mb-4">Due Date</p>
                            <input
                                type="date"
                                placeholder="Type here"
                                class="input"
                                bind:value={initProject!.dueDate}
                            />
                        </div>
                    </div>
                </div>

                <input
                    type="radio"
                    name="my_tabs_3"
                    class="tab"
                    aria-label="Notifications"
                />
                <div class="tab-content bg-base-100 border-base-300 p-6">
                    Tab content 3
                </div>
            </div>
            <div class="flex gap-4 mt-4">
                <button class="btn" on:click={submitNewProject}>Submit</button>
                <button class="btn btn-neutral" on:click={cancelNewProject}
                    >Cancel</button
                >
            </div>
        </div>
    </div>
{/if}
