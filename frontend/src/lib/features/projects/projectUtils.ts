import type { Project, ProjectPhase } from "$lib/models/project";

export function toDateOrNull(value: Date | string | null): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function toInputDate(value: Date | string | null): string | null {
  const date = toDateOrNull(value);
  return date ? date.toISOString().split("T")[0] : null;
}

export function formatBudget(value: number | null): string {
  if (value == null) return "-";
  return new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
    minimumFractionDigits: 2,
  }).format(value);
}

export function getPhaseRange(
  project: Project | null,
  phaseName: ProjectPhase["phaseName"] | "",
) {
  if (!project || !phaseName) return { start: null, end: null };

  const phaseMap: Record<ProjectPhase["phaseName"], ProjectPhase[] | undefined> = {
    Initiation: project.initiationPhase,
    Planing: project.planingPhase,
    Execution: project.executionPhase,
    Closure: project.closurePhase,
  };

  const phase = phaseMap[phaseName]?.[0];
  const start = toInputDate(phase?.startDate ?? null);
  const end = toInputDate(phase?.dueDate ?? null);
  return { start, end };
}

 export function dueDateLabel(value: Date | null) {
    if (!value) return "-";
    return value.toLocaleDateString("de-CH", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }