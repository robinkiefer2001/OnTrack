<script lang="ts">
    import type { Project } from "$lib/models/project";
    import type { getHourlyRate } from "$lib/models/hourlyRates";
    import { t } from "$lib/language";
    import { getProjectBudgetSummary, formatBudget } from "$lib/features/projects/projectUtils";
    import { DEFAULT_HOURLY_RATES } from "$lib/models/hourlyRates";

    export let project: Project | null = null;

    $: summary = project ? getProjectBudgetSummary(project) : null;
</script>

<div
    class="bg-gray-200 p-4 overflow-x-auto flex-2 max-w-full min-h-screen justify-items-center-safe mx-auto px-6"
>
    <div class="stats bg-base-100 border-base-300 border rounded-4xl shadow-sm">
        <div class="stat">
            <div class="stat-title">{$t.taskDetail.taskTotal}</div>
            <div class="stat-value"></div>
        </div>

        <div class="stat">
            <div class="stat-title">{$t.taskDetail.taskCosts}</div>
            <div class="stat-value"></div>
        </div>
            
        
    </div>
</div>
