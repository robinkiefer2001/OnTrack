<script lang="ts">
  import { onMount, onDestroy, afterUpdate } from "svelte";
  import { Chart } from "chart.js/auto";
  import "chartjs-adapter-date-fns";
  import zoomPlugin from "chartjs-plugin-zoom";

  Chart.register(zoomPlugin);

  let canvas: HTMLCanvasElement;
  let chart: Chart | null = null;

  export let start: Date | string | null = null;
  export let end: Date | string | null = null;

  const phases = ["Initiation", "Planning", "Execution", "Closure"];

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

  onMount(() => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const startDate = toDateOrNull(start);
    const endDate = toDateOrNull(end);

    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: phases,
        datasets: [], // noch keine Phasen-Balken
      },
      options: {
        scales: {
          x: {
            type: "time",
            time: { unit: "day" },
            min: startDate ? startDate.toISOString() : undefined,
            max: endDate ? endDate.toISOString() : undefined,
          },
          y: {
            type: "category",
            labels: phases,
          },
        },
        plugins: {
          zoom: {
            limits: {
              x: {
                // Zoom nie vor Start und nie nach Ende
                min: startDate ? startDate.getTime() : undefined,
                max: endDate ? endDate.getTime() : undefined,
              },
            },
            pan: {
              enabled: true,
              mode: "x",
            },
            zoom: {
              drag: { enabled: true },
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

    const startDate = toDateOrNull(start);
    const endDate = toDateOrNull(end);

    const x: any = chart.options.scales!.x;
    x.min = startDate ? startDate.toISOString() : undefined;
    x.max = endDate ? endDate.toISOString() : undefined;

    chart.update();
  });

  onDestroy(() => {
    chart?.destroy();
  });

  export function resetFocus() {
    if (!chart) return;

    const startDate = toDateOrNull(start);
    const endDate = toDateOrNull(end);

    const x: any = chart.options.scales!.x;
    x.min = startDate ? startDate.toISOString() : undefined;
    x.max = endDate ? endDate.toISOString() : undefined;

    // Zoom-Plugin zurücksetzen
    (chart as any).resetZoom?.();

    chart.update();
  }
</script>

<div class="card bg-base-100 shadow-md p-4">
  <canvas bind:this={canvas}></canvas>
</div>
