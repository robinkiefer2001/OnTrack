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

  function getProjectRange() {
    const startDate = toDateOrNull(start);
    const endDate = toDateOrNull(end);
    if (startDate && endDate) {
      if (startDate > endDate) return { startDate: endDate, endDate: startDate };
      return { startDate, endDate };
    }

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

  function createGanttData() {
    const datasets: any[] = [];
    const phaseLabels = ["Initiation", "Planing", "Execution", "Monitoring", "Closure"];
    
    // Phase-Balken hinzufügen
    if (phases) {
      const phaseColors = {
        Initiation: "rgba(59, 130, 246, 0.5)",
        Planing: "rgba(16, 185, 129, 0.5)",
        Execution: "rgba(245, 158, 11, 0.5)",
        Monitoring: "rgba(139, 92, 246, 0.5)",
        Closure: "rgba(239, 68, 68, 0.5)"
      };

      const allPhases = [
        ...(phases.initiation || []),
        ...(phases.planing || []),
        ...(phases.execution || []),
        ...(phases.monitoring || []),
        ...(phases.closure || [])
      ];

      allPhases.forEach(phase => {
        const phaseStart = toDateOrNull(phase.startDate);
        const phaseEnd = toDateOrNull(phase.dueDate);
        
        if (phaseStart && phaseEnd) {
          const xMin = Math.min(phaseStart.getTime(), phaseEnd.getTime());
          const xMax = Math.max(phaseStart.getTime(), phaseEnd.getTime());
          datasets.push({
            label: `${phase.phaseName} Phase`,
            data: [{
              x: [xMin, xMax],
              y: phase.phaseName
            }],
            backgroundColor: phaseColors[phase.phaseName as keyof typeof phaseColors],
            borderColor: phaseColors[phase.phaseName as keyof typeof phaseColors]?.replace("0.5", "1"),
            borderWidth: 2,
            borderSkipped: false,
            barThickness: 30
          });
        }
      });
    }

    // Task-Balken hinzufügen
    const taskColors = {
      "Pending": "rgba(148, 163, 184, 0.8)",
      "To Do": "rgba(96, 165, 250, 0.8)",
      "In Progress": "rgba(251, 191, 36, 0.8)",
      "Done": "rgba(34, 197, 94, 0.8)"
    };

    tasks.forEach(task => {
      const taskStart = toDateOrNull(task.startDate);
      const taskEnd = toDateOrNull(task.dueDate);
      
      if (taskStart && taskEnd && task.projectPhase) {
        const xMin = Math.min(taskStart.getTime(), taskEnd.getTime());
        const xMax = Math.max(taskStart.getTime(), taskEnd.getTime());
        datasets.push({
          label: task.title,
          data: [{
            x: [xMin, xMax],
            y: task.projectPhase
          }],
          backgroundColor: taskColors[task.status as keyof typeof taskColors] || taskColors.Pending,
          borderColor: taskColors[task.status as keyof typeof taskColors]?.replace("0.8", "1") || taskColors.Pending.replace("0.8", "1"),
          borderWidth: 1,
          borderSkipped: false,
          barThickness: 15
        });
      }
    });

    return { datasets, labels: phaseLabels };
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
              unit: "day",
              displayFormats: {
                day: 'dd.MM.yyyy'
              }
            },
            min: startDate ? startDate.toISOString() : undefined,
            max: endDate ? endDate.toISOString() : undefined,
          },
          y: {
            type: "category",
            stacked: false,
          },
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            callbacks: {
              label: function(context: any) {
                const data = context.raw;
                if (data && data.x) {
                  const start = new Date(data.x[0]);
                  const end = new Date(data.x[1]);
                  return `${context.dataset.label}: ${start.toLocaleDateString('de-CH')} - ${end.toLocaleDateString('de-CH')}`;
                }
                return context.dataset.label;
              }
            }
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

    const x: any = chart.options.scales!.x;
    x.min = startDate ? startDate.toISOString() : undefined;
    x.max = endDate ? endDate.toISOString() : undefined;

    const zoomOptions: any = chart.options.plugins?.zoom;
    if (zoomOptions?.limits?.x) {
      zoomOptions.limits.x.min = startDate ? startDate.getTime() : undefined;
      zoomOptions.limits.x.max = endDate ? endDate.getTime() : undefined;
    }

    chart.update();
  });

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

<div class="card bg-base-100 shadow-md p-4" style="height: 400px;">
  <canvas bind:this={canvas}></canvas>
</div>
