<script lang="ts">
  import { onMount, onDestroy, afterUpdate } from "svelte";
  import { browser } from "$app/environment";
  import { Chart } from "chart.js/auto";
  import "chartjs-adapter-date-fns";
  import type { Task, ProjectPhase } from "$lib/models/project";

  let canvas: HTMLCanvasElement;
  let chart: Chart | null = null;

  export let start: Date | string | null = null;
  export let end: Date | string | null = null;
  export let tasks: Task[] = [];
  export let phases: {
    initiation: ProjectPhase[];
    planing: ProjectPhase[];
    execution: ProjectPhase[];
    monitoring: ProjectPhase[];
    closure: ProjectPhase[];
  } | null = null;

  type ViewMode = "phases" | "tasks" | "combined";
  let viewMode: ViewMode = "phases";
  let expandedPhases = new Set<string>(["Initiation", "Planing", "Execution", "Monitoring", "Closure"]);
  
  type TimeUnit = "day" | "week" | "month";
  let timeUnit: TimeUnit = "week";

  function getProjectRange() {
    // Bevorzuge immer die Projekt Start- und Enddaten
    const projectStart = toDateOrNull(start);
    const projectEnd = toDateOrNull(end);
    
    if (projectStart && projectEnd) {
      if (projectStart > projectEnd) return { startDate: projectEnd, endDate: projectStart };
      return { startDate: projectStart, endDate: projectEnd };
    }

    // Fallback: Wenn Projekt-Daten fehlen, berechne aus Phasen
    if (!phases) return { startDate: null, endDate: null };

    const candidates = [
      ...phases.initiation,
      ...phases.planing,
      ...phases.execution,
      ...phases.monitoring,
      ...phases.closure,
    ];

    const starts = candidates
      .map((p) => toDateOrNull(p.startDate))
      .filter((d): d is Date => !!d)
      .map((d) => d.getTime());
    const ends = candidates
      .map((p) => toDateOrNull(p.dueDate))
      .filter((d): d is Date => !!d)
      .map((d) => d.getTime());

    if (!starts.length || !ends.length) return { startDate: null, endDate: null };

    return {
      startDate: new Date(Math.min(...starts)),
      endDate: new Date(Math.max(...ends)),
    };
  }

  function parseSwissDate(value: string | null): Date | null {
    if (!value) return null;
    const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value);
    if (!m) return null;
    const [, dd, mm, yyyy] = m;
    const iso = `${yyyy}-${mm}-${dd}`;
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  function toDateOrNull(value: Date | string | null): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    const iso = new Date(value);
    if (!Number.isNaN(iso.getTime())) return iso;
    return parseSwissDate(value);
  }

  // PHASE VIEW: Nur Phasen anzeigen
  function createPhaseView() {
    const datasets: any[] = [];
    const labels: string[] = [];
    
    const phaseColors = {
      Initiation: { bg: "rgba(99, 102, 241, 0.65)", border: "rgba(99, 102, 241, 1)" },
      Planing: { bg: "rgba(59, 130, 246, 0.65)", border: "rgba(59, 130, 246, 1)" },
      Execution: { bg: "rgba(168, 85, 247, 0.65)", border: "rgba(168, 85, 247, 1)" },
      Monitoring: { bg: "rgba(236, 72, 153, 0.65)", border: "rgba(236, 72, 153, 1)" },
      Closure: { bg: "rgba(20, 184, 166, 0.65)", border: "rgba(20, 184, 166, 1)" }
    };

    const phaseOrder = ["Initiation", "Planing", "Execution", "Monitoring", "Closure"];
    
    // Alle Phase-Labels hinzufügen
    phaseOrder.forEach(phaseName => labels.push(phaseName));
    
    if (phases) {
      const allPhases = [
        ...(phases.initiation || []),
        ...(phases.planing || []),
        ...(phases.execution || []),
        ...(phases.monitoring || []),
        ...(phases.closure || [])
      ];

      phaseOrder.forEach(phaseName => {
        const phase = allPhases.find(p => p.phaseName === phaseName);
        
        const phaseStart = phase ? toDateOrNull(phase.startDate) : null;
        const phaseEnd = phase ? toDateOrNull(phase.dueDate) : null;
        
        const startStr = phaseStart ? phaseStart.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'nicht gesetzt';
        const endStr = phaseEnd ? phaseEnd.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'nicht gesetzt';
        const phaseLabel = `${phaseName}`;
        const phaseDateInfo = `${startStr} - ${endStr}`;

        if (phaseStart && phaseEnd) {
          const xMin = Math.min(phaseStart.getTime(), phaseEnd.getTime());
          const xMax = Math.max(phaseStart.getTime(), phaseEnd.getTime());
          
          datasets.push({
            label: `${phaseName} (${phaseDateInfo})`,
            data: [{
              x: [xMin, xMax],
              y: phaseLabel
            }],
            backgroundColor: phaseColors[phaseName as keyof typeof phaseColors].bg,
            borderColor: phaseColors[phaseName as keyof typeof phaseColors].border,
            borderWidth: 2.5,
            borderSkipped: false,
            barThickness: 14,
            categoryPercentage: 1.0,
            barPercentage: 0.9
          });
        } else if (phaseStart || phaseEnd) {
          // Show partial bar with dashed border if only one date is set
          const fallbackDate = phaseStart || phaseEnd;
          const dayInMs = 24 * 60 * 60 * 1000;
          const xMin = fallbackDate!.getTime();
          const xMax = fallbackDate!.getTime() + dayInMs;
          
          datasets.push({
            label: `${phaseName} (incomplete)`,
            data: [{
              x: [xMin, xMax],
              y: phaseLabel
            }],
            backgroundColor: phaseColors[phaseName as keyof typeof phaseColors].bg,
            borderColor: phaseColors[phaseName as keyof typeof phaseColors].border,
            borderWidth: 2.5,
            borderSkipped: false,
            borderDash: [5, 5],
            barThickness: 14,
            categoryPercentage: 1.0,
            barPercentage: 0.9
          });
        }
      });
    }

    return { datasets, labels };
  }

  // TASK VIEW: Tasks gruppiert nach Phasen
  function createTaskView() {
    const datasets: any[] = [];
    const labels: string[] = [];

    const taskColors = {
      "Pending": { bg: "rgba(148, 163, 184, 0.8)", border: "rgba(148, 163, 184, 1)" },
      "To Do": { bg: "rgba(96, 165, 250, 0.8)", border: "rgba(96, 165, 250, 1)" },
      "In Progress": { bg: "rgba(251, 191, 36, 0.8)", border: "rgba(251, 191, 36, 1)" },
      "Done": { bg: "rgba(34, 197, 94, 0.8)", border: "rgba(34, 197, 94, 1)" }
    };

    const phaseOrder = ["Initiation", "Planing", "Execution", "Monitoring", "Closure"];
    
    if (phases) {
      const allPhases = [
        ...(phases.initiation || []),
        ...(phases.planing || []),
        ...(phases.execution || []),
        ...(phases.monitoring || []),
        ...(phases.closure || [])
      ];

      phaseOrder.forEach((phaseName, phaseIndex) => {
        const phase = allPhases.find(p => p.phaseName === phaseName);
        const phaseTasks = tasks.filter(t => t.projectPhase === phaseName);
        
        if (phaseTasks.length > 0 && expandedPhases.has(phaseName)) {
          phaseTasks.forEach((task) => {
            const taskStart = toDateOrNull(task.startDate);
            const taskEnd = toDateOrNull(task.dueDate);
            
            const taskLabel = `  ${task.title}`;
            labels.push(taskLabel);
            
            if (taskStart && taskEnd) {
              const xMin = Math.min(taskStart.getTime(), taskEnd.getTime());
              const xMax = Math.max(taskStart.getTime(), taskEnd.getTime());
              
              const color = taskColors[task.status as keyof typeof taskColors] || taskColors.Pending;
              
              datasets.push({
                label: `${task.title} (${phaseName})`,
                data: [{
                  x: [xMin, xMax],
                  y: taskLabel
                }],
                backgroundColor: color.bg,
                borderColor: color.border,
                borderWidth: 2,
                borderSkipped: false,
                barThickness: 16,
                categoryPercentage: 1.0,
                barPercentage: 0.9
              });
            }
          });
          
          // Add spacing between phase groups
          if (phaseIndex < phaseOrder.length - 1) {
            labels.push(""); // Empty spacer
          }
        }
      });
    }

    return { datasets, labels };
  }

  // COMBINED VIEW: Phasen als Hintergrund, Tasks im Vordergrund
  function createCombinedView() {
    const phaseDatasets: any[] = [];
    const taskDatasets: any[] = [];
    const labels: string[] = [];
    
    const phaseColors = {
      Initiation: { bg: "rgba(99, 102, 241, 0.15)", border: "rgba(99, 102, 241, 0.4)" },
      Planing: { bg: "rgba(59, 130, 246, 0.15)", border: "rgba(59, 130, 246, 0.4)" },
      Execution: { bg: "rgba(168, 85, 247, 0.15)", border: "rgba(168, 85, 247, 0.4)" },
      Monitoring: { bg: "rgba(236, 72, 153, 0.15)", border: "rgba(236, 72, 153, 0.4)" },
      Closure: { bg: "rgba(20, 184, 166, 0.15)", border: "rgba(20, 184, 166, 0.4)" }
    };

    const taskColors = {
      "Pending": { bg: "rgba(148, 163, 184, 0.85)", border: "rgba(148, 163, 184, 1)" },
      "To Do": { bg: "rgba(96, 165, 250, 0.85)", border: "rgba(96, 165, 250, 1)" },
      "In Progress": { bg: "rgba(251, 191, 36, 0.85)", border: "rgba(251, 191, 36, 1)" },
      "Done": { bg: "rgba(34, 197, 94, 0.85)", border: "rgba(34, 197, 94, 1)" }
    };

    const phaseOrder = ["Initiation", "Planing", "Execution", "Monitoring", "Closure"];
    
    if (phases) {
      const allPhases = [
        ...(phases.initiation || []),
        ...(phases.planing || []),
        ...(phases.execution || []),
        ...(phases.monitoring || []),
        ...(phases.closure || [])
      ];

      // Zuerst alle Labels hinzufügen
      phaseOrder.forEach(phaseName => {
        const phase = allPhases.find(p => p.phaseName === phaseName);
        const phaseStart = phase ? toDateOrNull(phase.startDate) : null;
        const phaseEnd = phase ? toDateOrNull(phase.dueDate) : null;
        const startStr = phaseStart ? phaseStart.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' }) : 'n/a';
        const endStr = phaseEnd ? phaseEnd.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' }) : 'n/a';
        const phaseLabel = `${phaseName} (${startStr} - ${endStr})`;
        labels.push(phaseLabel);
      });

      phaseOrder.forEach(phaseName => {
        const phase = allPhases.find(p => p.phaseName === phaseName);
        
        const phaseStart = phase ? toDateOrNull(phase.startDate) : null;
        const phaseEnd = phase ? toDateOrNull(phase.dueDate) : null;
        
        const startStr = phaseStart ? phaseStart.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' }) : 'n/a';
        const endStr = phaseEnd ? phaseEnd.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' }) : 'n/a';
        const phaseLabel = `${phaseName} (${startStr} - ${endStr})`;

        // Phase background bar
        if (phaseStart && phaseEnd) {
          const xMin = Math.min(phaseStart.getTime(), phaseEnd.getTime());
          const xMax = Math.max(phaseStart.getTime(), phaseEnd.getTime());
          
          phaseDatasets.push({
            label: `${phaseName} Phase`,
            data: [{
              x: [xMin, xMax],
              y: phaseLabel
            }],
            backgroundColor: phaseColors[phaseName as keyof typeof phaseColors].bg,
            borderColor: phaseColors[phaseName as keyof typeof phaseColors].border,
            borderWidth: 1,
            borderSkipped: false,
            barThickness: 24,
            categoryPercentage: 1.0,
            barPercentage: 1.0,
            order: 2
          });
        } else if (phaseStart || phaseEnd) {
          // Show partial bar with dashed border if only one date is set
          const fallbackDate = phaseStart || phaseEnd;
          const dayInMs = 24 * 60 * 60 * 1000;
          const xMin = fallbackDate!.getTime();
          const xMax = fallbackDate!.getTime() + dayInMs; // 1 day placeholder
          
          phaseDatasets.push({
            label: `${phaseName} Phase (incomplete)`,
            data: [{
              x: [xMin, xMax],
              y: phaseLabel
            }],
            backgroundColor: phaseColors[phaseName as keyof typeof phaseColors].bg,
            borderColor: phaseColors[phaseName as keyof typeof phaseColors].border,
            borderWidth: 2,
            borderSkipped: false,
            borderDash: [5, 5],
            barThickness: 24,
            categoryPercentage: 1.0,
            barPercentage: 1.0,
            order: 2
          });
        }

        // Tasks for this phase
        const phaseTasks = tasks.filter(t => t.projectPhase === phaseName);
        phaseTasks.forEach((task) => {
          const taskStart = toDateOrNull(task.startDate);
          const taskEnd = toDateOrNull(task.dueDate);
          
          if (taskStart && taskEnd) {
            const xMin = Math.min(taskStart.getTime(), taskEnd.getTime());
            const xMax = Math.max(taskStart.getTime(), taskEnd.getTime());
            
            const color = taskColors[task.status as keyof typeof taskColors] || taskColors.Pending;
            
            taskDatasets.push({
              label: task.title,
              data: [{
                x: [xMin, xMax],
                y: phaseLabel
              }],
              backgroundColor: color.bg,
              borderColor: color.border,
              borderWidth: 2,
              borderSkipped: false,
              barThickness: 12,
              categoryPercentage: 0.9,
              barPercentage: 0.9,
              order: 1
            });
          }
        });
      });
    }

    return { datasets: [...taskDatasets, ...phaseDatasets], labels };
  }

  function createGanttData() {
    switch (viewMode) {
      case "phases":
        return createPhaseView();
      case "tasks":
        return createTaskView();
      case "combined":
        return createCombinedView();
      default:
        return createPhaseView();
    }
  }

  onMount(async () => {
    if (!browser) return;

    // Plugin nur im Browser laden
    const zoomModule = await import("chartjs-plugin-zoom");
    const zoomPlugin = zoomModule.default ?? zoomModule;
    Chart.register(zoomPlugin);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { startDate, endDate } = getProjectRange();

    const ganttData = createGanttData();

    chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ganttData.labels,
        datasets: ganttData.datasets,
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: "time",
            time: { 
              unit: timeUnit,
              displayFormats: {
                day: 'dd.MM',
                week: "'KW'ww yyyy",
                month: 'MMM yyyy'
              }
            },
            min: startDate ? startDate.toISOString() : undefined,
            max: endDate ? endDate.toISOString() : undefined,
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.05)',
              drawOnChartArea: true
            },
            ticks: {
              maxRotation: 0,
              minRotation: 0,
              font: {
                size: 11
              },
              source: 'auto'
            },
            bounds: 'data'
          },
          y: {
            type: "category",
            stacked: false,
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 12,
                weight: (context: any) => {
                  // Bold for phase names in task view
                  return context.tick.label && !context.tick.label.startsWith('  ') ? 'bold' : 'normal';
                }
              },
              padding: 2
            }
          },
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              title: function(context: any) {
                return context[0]?.dataset?.label || '';
              },
              label: function(context: any) {
                const data = context.raw;
                if (data && data.x) {
                  const start = new Date(data.x[0]);
                  const end = new Date(data.x[1]);
                  const duration = Math.ceil((data.x[1] - data.x[0]) / (1000 * 60 * 60 * 24));
                  
                  return [
                    `Start: ${start.toLocaleDateString('de-CH', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}`,
                    `Ende: ${end.toLocaleDateString('de-CH', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}`,
                    `Dauer: ${duration} Tag${duration !== 1 ? 'e' : ''}`
                  ];
                }
                return '';
              },
              labelTextColor: function(context: any) {
                return '#fff';
              }
            },
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            cornerRadius: 6,
            displayColors: false
          },
          zoom: {
            limits: {
              x: {
                min: startDate ? startDate.getTime() : undefined,
                max: endDate ? endDate.getTime() : undefined,
              },
            },
            pan: {
              enabled: true,
              mode: "x",
            },
            zoom: {
              wheel: { enabled: true },
              mode: "x",
            },
          },
        },
      },
    });
  });

  afterUpdate(() => {
    if (!chart) return;

    const { startDate, endDate } = getProjectRange();

    const ganttData = createGanttData();
    chart.data.datasets = ganttData.datasets;
    chart.data.labels = ganttData.labels;

    const x: any = chart.options.scales!.x;
    x.min = startDate ? startDate.toISOString() : undefined;
    x.max = endDate ? endDate.toISOString() : undefined;
    if (x.time) {
      x.time.unit = timeUnit;
    }

    const zoomOptions: any = chart.options.plugins?.zoom;
    if (zoomOptions?.limits?.x) {
      zoomOptions.limits.x.min = startDate ? startDate.getTime() : undefined;
      zoomOptions.limits.x.max = endDate ? endDate.getTime() : undefined;
    }

    chart.update();
  });

  function switchView(mode: ViewMode) {
    viewMode = mode;
    if (chart) {
      const ganttData = createGanttData();
      chart.data.datasets = ganttData.datasets;
      chart.data.labels = ganttData.labels;
      chart.update();
    }
  }

  function switchTimeUnit(unit: TimeUnit) {
    timeUnit = unit;
    if (chart && chart.options.scales?.x) {
      const x: any = chart.options.scales.x;
      if (x.time) {
        x.time.unit = unit;
      }
      chart.update();
    }
  }

  onDestroy(() => {
    chart?.destroy();
  });

  export function resetFocus() {
    if (!chart) return;

    const { startDate, endDate } = getProjectRange();

    const x: any = chart.options.scales!.x;
    x.min = startDate ? startDate.toISOString() : undefined;
    x.max = endDate ? endDate.toISOString() : undefined;

    (chart as any).resetZoom?.();
    chart.update();
  }
</script>

<div class="card bg-base-100 shadow-md p-4">
  <!-- View Switcher -->
  <div class="flex justify-between items-center mb-4">
    <div class="tabs tabs-boxed bg-gray-100">
      <button 
        class="tab {viewMode === 'phases' ? 'tab-active' : ''}" 
        on:click={() => switchView('phases')}
      >
        Phases
      </button>
      <button 
        class="tab {viewMode === 'tasks' ? 'tab-active' : ''}" 
        on:click={() => switchView('tasks')}
      >
        Tasks
      </button>
      <button 
        class="tab {viewMode === 'combined' ? 'tab-active' : ''}" 
        on:click={() => switchView('combined')}
      >
        Combined
      </button>
    </div>

    <div class="flex gap-4 items-center">
      <!-- Time Unit Switcher -->
      <div class="join">
        <button 
          class="join-item btn btn-sm {timeUnit === 'day' ? 'btn-active' : 'btn-ghost'}"
          on:click={() => switchTimeUnit('day')}
        >
          Tage
        </button>
        <button 
          class="join-item btn btn-sm {timeUnit === 'week' ? 'btn-active' : 'btn-ghost'}"
          on:click={() => switchTimeUnit('week')}
        >
          Wochen
        </button>
        <button 
          class="join-item btn btn-sm {timeUnit === 'month' ? 'btn-active' : 'btn-ghost'}"
          on:click={() => switchTimeUnit('month')}
        >
          Monate
        </button>
      </div>
    </div>
  </div>

  <!-- Chart -->
  <div style="height: {viewMode === 'tasks' ? '450px' : '350px'};">
    <canvas bind:this={canvas}></canvas>
  </div>

  <!-- Legends and Info -->
  <div class="mt-3">
    {#if viewMode === 'tasks' || viewMode === 'combined'}
      <!-- Task Status Legend -->
      <div class="flex gap-4 justify-center text-sm items-center mb-2">
        <span class="font-semibold text-gray-600">Status:</span>
        <div class="flex items-center gap-1.5">
          <div class="w-4 h-4 rounded" style="background-color: rgba(148, 163, 184, 0.8); border: 1.5px solid rgba(148, 163, 184, 1);"></div>
          <span>Pending</span>
        </div>
        <div class="flex items-center gap-1.5">
          <div class="w-4 h-4 rounded" style="background-color: rgba(96, 165, 250, 0.8); border: 1.5px solid rgba(96, 165, 250, 1);"></div>
          <span>To Do</span>
        </div>
        <div class="flex items-center gap-1.5">
          <div class="w-4 h-4 rounded" style="background-color: rgba(251, 191, 36, 0.8); border: 1.5px solid rgba(251, 191, 36, 1);"></div>
          <span>In Progress</span>
        </div>
        <div class="flex items-center gap-1.5">
          <div class="w-4 h-4 rounded" style="background-color: rgba(34, 197, 94, 0.8); border: 1.5px solid rgba(34, 197, 94, 1);"></div>
          <span>Done</span>
        </div>
      </div>
    {/if}
    
    <!-- View-specific info -->
    <div class="text-xs text-gray-500 text-center">
      {#if viewMode === 'phases'}
        Phase Overview | Aktuelle Ansicht: {timeUnit === 'day' ? 'Tage' : timeUnit === 'week' ? 'Wochen' : 'Monate'}
      {:else if viewMode === 'tasks'}
        Task Details | Tasks gruppiert nach Phase | Aktuelle Ansicht: {timeUnit === 'day' ? 'Tage' : timeUnit === 'week' ? 'Wochen' : 'Monate'}
      {:else}
        Combined View | Helle Balken = Phasen, Dunkle Balken = Tasks | Aktuelle Ansicht: {timeUnit === 'day' ? 'Tage' : timeUnit === 'week' ? 'Wochen' : 'Monate'}
      {/if}
    </div>
  </div>
</div>
