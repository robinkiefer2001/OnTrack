import type { Project, ProjectPhase, Task, Subtask, HourlyRate } from "$lib/models/project";
import { DEFAULT_HOURLY_RATES, getHourlyRate } from "$lib/models/hourlyRates";

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

// Budget-Berechnungen
export interface BudgetSummary {
  totalHours: number;
  totalCost: number;
  assignedBudget: number;
  reserveBudget: number;
  percentageUsed: number;
  isOverBudget: boolean;
}

// Berechnet die Gesamtstunden eines Tasks (Task + alle Subtasks)
export function getTaskHours(task: Task): number {
  const taskHours = task.estimatedHours || 0;
  const subtaskHours = task.subtasks?.reduce((sum, st) => sum + (st.estimatedHours || 0), 0) || 0;
  return taskHours + subtaskHours;
}

// Berechnet die Gesamtkosten eines Tasks (Task + alle Subtasks)
export function getTaskCost(task: Task, rates: HourlyRate[] = DEFAULT_HOURLY_RATES): number {
  const taskHours = task.estimatedHours || 0;
  const taskRate = getHourlyRate(task.hourlyRateType, rates);
  const taskCost = taskHours * taskRate;

  const subtasksCost = task.subtasks?.reduce((sum, st) => {
    const stHours = st.estimatedHours || 0;
    const stRate = getHourlyRate(st.hourlyRateType, rates);
    return sum + stHours * stRate;
  }, 0) || 0;

  return taskCost + subtasksCost;
}

// Berechnet den Prozentsatz eines Tasks am Projektbudget
export function getTaskBudgetPercentage(task: Task, projectBudget: number | null, rates: HourlyRate[] = DEFAULT_HOURLY_RATES): number {
  if (!projectBudget || projectBudget === 0) return 0;
  const taskCost = getTaskCost(task, rates);
  return (taskCost / projectBudget) * 100;
}

export function getPhaseHoursSummary(
  project: Project,
  phaseName: ProjectPhase["phaseName"],
  rates: HourlyRate[] = DEFAULT_HOURLY_RATES
): BudgetSummary {
  const tasks = project.Tasks.filter((t) => t.projectPhase === phaseName);
  
  const totalHours = tasks.reduce((sum, task) => {
    return sum + getTaskHours(task);
  }, 0);

  const totalCost = tasks.reduce((sum, task) => {
    return sum + getTaskCost(task, rates);
  }, 0);

  const projectBudget = project.budget || totalCost;
  const percentageUsed = projectBudget > 0 ? (totalCost / projectBudget) * 100 : 0;
  const isOverBudget = totalCost > projectBudget;

  return {
    totalHours,
    totalCost,
    assignedBudget: totalCost,
    reserveBudget: Math.max(projectBudget - totalCost, 0),
    percentageUsed,
    isOverBudget,
  };
}

export function getProjectBudgetSummary(
  project: Project,
  rates: HourlyRate[] = DEFAULT_HOURLY_RATES
): BudgetSummary {
  const allTasks = project.Tasks || [];

  const totalHours = allTasks.reduce((sum, task) => {
    return sum + getTaskHours(task);
  }, 0);

  const totalCost = allTasks.reduce((sum, task) => {
    return sum + getTaskCost(task, rates);
  }, 0);

  const projectBudget = project.budget || totalCost;
  const percentageUsed = projectBudget > 0 ? (totalCost / projectBudget) * 100 : 0;
  const isOverBudget = totalCost > projectBudget;

  return {
    totalHours,
    totalCost,
    assignedBudget: totalCost,
    reserveBudget: Math.max(projectBudget - totalCost, 0),
    percentageUsed,
    isOverBudget,
  };
}