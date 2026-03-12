<script lang="ts">
  import onTrackCorpFav from "$lib/assets/onTrackCorpFav.png";
  import type {
    Project,
    Customer,
    ProjectPhase,
    Task,
    HourlyRate,
  } from "$lib/modules/projects/contracts";
  import {
    addProject,
    projectList,
  } from "$lib/modules/projects/store";
  import { customerList } from "$lib/modules/projects/dataSource.mock";
  import { loadHourlyRates } from "$lib/modules/projects/rates";
  import {
    ProjectsTable,
    ProjectsToolbar,
    ProjectEditorModal,
    ProjectCurrentViewModal,
  } from "$lib/modules/projects/ui";
  import { toDateOrNull } from "$lib/utils/date";
  import { getPhaseRange, getTaskCost, getAssignedBudget } from "$lib/modules/projects/business";
  import {
    createEmptyProject,
    createEmptyTaskDraft,
    createEmptySubtaskDraft,
    type SubtaskDraftItem,
  } from "$lib/modules/projects/models";
  import { page } from "$app/stores";
  import { t } from "$lib/language";
  import { currentUser } from "$lib/modules/user/store";
  import { filterUserProjects } from "$lib/modules/dashboard/business";

  // State
  let initProject: Project | null = null;
  let selectedProject: Project | null = null;
  let selectedCustomer: Customer | null = null;
  let showCustomerSelect = false;
  let selectedRow: number | null = null;
  let showForm = false;
  let currentProjectView = false;
  let hourlyRates: HourlyRate[] = loadHourlyRates();
  let projectFullTextSearch = "";
  let projectManagerFilter = "";
  let customerFilter = "";
  let customerSearchText = "";
  let lastQueryFromUrl = "";
  let lastNewProjectFromUrl = "";
  let projectManagers: string[] = [];
  let customers: string[] = [];
  let filteredProjects: Project[] = [];
  let filteredCustomerList: Customer[] = [];

  // Task form state
  let newTask = createEmptyTaskDraft();

  // Subtask form state
  let newSubtask = createEmptySubtaskDraft();

  let currentTaskSubtasks: SubtaskDraftItem[] = [];

  // Selected tasks for bulk actions
  let selectedTasks = new Set<number>();

  $: projectManagers = Array.from(
    new Set(
      $projectList
        .map((p) => (p.projectManager || "").trim())
        .filter((v) => v.length > 0),
    ),
  ).sort((a, b) => a.localeCompare(b));

  $: userScopedProjects = filterUserProjects(
    $projectList,
    `${$currentUser.firstName} ${$currentUser.lastName}`,
    $currentUser.customerID,
  );

  $: customers = Array.from(
    new Set(
      $projectList
        .map((p) => (p.customerName || "").trim())
        .filter((v) => v.length > 0),
    ),
  ).sort((a, b) => a.localeCompare(b));

  $: filteredProjects = $projectList.filter((p) => {
    const fullText = projectFullTextSearch.trim().toLowerCase();
    const matchesProjectManager = !projectManagerFilter || p.projectManager === projectManagerFilter;
    const matchesCustomer = !customerFilter || p.customerName === customerFilter;

    if (!matchesProjectManager || !matchesCustomer) return false;
    if (!fullText) return true;

    const haystack = [
      p.title,
      p.customerName,
      p.projectManager,
      String(p.projectID || ""),
      p.projectstatus,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(fullText);
  });

  $: {
    const q = ($page.url.searchParams.get("q") || "").trim();
    if (q !== lastQueryFromUrl) {
      projectFullTextSearch = q;
      lastQueryFromUrl = q;
    }
  }

  $: {
    const newProjectFlag = ($page.url.searchParams.get("new") || "").trim();
    if (newProjectFlag !== lastNewProjectFromUrl) {
      lastNewProjectFromUrl = newProjectFlag;
      if (newProjectFlag === "1" && !showForm) {
        newProject();
      }
    }
  }

  $: filteredCustomerList = customerList.filter((c) => {
    const q = customerSearchText.trim().toLowerCase();
    if (!q) return true;
    return [c.companyName, c.contactName, c.email, c.phone]
      .join(" ")
      .toLowerCase()
      .includes(q);
  });

  $: taskPhaseRange = getPhaseRange(
    initProject,
    (newTask.projectPhase || "") as ProjectPhase["phaseName"] | "",
  );

  // Bidirectional sync: Project start = Initiation start
  $: if (initProject?.startDate && initProject?.initiationPhase[0]) {
    initProject.initiationPhase[0].startDate = initProject.startDate;
  }

  // Bidirectional sync: Project end = Closure end
  $: if (initProject?.dueDate && initProject?.closurePhase[0]) {
    initProject.closurePhase[0].dueDate = initProject.dueDate;
  }

  // Sync Initiation start back to Project start
  $: if (initProject?.initiationPhase[0]?.startDate && initProject) {
    if (initProject.startDate !== initProject.initiationPhase[0].startDate) {
      initProject.startDate = initProject.initiationPhase[0].startDate;
    }
  }

  // Sync Closure end back to Project end
  $: if (initProject?.closurePhase[0]?.dueDate && initProject) {
    if (initProject.dueDate !== initProject.closurePhase[0].dueDate) {
      initProject.dueDate = initProject.closurePhase[0].dueDate;
    }
  }

  // Synchronize phase dates: start date of next phase = due date of previous phase
  $: if (
    initProject?.initiationPhase[0]?.dueDate &&
    initProject?.planingPhase[0]
  ) {
    initProject.planingPhase[0].startDate =
      initProject.initiationPhase[0].dueDate;
  }
  $: if (
    initProject?.planingPhase[0]?.dueDate &&
    initProject?.executionPhase[0]
  ) {
    initProject.executionPhase[0].startDate =
      initProject.planingPhase[0].dueDate;
  }
  $: if (
    initProject?.executionPhase[0]?.dueDate &&
    initProject?.closurePhase[0]
  ) {
    initProject.closurePhase[0].startDate =
      initProject.executionPhase[0].dueDate;
  }

  function setTaskPhase(name: ProjectPhase["phaseName"]) {
    if (!initProject) return;

    newTask.projectPhase = name;
    // passende PhaseId aus deinen Arrays holen:
    const map: Record<ProjectPhase["phaseName"], number | null> = {
      Initiation: initProject.initiationPhase[0]?.phaseid ?? null,
      Planing: initProject.planingPhase[0]?.phaseid ?? null,
      Execution: initProject.executionPhase[0]?.phaseid ?? null,
      Closure: initProject.closurePhase[0]?.phaseid ?? null,
    };

    newTask.phaseid = map[name];

    const { start, end } = getPhaseRange(initProject, name);
    newTask.startDate = start;
    newTask.dueDate = end;
  }

  function newProject() {
    showForm = true;

    const projectId = Date.now();
    initProject = createEmptyProject(projectId);
  }

  function selectCustomer() {
    showCustomerSelect = true;
    customerSearchText = "";
    return selectedCustomer;
  }

  function cancelNewProject() {
    initProject = null;
    showForm = false;
  }

  function addTask() {
    if (!initProject || !newTask.title.trim()) return;

    const taskStart = toDateOrNull(newTask.startDate);
    const taskEnd = toDateOrNull(newTask.dueDate);

    if (!newTask.projectPhase || !taskStart || !taskEnd) return;

    const { start: phaseStartRaw, end: phaseEndRaw } = getPhaseRange(
      initProject,
      newTask.projectPhase as ProjectPhase["phaseName"],
    );
    const phaseStart = toDateOrNull(phaseStartRaw);
    const phaseEnd = toDateOrNull(phaseEndRaw);

    if (phaseStart && taskStart < phaseStart) return;
    if (phaseEnd && taskEnd > phaseEnd) return;
    if (taskStart > taskEnd) return;

    const task: Task = {
      taskID: Date.now(),
      projectID: initProject.projectID || 0,
      title: newTask.title,
      phaseId: newTask.phaseid,
      projectPhase: newTask.projectPhase,
      description: newTask.description,
      status: newTask.status as "Pending",
      assignedTo: newTask.assignedTo,
      dueDate: taskEnd,
      startDate: taskStart,
      notificationSent: false,
      estimatedHours: newTask.estimatedHours,
      hourlyRateType: newTask.hourlyRateType,
      isCritical: newTask.isCritical,
      riskNote: newTask.riskNote,
      subtasks: currentTaskSubtasks,
    };

    if (initProject.budget && initProject.budget > 0) {
      const nextAssignedBudget = getAssignedBudget(initProject, hourlyRates) + getTaskCost(task, hourlyRates);
      if (nextAssignedBudget > initProject.budget) {
        alert($t.messages.budgetExceeded);
        return;
      }
    }

    initProject.Tasks = [...initProject.Tasks, task];

    newTask = createEmptyTaskDraft();

    currentTaskSubtasks = [];
    newSubtask = createEmptySubtaskDraft();
  }

  function removeTask(taskID: number) {
    if (!initProject) return;
    initProject.Tasks = initProject.Tasks.filter((t) => t.taskID !== taskID);
  }

  function addSubtask() {
    if (!newSubtask.title.trim()) return;

    const subtaskStart = toDateOrNull(newSubtask.startDate);
    const subtaskEnd = toDateOrNull(newSubtask.dueDate);
    const taskStart = toDateOrNull(newTask.startDate);
    const taskEnd = toDateOrNull(newTask.dueDate);

    // Validierung: Wenn Daten angegeben, müssen sie innerhalb der Task-Dauer sein
    if (subtaskStart && subtaskEnd) {
      if (subtaskStart > subtaskEnd) return;

      if (taskStart && subtaskStart < taskStart) {
        alert($t.messages.subtaskDateBeforeTask);
        return;
      }
      if (taskEnd && subtaskEnd > taskEnd) {
        alert($t.messages.subtaskDateAfterTask);
        return;
      }
    }

    const subtask = {
      subtaskID: Date.now() + Math.random(),
      taskID: 0, // Will be set when task is created
      title: newSubtask.title,
      description: newSubtask.description,
      status: newSubtask.status as "Pending",
      assignedTo: newSubtask.assignedTo,
      dueDate: subtaskEnd,
      startDate: subtaskStart,
      estimatedHours: newSubtask.estimatedHours,
      hourlyRateType: newSubtask.hourlyRateType,
      isCritical: newSubtask.isCritical,
      riskNote: newSubtask.riskNote,
    };

    currentTaskSubtasks = [...currentTaskSubtasks, subtask];

    newSubtask = createEmptySubtaskDraft();
  }

  function removeSubtask(subtaskID: number | string) {
    currentTaskSubtasks = currentTaskSubtasks.filter(
      (st) => st.subtaskID !== subtaskID,
    );
  }

  function submitNewProject() {
    if (!initProject) return;

    const parsedBudget =
      initProject.budget === null || initProject.budget === 0
        ? null
        : Number(initProject.budget);

    const normalizedProject: Project = {
      ...initProject,
      budget: Number.isNaN(parsedBudget) ? null : parsedBudget,
      startDate: toDateOrNull(initProject.startDate as Date | string | null),
      dueDate: toDateOrNull(initProject.dueDate as Date | string | null),
    };

    if (normalizedProject.budget && normalizedProject.budget > 0) {
      const assignedBudget = getAssignedBudget(normalizedProject, hourlyRates);
      if (assignedBudget > normalizedProject.budget) {
        alert($t.messages.budgetExceeded);
        return;
      }
    }

    showForm = false;
    addProject(normalizedProject);
    initProject = null;
  }

  function formatDate(value: Date | null): string {
    if (!value) return "-";
    return value.toLocaleDateString("de-CH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  function formatHoursValue(value: number | null | undefined): string {
    const n = Number(value || 0);
    return `${n.toFixed(1)}h`;
  }

  function escapeHtml(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function printOutProjectState() {
    if (!selectedProject) return;

    const project = selectedProject;
    const tasks = project.Tasks || [];
    const subtasks = tasks.flatMap((task) => task.subtasks || []);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const statusCounts = {
      Pending: tasks.filter((task) => task.status === "Pending").length,
      ToDo: tasks.filter((task) => task.status === "To Do").length,
      InProgress: tasks.filter((task) => task.status === "In Progress").length,
      Done: tasks.filter((task) => task.status === "Done").length,
    };

    const subtaskStatusCounts = {
      Pending: subtasks.filter((subtask) => subtask.status === "Pending").length,
      ToDo: subtasks.filter((subtask) => subtask.status === "To Do").length,
      InProgress: subtasks.filter((subtask) => subtask.status === "In Progress").length,
      Done: subtasks.filter((subtask) => subtask.status === "Done").length,
    };

    const assignedBudget = getAssignedBudget(project, hourlyRates);
    const budget = project.budget || 0;
    const reserve = budget - assignedBudget;
    const budgetUsagePct = budget > 0 ? Math.min(100, (assignedBudget / budget) * 100) : 0;

    const criticalTasks = [...tasks]
      .filter((task) => task.status !== "Done")
      .sort((a, b) => {
        const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        const aOverdue = a.dueDate ? new Date(a.dueDate).getTime() < now.getTime() : false;
        const bOverdue = b.dueDate ? new Date(b.dueDate).getTime() < now.getTime() : false;
        if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;
        if (aDue !== bDue) return aDue - bDue;
        return (b.estimatedHours || 0) - (a.estimatedHours || 0);
      })
      .slice(0, 3);

    const milestones = [...tasks]
      .map((task) => {
        const due = task.dueDate ? new Date(task.dueDate) : null;
        let state: "reached" | "critical" | "shifted" = "critical";
        if (task.status === "Done") state = "reached";
        else if (due && due.getTime() < now.getTime()) state = "shifted";
        else state = "critical";
        return {
          title: task.title,
          due,
          state,
          phase: task.projectPhase || "Unassigned",
        };
      })
      .sort((a, b) => {
        const ad = a.due ? a.due.getTime() : Number.MAX_SAFE_INTEGER;
        const bd = b.due ? b.due.getTime() : Number.MAX_SAFE_INTEGER;
        return ad - bd;
      })
      .slice(0, 8);

    const overdueTaskCount = tasks.filter((task) => task.status !== "Done" && task.dueDate && new Date(task.dueDate) < now).length;
    const dueSoonTaskCount = tasks.filter((task) => {
      if (task.status === "Done" || !task.dueDate) return false;
      const due = new Date(task.dueDate);
      const in7 = new Date(now);
      in7.setDate(in7.getDate() + 7);
      return due >= now && due <= in7;
    }).length;

    const completionPct = tasks.length > 0 ? (statusCounts.Done / tasks.length) * 100 : 0;
    const timelineRisk = overdueTaskCount > 0 ? "high" : dueSoonTaskCount > 2 ? "medium" : "low";
    const budgetRisk = budgetUsagePct > 95 ? "high" : budgetUsagePct > 80 ? "medium" : "low";
    const deliveryRisk = completionPct < 40 && statusCounts.InProgress > 0 ? "medium" : completionPct >= 70 ? "low" : "medium";
    const qualityRisk = subtaskStatusCounts.Pending > subtaskStatusCounts.Done ? "medium" : "low";

    const riskItems: Array<{ title: string; impact: string; probability: string; action: string }> = [];
    if (timelineRisk !== "low") {
      riskItems.push({
        title: "Timeline pressure from open due tasks",
        impact: timelineRisk === "high" ? "High" : "Medium",
        probability: timelineRisk === "high" ? "High" : "Medium",
        action: "Prioritize overdue and due-soon tasks, run weekly readiness checks.",
      });
    }
    if (budgetRisk !== "low") {
      riskItems.push({
        title: "Budget consumption trend",
        impact: budgetRisk === "high" ? "High" : "Medium",
        probability: budgetRisk === "high" ? "High" : "Medium",
        action: "Re-plan work packages, validate scope and reserve usage.",
      });
    }
    if (deliveryRisk !== "low") {
      riskItems.push({
        title: "Delivery throughput uncertainty",
        impact: "Medium",
        probability: "Medium",
        action: "Increase execution focus on top blockers and cross-team dependencies.",
      });
    }
    if (qualityRisk !== "low") {
      riskItems.push({
        title: "Quality gates at risk",
        impact: "Medium",
        probability: "Medium",
        action: "Shift effort to testing and acceptance criteria completion.",
      });
    }

    if (riskItems.length === 0) {
      riskItems.push({
        title: "No material risks currently escalated",
        impact: "Low",
        probability: "Low",
        action: "Continue current cadence and monitoring.",
      });
    }

    const decisionItems: string[] = [];
    if (budgetRisk === "high") decisionItems.push("Approve budget adjustment or descoping options for next phase.");
    if (timelineRisk === "high") decisionItems.push("Confirm timeline trade-offs and resource reinforcement.");
    if (statusCounts.Pending > statusCounts.Done) decisionItems.push("Support removal of blockers for pending task clusters.");
    if (decisionItems.length === 0) decisionItems.push("No urgent management decision required at this reporting cycle.");

    const totalTaskCount = Math.max(1, tasks.length);
    const taskDonePct = (statusCounts.Done / totalTaskCount) * 100;
    const taskInProgressPct = (statusCounts.InProgress / totalTaskCount) * 100;
    const taskToDoPct = (statusCounts.ToDo / totalTaskCount) * 100;
    const taskPendingPct = (statusCounts.Pending / totalTaskCount) * 100;

    const makeBar = (label: string, count: number, total: number, color: string) => {
      const pct = total > 0 ? (count / total) * 100 : 0;
      return `
        <div class="bar-row">
          <div class="bar-head">
            <span>${label}</span>
            <span>${count} (${pct.toFixed(0)}%)</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill" style="width:${pct}%; background:${color}"></div>
          </div>
        </div>
      `;
    };

    const taskBarsHtml = [
      makeBar("Pending", statusCounts.Pending, tasks.length, "#6b7280"),
      makeBar("To Do", statusCounts.ToDo, tasks.length, "#3b82f6"),
      makeBar("In Progress", statusCounts.InProgress, tasks.length, "#f59e0b"),
      makeBar("Done", statusCounts.Done, tasks.length, "#10b981"),
    ].join("");

    const subtaskBarsHtml = [
      makeBar("Pending", subtaskStatusCounts.Pending, subtasks.length, "#6b7280"),
      makeBar("To Do", subtaskStatusCounts.ToDo, subtasks.length, "#3b82f6"),
      makeBar("In Progress", subtaskStatusCounts.InProgress, subtasks.length, "#f59e0b"),
      makeBar("Done", subtaskStatusCounts.Done, subtasks.length, "#10b981"),
    ].join("");

    const tasksByPhase = tasks.reduce<Record<string, typeof tasks>>((acc, task) => {
      const phase = task.projectPhase || "Unassigned";
      if (!acc[phase]) acc[phase] = [];
      acc[phase].push(task);
      return acc;
    }, {});

    const phaseTablesHtml = Object.entries(tasksByPhase)
      .map(([phase, phaseTasks]) => {
        const rowsHtml = phaseTasks
          .map((task) => {
            const subtasksHtml = (task.subtasks || [])
              .map(
                (subtask) => `
                <tr class="subtask-row">
                  <td class="subtask">- ${escapeHtml(subtask.title)}</td>
                  <td>${escapeHtml(subtask.status)}</td>
                  <td>${escapeHtml(subtask.assignedTo || "-")}</td>
                  <td>${formatDate(subtask.startDate)}</td>
                  <td>${formatDate(subtask.dueDate)}</td>
                  <td>${formatHoursValue(subtask.estimatedHours)}</td>
                </tr>`,
              )
              .join("");

            return `
              <tr>
                <td><strong>${escapeHtml(task.title)}</strong></td>
                <td>${escapeHtml(task.status)}</td>
                <td>${escapeHtml(task.assignedTo || "-")}</td>
                <td>${formatDate(task.startDate)}</td>
                <td>${formatDate(task.dueDate)}</td>
                <td>${formatHoursValue(task.estimatedHours)}</td>
              </tr>
              ${subtasksHtml}`;
          })
          .join("");

        return `
          <h3 class="phase-title">Phase: ${escapeHtml(phase)}</h3>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Start</th>
                <th>Due</th>
                <th>Hours</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        `;
      })
      .join("");

    const ragClass = (value: "low" | "medium" | "high") => (value === "high" ? "bad" : value === "medium" ? "warn" : "good");

    const summaryLines = [
      `Project is currently in ${escapeHtml(project.projectstatus || "Execution")} with completion at ${completionPct.toFixed(0)}%.`,
      `Budget utilization stands at ${budgetUsagePct.toFixed(1)}% with reserve ${reserve.toLocaleString()}.`,
      `${overdueTaskCount} overdue and ${dueSoonTaskCount} due-soon tasks require focused delivery management.`,
      `Primary next milestone actions are testing readiness, dependency closure and go-live preparation.`
    ];

    const criticalTasksHtml = criticalTasks.length > 0
      ? criticalTasks
        .map((task) => `<li><strong>${escapeHtml(task.title)}</strong> (${escapeHtml(task.status)}) - Due ${formatDate(task.dueDate)}</li>`)
        .join("")
      : "<li>No critical tasks currently identified.</li>";

    const milestoneHtml = milestones
      .map((m) => {
        const badge = m.state === "reached" ? "good" : m.state === "critical" ? "warn" : "bad";
        return `
          <li>
            <span class="pill ${badge}">${m.state.toUpperCase()}</span>
            <strong>${escapeHtml(m.title)}</strong> (${escapeHtml(m.phase)}) - ${m.due ? formatDate(m.due) : "-"}
          </li>`;
      })
      .join("");

    const reportHtml = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Project Report - ${escapeHtml(project.title)}</title>
          <style>
            :root {
              --slate-900: #0f172a;
              --slate-700: #334155;
              --slate-500: #64748b;
              --slate-200: #e2e8f0;
              --blue-600: #2563eb;
              --emerald-500: #10b981;
              --amber-500: #f59e0b;
              --rose-500: #f43f5e;
            }
            * { box-sizing: border-box; }
            body {
              font-family: "Segoe UI", Arial, sans-serif;
              color: var(--slate-900);
              background: #f8fafc;
              margin: 0;
              padding: 24px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .page {
              background: white;
              border: 1px solid var(--slate-200);
              border-radius: 16px;
              overflow: hidden;
            }
            .hero {
              padding: 18px 24px;
              background: #f8fafc;
              border-bottom: 1px solid var(--slate-200);
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 18px;
            }
            .hero-left {
              display: flex;
              align-items: center;
              gap: 14px;
              min-width: 0;
            }
            .brand-logo {
              width: 44px;
              height: 44px;
              border-radius: 10px;
              border: 1px solid var(--slate-200);
              background: white;
              object-fit: contain;
              padding: 6px;
            }
            .hero h1 { margin: 0; font-size: 26px; line-height: 1.1; }
            .hero p { margin: 6px 0 0; color: var(--slate-700); font-size: 13px; }
            .brand-tag {
              font-size: 11px;
              color: var(--blue-600);
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: .12em;
            }
            .section { padding: 18px 24px; }
            .section h2 { margin: 0 0 10px; font-size: 17px; }
            .section p.interpret { margin: 6px 0 0; color: var(--slate-700); font-size: 13px; }
            .kpi-grid {
              display: grid;
              grid-template-columns: repeat(4, minmax(0, 1fr));
              gap: 10px;
            }
            .kpi {
              border: 1px solid var(--slate-200);
              border-radius: 12px;
              padding: 10px;
              background: #fff;
            }
            .kpi-label { font-size: 11px; color: var(--slate-500); text-transform: uppercase; letter-spacing: .08em; }
            .kpi-value { font-size: 20px; font-weight: 700; margin-top: 6px; }
            .grid2 {
              display: grid;
              grid-template-columns: 1.2fr 1fr;
              gap: 14px;
            }
            .panel {
              border: 1px solid var(--slate-200);
              border-radius: 12px;
              padding: 12px;
              background: white;
            }
            .bar-row { margin-bottom: 8px; }
            .bar-head { display: flex; justify-content: space-between; font-size: 12px; color: var(--slate-700); margin-bottom: 4px; }
            .bar-track { height: 9px; border-radius: 999px; background: #eef2f7; overflow: hidden; }
            .bar-fill { height: 100%; border-radius: 999px; }
            .donut-wrap { display: flex; align-items: center; gap: 12px; }
            .donut {
              width: 110px;
              height: 110px;
              border-radius: 50%;
              background: conic-gradient(
                #10b981 0 ${taskDonePct.toFixed(2)}%,
                #f59e0b ${taskDonePct.toFixed(2)}% ${(taskDonePct + taskInProgressPct).toFixed(2)}%,
                #3b82f6 ${(taskDonePct + taskInProgressPct).toFixed(2)}% ${(taskDonePct + taskInProgressPct + taskToDoPct).toFixed(2)}%,
                #6b7280 ${(taskDonePct + taskInProgressPct + taskToDoPct).toFixed(2)}% 100%
              );
              position: relative;
            }
            .donut::after {
              content: "";
              position: absolute;
              inset: 18px;
              border-radius: 50%;
              background: white;
            }
            .donut-center {
              position: absolute;
              inset: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 1;
              font-weight: 700;
              font-size: 18px;
            }
            .legend { font-size: 12px; color: var(--slate-700); }
            .legend div { margin-bottom: 4px; }
            .dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid var(--slate-200); padding: 8px; text-align: left; font-size: 12px; }
            th { background: #f1f5f9; }
            .subtask-row td { background: #f8fafc; color: #334155; }
            .subtask { padding-left: 18px; }
            .pill {
              display: inline-block;
              border-radius: 999px;
              padding: 2px 8px;
              font-size: 11px;
              font-weight: 600;
            }
            .list { margin: 0; padding-left: 18px; }
            .list li { margin: 5px 0; font-size: 13px; color: var(--slate-800); }
            .phase-title {
              margin: 16px 0 8px;
              font-size: 14px;
              color: var(--slate-700);
              border-left: 3px solid #93c5fd;
              padding-left: 8px;
            }
            .good { background: #dcfce7; color: #166534; }
            .warn { background: #fef3c7; color: #92400e; }
            .bad { background: #ffe4e6; color: #9f1239; }
            @media print { body { padding: 0; background: white; } .page { border: none; border-radius: 0; } }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="hero">
              <div class="hero-left">
                <img src="${onTrackCorpFav}" alt="OnTrack" class="brand-logo" />
                <div>
                  <div class="brand-tag">OnTrack Project Report</div>
                  <h1>Project State Report</h1>
                  <p><strong>${escapeHtml(project.title)}</strong> | Customer: ${escapeHtml(project.customerName || "-")} | Generated: ${new Date().toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div class="section">
              <h2>Executive Summary</h2>
              <ul class="list">
                ${summaryLines.map((line) => `<li>${line}</li>`).join("")}
              </ul>
            </div>

            <div class="section">
              <div class="kpi-grid">
                <div class="kpi"><div class="kpi-label">Project ID</div><div class="kpi-value">${project.projectID ?? "-"}</div></div>
                <div class="kpi"><div class="kpi-label">Project Manager</div><div class="kpi-value">${escapeHtml(project.projectManager || "-")}</div></div>
                <div class="kpi"><div class="kpi-label">Timeline</div><div class="kpi-value" style="font-size:14px">${formatDate(project.startDate)} - ${formatDate(project.dueDate)}</div></div>
                <div class="kpi"><div class="kpi-label">Status</div><div class="kpi-value"><span class="pill ${project.projectstatus === "Execution" ? "warn" : project.projectstatus === "Closed" ? "good" : "bad"}">${escapeHtml(project.projectstatus || "-")}</span></div></div>
              </div>
            </div>

            <div class="section">
              <h2>Budget Overview</h2>
              <p class="interpret">Interpretation: Budget trend is ${budgetUsagePct > 95 ? "critical" : budgetUsagePct > 80 ? "under observation" : "within expected range"} and should be reviewed against remaining scope.</p>
              <div class="grid2">
                <div class="panel">
                  <div class="bar-head"><span>Budget Usage</span><strong>${budgetUsagePct.toFixed(1)}%</strong></div>
                  <div class="bar-track"><div class="bar-fill" style="width:${budgetUsagePct}%; background:${budgetUsagePct > 100 ? "#f43f5e" : "#2563eb"}"></div></div>
                  <div class="kpi-grid" style="margin-top:12px; grid-template-columns: repeat(3, minmax(0, 1fr));">
                    <div class="kpi"><div class="kpi-label">Total</div><div class="kpi-value" style="font-size:16px">${budget.toLocaleString()}</div></div>
                    <div class="kpi"><div class="kpi-label">Assigned</div><div class="kpi-value" style="font-size:16px">${assignedBudget.toLocaleString()}</div></div>
                    <div class="kpi"><div class="kpi-label">Reserve</div><div class="kpi-value" style="font-size:16px">${reserve.toLocaleString()}</div></div>
                  </div>
                </div>
                <div class="panel donut-wrap">
                  <div style="position:relative">
                    <div class="donut"></div>
                    <div class="donut-center">${taskDonePct.toFixed(0)}%</div>
                  </div>
                  <div class="legend">
                    <div><span class="dot" style="background:#10b981"></span>Done</div>
                    <div><span class="dot" style="background:#f59e0b"></span>In Progress</div>
                    <div><span class="dot" style="background:#3b82f6"></span>To Do</div>
                    <div><span class="dot" style="background:#6b7280"></span>Pending</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="section">
              <h2>Status Breakdown</h2>
              <p class="interpret">Interpretation: Delivery status indicates focus should remain on reducing pending and overdue items while keeping execution throughput stable.</p>
              <div class="grid2">
                <div class="panel">
                  <h3 style="margin:0 0 8px; font-size:14px; color:#334155">Tasks (${tasks.length})</h3>
                  ${taskBarsHtml}
                </div>
                <div class="panel">
                  <h3 style="margin:0 0 8px; font-size:14px; color:#334155">Subtasks (${subtasks.length})</h3>
                  ${subtaskBarsHtml}
                </div>
              </div>
            </div>

            <div class="section">
              <h2>RAG Status (Ampellogik)</h2>
              <div class="kpi-grid">
                <div class="kpi"><div class="kpi-label">Budget</div><div class="kpi-value"><span class="pill ${ragClass(budgetRisk)}">${budgetRisk.toUpperCase()}</span></div></div>
                <div class="kpi"><div class="kpi-label">Timeline</div><div class="kpi-value"><span class="pill ${ragClass(timelineRisk)}">${timelineRisk.toUpperCase()}</span></div></div>
                <div class="kpi"><div class="kpi-label">Delivery</div><div class="kpi-value"><span class="pill ${ragClass(deliveryRisk)}">${deliveryRisk.toUpperCase()}</span></div></div>
                <div class="kpi"><div class="kpi-label">Quality</div><div class="kpi-value"><span class="pill ${ragClass(qualityRisk)}">${qualityRisk.toUpperCase()}</span></div></div>
              </div>
            </div>

            <div class="section">
              <h2>Top 3 Critical Tasks</h2>
              <ul class="list">${criticalTasksHtml}</ul>
            </div>

            <div class="section">
              <h2>Milestones</h2>
              <ul class="list">${milestoneHtml}</ul>
            </div>

            <div class="section">
              <h2>Risks & Issues</h2>
              <table>
                <thead>
                  <tr>
                    <th>Risk / Issue</th>
                    <th>Impact</th>
                    <th>Probability</th>
                    <th>Mitigation</th>
                  </tr>
                </thead>
                <tbody>
                  ${riskItems
                    .map(
                      (r) => `
                        <tr>
                          <td>${escapeHtml(r.title)}</td>
                          <td>${escapeHtml(r.impact)}</td>
                          <td>${escapeHtml(r.probability)}</td>
                          <td>${escapeHtml(r.action)}</td>
                        </tr>`,
                    )
                    .join("")}
                </tbody>
              </table>
            </div>

            <div class="section">
              <h2>Decisions / Requests</h2>
              <ul class="list">${decisionItems.map((d) => `<li>${escapeHtml(d)}</li>`).join("")}</ul>
            </div>

            <div class="section">
              <h2>Tasks & Subtasks by Phase</h2>
              <p class="interpret">Interpretation: Grouped by delivery phase to make progression and bottlenecks visible at a glance.</p>
              ${phaseTablesHtml}
            </div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank", "width=1000,height=900");
    if (!printWindow) {
      alert("Unable to open print window. Please allow popups.");
      return;
    }

    printWindow.document.open();
    printWindow.document.write(reportHtml);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  function showCurrentProject() {
    if (!selectedProject) return;

    currentProjectView = true;
  }

  function handleRowSelect(
    event: CustomEvent<{ index: number; project: Project }>,
  ) {
    const {
      detail: { index, project },
    } = event;
    const isSameRow = selectedRow === index;

    selectedRow = isSameRow ? null : index;
    selectedProject = isSameRow
      ? null
      : {
          title: project.title,
          customerID: project.customerID,
          customerName: project.customerName,
          budget: project.budget,
          dueDate: project.dueDate,
          startDate: project.startDate,
          projectID: project.projectID,
          projectManager: project.projectManager,
          projectstatus: project.projectstatus,
          Tasks: project.Tasks,
          initiationPhase: project.initiationPhase,
          planingPhase: project.planingPhase,
          executionPhase: project.executionPhase,
          closurePhase: project.closurePhase,
        };
  }

  function editTask(taskID: number) {
    if (!initProject) return;

    const task = initProject.Tasks.find((t) => t.taskID === taskID);
    if (!task) return;

    // Load task data into form
    newTask = {
      title: task.title,
      description: task.description || "",
      status: task.status,
      assignedTo: task.assignedTo || "",
      phaseid: task.phaseId,
      projectPhase: task.projectPhase || "",
      dueDate: task.dueDate ? task.dueDate.toISOString().split("T")[0] : null,
      startDate: task.startDate
        ? task.startDate.toISOString().split("T")[0]
        : null,
      estimatedHours: task.estimatedHours,
      hourlyRateType: task.hourlyRateType,
      isCritical: Boolean(task.isCritical),
      riskNote: task.riskNote || "",
    };

    // Load subtasks
    currentTaskSubtasks = task.subtasks || [];

    // Remove the task from the list (it will be re-added when user clicks "Add Task")
    removeTask(taskID);
  }

  function toggleTaskSelection(taskID: number) {
    if (selectedTasks.has(taskID)) {
      selectedTasks.delete(taskID);
    } else {
      selectedTasks.add(taskID);
    }
    selectedTasks = selectedTasks; // Trigger reactivity
  }

  function toggleSelectAll() {
    if (!initProject) return;

    if (selectedTasks.size === initProject.Tasks.length) {
      selectedTasks.clear();
    } else {
      selectedTasks = new Set(initProject.Tasks.map((t) => t.taskID));
    }
    selectedTasks = selectedTasks; // Trigger reactivity
  }

  function deleteSelectedTasks() {
    if (!initProject || selectedTasks.size === 0) return;

    initProject.Tasks = initProject.Tasks.filter(
      (t) => !selectedTasks.has(t.taskID),
    );
    selectedTasks.clear();
    selectedTasks = selectedTasks; // Trigger reactivity
  }
</script>

<div class="min-h-screen bg-gray-50 font-sans">
  <div class="mx-auto flex max-w-7xl flex-col gap-6 p-6">
<ProjectsToolbar
  projects={filteredProjects}
  allProjects={userScopedProjects}
  totalAllProjects={$projectList}
  {selectedProject}
  bind:fullTextSearch={projectFullTextSearch}
  bind:projectManagerFilter={projectManagerFilter}
  bind:customerFilter={customerFilter}
  {projectManagers}
  {customers}
  on:newProject={newProject}
  on:printProjectState={printOutProjectState}
  on:modifyProject={() => {
    /* modifyProject */
  }}
  on:showCurrentProject={showCurrentProject}
/>

<ProjectsTable
  projects={filteredProjects}
  {selectedRow}
  {hourlyRates}
  on:rowSelect={handleRowSelect}
/>

{#if currentProjectView}
  <ProjectCurrentViewModal
    {selectedProject}
    {hourlyRates}
    closeCurrentProject={() => (currentProjectView = false)}
  />
{/if}

{#if showForm}
  <ProjectEditorModal
    {initProject}
    bind:showCustomerSelect
    bind:customerSearchText
    {filteredCustomerList}
    bind:newTask
    bind:newSubtask
    bind:currentTaskSubtasks
    bind:selectedTasks
    {hourlyRates}
    {taskPhaseRange}
    {selectCustomer}
    {setTaskPhase}
    {addSubtask}
    {removeSubtask}
    {addTask}
    {toggleSelectAll}
    {toggleTaskSelection}
    {editTask}
    {removeTask}
    {deleteSelectedTasks}
    {submitNewProject}
    {cancelNewProject}
  />
{/if}
</div>
</div>
