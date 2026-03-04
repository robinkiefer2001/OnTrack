<script lang="ts">
    import { onMount } from "svelte";
    import {
        Chart,
        DoughnutController,
        ArcElement,
        Tooltip,
        Legend,
    } from "chart.js";

    import type { Project } from "$lib/models/project";

    Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

    let canvas!: HTMLCanvasElement;
    let currentProject: Project | null = null;

    onMount(() => {
        new Chart(canvas, {
            type: "doughnut",
            data: {
                labels: ["Worked Houers", "Remaining Houers"],
                datasets: [
                    {
                        label: "Workload",
                        data: [20, 80],
                        backgroundColor: ["#f87171", "#60a5fa"],
                        hoverOffset: 4,
                    },
                ],
            },
            options: {
                responsive: true,
                cutout: "60%", // inner radius
            },
        });
    });

    let projectList: HTMLUListElement;

</script>

<div class="dropdown dropdown-open">
  <div tabindex="0" role="button" class="btn m-1">Button</div>
  <ul tabindex="-1" class="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
    <element bind:this={projectList}></element>
  </ul>
</div>
<div class="flex gap-4">
    <div class="flex-1 bg-white-200 p-4">
        <div class="stats shadow">
            <div class="stat">
                <div class="stat-title">Project Houers</div>
                <div class="stat-value">
                    <canvas bind:this={canvas}></canvas>
                </div>
                <div class="stat-desc">tbd</div>
            </div>
        </div>
    </div>
    <div class="flex-1 bg-white-200 p-4">2</div>
    <div class="flex-1 bg-white-200 p-4">3</div>
    <div class="flex-1 bg-white-200 p-4">4</div>
</div>
