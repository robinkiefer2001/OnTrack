<script lang="ts">
    import { onMount } from "svelte";
    import {
        Chart,
        DoughnutController,
        ArcElement,
        Tooltip,
        Legend,
        BarController,
        CategoryScale,
        LinearScale,
        type ChartData,
    } from "chart.js";

    import type { Project } from "$lib/models/project";
    import { projectList } from "$lib/models/mockupData";
    import { currentUser, getUserInitials } from "$lib/stores/userStore";

    Chart.register(DoughnutController, BarController, ArcElement, CategoryScale, LinearScale, Tooltip, Legend);

    let workloadCanvas!: HTMLCanvasElement;
    let projectsCanvas!: HTMLCanvasElement;
    let workloadChart: Chart | null = null;
    let projectsChart: Chart | null = null;
    let projects: Project[] = [];
    let userProjects: Project[] = [];

    function getFullName(firstName: string, lastName: string): string {
        return `${firstName} ${lastName}`;
    }

    function isAssignedToCurrentUser(project: Project, assignedTo: string): boolean {
        const userName = getFullName($currentUser.firstName, $currentUser.lastName);
        const sameCompany = project.customerID === $currentUser.customerID;
        return sameCompany && assignedTo === userName;
    }

    function getAssignedItemsForProject(project: Project, userName: string) {
        const assignedTasks =
            project.Tasks?.filter(
                (task) => task.assignedTo === userName && project.customerID === $currentUser.customerID,
            ) ?? [];
        const assignedSubtasks =
            project.Tasks?.flatMap((task) =>
                (task.subtasks ?? []).filter(
                    (subtask) =>
                        subtask.assignedTo === userName && project.customerID === $currentUser.customerID,
                ),
            ) ?? [];

        return { assignedTasks, assignedSubtasks };
    }

    function filterUserProjects(allProjects: Project[], user: typeof $currentUser): Project[] {
        const userName = getFullName(user.firstName, user.lastName);
        return allProjects.filter((project) => {
            const { assignedTasks, assignedSubtasks } = getAssignedItemsForProject(project, userName);
            return assignedTasks.length > 0 || assignedSubtasks.length > 0;
        });
    }

    function getUserWorkload(projects: Project[], user: typeof $currentUser) {
        const userName = getFullName(user.firstName, user.lastName);
        let totalHours = 0;
        let completedHours = 0;

        projects.forEach((project) => {
            const { assignedTasks, assignedSubtasks } = getAssignedItemsForProject(project, userName);

            assignedTasks.forEach((task) => {
                totalHours += task.estimatedHours || 0;
                if (task.status === "Done") {
                    completedHours += task.estimatedHours || 0;
                }
            });

            assignedSubtasks.forEach((subtask) => {
                totalHours += subtask.estimatedHours || 0;
                if (subtask.status === "Done") {
                    completedHours += subtask.estimatedHours || 0;
                }
            });
        });

        return {
            totalHours,
            completedHours,
            remainingHours: Math.max(0, totalHours - completedHours),
        };
    }

    function getWorkItemStatusCounts(projects: Project[], user: typeof $currentUser) {
        const userName = getFullName(user.firstName, user.lastName);
        const counts: Record<string, number> = {
            "To Do": 0,
            "In Progress": 0,
            Pending: 0,
            Done: 0,
        };

        projects.forEach((project) => {
            const { assignedTasks, assignedSubtasks } = getAssignedItemsForProject(project, userName);

            assignedTasks.forEach((task) => {
                counts[task.status] = (counts[task.status] || 0) + 1;
            });

            assignedSubtasks.forEach((subtask) => {
                counts[subtask.status] = (counts[subtask.status] || 0) + 1;
            });
        });

        return counts;
    }

    function getOpenWorkItemsCount(): number {
        const statusCounts = getWorkItemStatusCounts(userProjects, $currentUser);
        return (statusCounts["To Do"] || 0) + (statusCounts["In Progress"] || 0) + (statusCounts.Pending || 0);
    }

    function getActiveProjectsCount() {
        const userName = getFullName($currentUser.firstName, $currentUser.lastName);

        return userProjects.filter((project) => {
            const { assignedTasks, assignedSubtasks } = getAssignedItemsForProject(project, userName);
            const allAssignedItems = [...assignedTasks, ...assignedSubtasks];

            if (allAssignedItems.length === 0) return false;
            return allAssignedItems.some((item) => item.status !== "Done");
        }).length;
    }

    function initCharts() {
        const workload = getUserWorkload(userProjects, $currentUser);

        if (workloadChart) {
            workloadChart.destroy();
            workloadChart = null;
        }

        if (projectsChart) {
            projectsChart.destroy();
            projectsChart = null;
        }

        if (workloadCanvas) {
            const workloadData: ChartData<"doughnut"> = {
                labels: ["Completed Hours", "Remaining Hours"],
                datasets: [
                    {
                        label: "Workload",
                        data: [workload.completedHours, workload.remainingHours],
                        backgroundColor: ["#86efac", "#60a5fa"],
                        hoverOffset: 4,
                    },
                ],
            };

            workloadChart = new Chart(workloadCanvas, {
                type: "doughnut",
                data: workloadData,
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    cutout: "60%",
                    plugins: {
                        legend: {
                            position: "bottom",
                        },
                    },
                },
            });
        }

        if (projectsCanvas) {
            const statusCounts = getWorkItemStatusCounts(userProjects, $currentUser);

            projectsChart = new Chart(projectsCanvas, {
                type: "bar",
                data: {
                    labels: Object.keys(statusCounts),
                    datasets: [
                        {
                            label: "Your Work Items by Status",
                            data: Object.values(statusCounts),
                            backgroundColor: ["#93c5fd", "#fbbf24", "#f87171", "#86efac"],
                            borderRadius: 5,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            display: true,
                            position: "bottom",
                        },
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1,
                            },
                        },
                    },
                },
            });
        }
    }

    $effect(() => {
        if (projects.length > 0) {
            userProjects = filterUserProjects(projects, $currentUser);
            initCharts();
        }
    });

    onMount(() => {
        const unsubscribe = projectList.subscribe((value) => {
            projects = value;
            userProjects = filterUserProjects(projects, $currentUser);
            initCharts();
        });

        return () => {
            unsubscribe();
            workloadChart?.destroy();
            projectsChart?.destroy();
        };
    });

    function getProjectsCount() {
        return userProjects.length;
    }

    function getTotalBudget() {
        return userProjects.reduce((sum, p) => sum + p.budget, 0);
    }

    function getUserAssignedHours() {
        let totalHours = 0;

        userProjects.forEach((project) => {
            project.Tasks?.forEach((task) => {
                if (isAssignedToCurrentUser(project, task.assignedTo)) {
                    totalHours += task.estimatedHours || 0;
                }

                task.subtasks?.forEach((subtask) => {
                    if (isAssignedToCurrentUser(project, subtask.assignedTo)) {
                        totalHours += subtask.estimatedHours || 0;
                    }
                });
            });
        });

        return totalHours;
    }

    function formatCurrency(value: number): string {
        return `CHF ${(value / 1000).toFixed(0)}k`;
    }
</script>

<div class="flex flex-col gap-6 p-6">
    <!-- Header with user info -->
    <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
                <div class="avatar placeholder">
                    <div class="bg-neutral-focus text-neutral-content rounded-full w-16">
                        <span class="text-2xl font-semibold">{getUserInitials($currentUser.firstName, $currentUser.lastName)}</span>
                    </div>
                </div>
                <div>
                    <h1 class="text-3xl font-bold">{$currentUser.firstName} {$currentUser.lastName}</h1>
                    <p class="text-blue-100">{$currentUser.jobTitle}</p>
                    <p class="text-sm text-blue-200">{$currentUser.email}</p>
                </div>
            </div>
            <div class="text-right">
                <p class="text-sm text-blue-100">Department</p>
                <p class="text-xl font-semibold">{$currentUser.department}</p>
            </div>
        </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="stats shadow bg-white rounded-lg">
            <div class="stat">
                <div class="stat-title text-sm">Your Projects</div>
                <div class="stat-value text-3xl">{getProjectsCount()}</div>
                <div class="stat-desc">Assigned to you</div>
            </div>
        </div>

        <div class="stats shadow bg-white rounded-lg">
            <div class="stat">
                <div class="stat-title text-sm">Active Projects</div>
                <div class="stat-value text-3xl text-green-500">{getActiveProjectsCount()}</div>
                <div class="stat-desc">In progress</div>
            </div>
        </div>

        <div class="stats shadow bg-white rounded-lg">
            <div class="stat">
                <div class="stat-title text-sm">Open Work Items</div>
                <div class="stat-value text-3xl">{getOpenWorkItemsCount()}</div>
                <div class="stat-desc">To do and in progress</div>
            </div>
        </div>

        <div class="stats shadow bg-white rounded-lg">
            <div class="stat">
                <div class="stat-title text-sm">Total Assigned Hours</div>
                <div class="stat-value text-3xl">{getUserAssignedHours()}</div>
                <div class="stat-desc">Tasks and subtasks</div>
            </div>
        </div>
    </div>

    <!-- Charts Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Workload Chart -->
        <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold mb-4 text-gray-800">Your Workload</h2>
            <div class="flex justify-center">
                <canvas bind:this={workloadCanvas} width="200" height="200"></canvas>
            </div>
        </div>

        <!-- Projects by Status Chart -->
        <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold mb-4 text-gray-800">Your Work Items by Status</h2>
            <div class="flex justify-center">
                <canvas bind:this={projectsCanvas} width="300" height="200"></canvas>
            </div>
        </div>
    </div>

    <!-- Quick Actions -->
    <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4 text-gray-800">Quick Actions</h2>
        <div class="flex gap-3 flex-wrap">
            <a href="/projects" class="btn btn-primary">
                View All Projects
            </a>
            <a href="/projects" class="btn btn-secondary">
                New Project
            </a>
            <a href="/admin" class="btn btn-outline">
                Manage Fees
            </a>
            <a href="/settings" class="btn btn-outline">
                Settings
            </a>
        </div>
    </div>

    <!-- Development Info -->
    <div class="alert alert-info shadow-md">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <span><strong>Your Dashboard:</strong> This dashboard shows your personalized data - projects you're assigned to, your workload, and task completion status. Switch users from the sidebar avatar to see everyone's dashboard.</span>
    </div>
</div>
