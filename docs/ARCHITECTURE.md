# OnTrack Architecture Guide

## Overview

OnTrack is a project management application with a clean layered architecture, designed for easy migration from mock data to a real backend API.

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Routes     │────▶│    Stores    │────▶│  API Client  │
│  (Pages)     │     │   (State)    │     │  (Interface)  │
└─────────────┘     └──────────────┘     └──────────────┘
       │                    │                     │
       ▼                    ▼                     ▼
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  Components  │     │   Domain     │     │  Mock / HTTP  │
│   (UI)       │     │  (Business)  │     │  (Impl)       │
└─────────────┘     └──────────────┘     └──────────────┘
```

## Layer Descriptions

### 1. Routes (`src/routes/`)

SvelteKit file-based routing. Each route is a page:

| Route          | Purpose                           |
|----------------|-----------------------------------|
| `/`            | Dashboard — portfolio overview    |
| `/login`       | Authentication page               |
| `/projects`    | Project management & CRUD         |
| `/customers`   | Customer directory                |
| `/employees`   | Employee directory & workload     |
| `/tasks`       | Task calendar, work log, chat     |
| `/admin`       | RBAC & user management            |
| `/settings`    | Language & hourly rate settings   |
| `/myprofile`   | Personal profile management       |

### 2. Components (`src/lib/components/`)

Reusable Svelte components, organized by feature area:

- `projects/` — ProjectsTable, ProjectEditorModal, TaskRow, TimelineChart, etc.

Components receive data via `$props()` (Svelte 5 runes) and emit events via callback props.

### 3. Stores (`src/lib/state/`)

Global reactive state using Svelte stores:

| Store                          | Purpose                            |
|--------------------------------|------------------------------------|
| `auth/auth.store.ts`          | Authentication state & session     |
| `user/currentUser.store.ts`   | Current logged-in user profile     |
| `rbac/rbac.store.ts`          | Roles, permissions, derived checks |
| `projects/projects.store.ts`  | Project list (writable store)      |
| `tasks/worklog.store.ts`      | Work log entries                   |
| `notifications/taskNotifications.store.ts` | Task notifications     |

### 4. API Layer (`src/lib/api/`)

The critical abstraction for backend migration:

```
api/
├── types.ts   — ApiClient interface, AuthResult, CompanyEmployee, etc.
├── mock.ts    — Mock implementation (localStorage)
├── index.ts   — Active client export (swap mock ↔ http)
```

**Key design principle**: All data access goes through `api.*()` calls. No component or store directly accesses localStorage for business data.

### 5. Domain (`src/lib/domain/`)

Business logic independent of UI:

- `project/types.ts` — Project, Task, Subtask, Customer, Phase types
- `project/services.ts` — Budget calculations, status derivation
- `project/predicates.ts` — Filter/search predicates
- `project/workflow.ts` — Phase transitions
- `project/hourlyRates.ts` — Rate management logic

### 6. Modules (`src/lib/modules/`)

Feature-specific business logic bridging domain and UI:

- `projects/` — Store, UI helpers, report generation, workflow
- `dashboard/` — Dashboard data aggregation
- `admin/` — Admin-specific business logic
- `user/` — User store re-exports

### 7. Language (`src/lib/language/`)

Internationalization with reactive translations:

- `types.ts` — `Translations` interface (all keys)
- `en.ts` — English translations
- `de.ts` — German translations
- `languageStore.ts` — Reactive `$t` store, `setLanguage()`
- `index.ts` — Exports

## Authentication Flow

```
User visits any page
        │
        ▼
Layout checks authChecked + isAuthenticated
        │
   ┌────┴────┐
   │ No      │ Yes
   ▼         ▼
/login    Show nav + page
   │
   ▼
Submit credentials
   │
   ▼
api.login(username, password)
   │
   ┌────┴────┐
   │ Fail    │ Success
   ▼         ▼
Show error   Set auth stores
             Set currentUser
             Redirect to /
```

### Session Persistence

- `auth_token` — Stored in localStorage, checked via `api.getCurrentSession()`
- `auth_user` — Cached user object in localStorage
- On app load, `checkSession()` runs in `+layout.svelte` `$effect`
- On logout, both keys are cleared and user is redirected to `/login`

## RBAC System

### Roles

| Role            | Description                                      |
|-----------------|--------------------------------------------------|
| Admin           | Full access to all features including admin panel |
| ProjectManager  | Create/edit projects, manage tasks and teams      |
| TeamLead        | View projects, manage tasks, assign team members  |
| Developer       | View projects, edit tasks assigned to them        |
| Viewer          | Read-only access to projects and tasks            |

### Permission Check Flow

```
currentUser (store)
    │
    ▼
employees (rbac store) → find employee by ID → get role
    │
    ▼
roles (rbac store) → find role → get permissions
    │
    ▼
currentPermissions (derived Set<Permission>)
    │
    ▼
hasPermission("admin.access") / watchPermission("projects.edit")
```

## Data Flow Pattern

```
1. Page loads → $effect runs → ensureRbac() / loadData()
2. Store fetches via api.getX() → returns Promise<T[]>
3. Store updates writable → reactive subscribers re-render
4. User action → api.updateX() → store.update() → UI refreshes
```

## Mock Data Architecture

### Seeded Random Generation

All mock data uses a seeded PRNG (seed=42) in `mockupDataRepository.ts` for deterministic, reproducible data across sessions. This generates:

- 10 company employees with German names
- 10 customers with realistic company data
- 50 projects with tasks, subtasks, budgets, timelines

### localStorage Persistence

The mock API stores mutations in localStorage:

| Key                | Data                         |
|--------------------|------------------------------|
| `auth_token`       | Mock session token           |
| `auth_user`        | Authenticated user JSON      |
| `company_employees`| Employee list with roles     |
| `rbac_roles`       | Role definitions             |
| `currentUser`      | Active user profile          |
| `hourlyRates`      | Rate definitions             |

## Styling Conventions

- **Framework**: Tailwind CSS 4
- **Card pattern**: `rounded-3xl border border-gray-200 bg-white p-6 shadow-sm`
- **Buttons**: `rounded-xl px-4 py-2 text-sm font-semibold`
- **Primary color**: `blue-600` (hover: `blue-700`)
- **Danger color**: `red-600`
- **Text hierarchy**: `text-gray-900` (primary), `text-gray-600` (secondary), `text-gray-400` (muted)
- **DaisyUI**: Used only for dropdown positioning (`dropdown dropdown-end`)

## Svelte 5 Patterns

The codebase uses Svelte 5 runes throughout:

```svelte
<!-- Props -->
let { data, onSave } = $props();

<!-- Reactive state -->
let count = $state(0);

<!-- Derived values -->
let doubled = $derived(count * 2);

<!-- Complex derived -->
let filtered = $derived.by(() => {
  return items.filter(i => i.active);
});

<!-- Effects -->
$effect(() => { loadData(); });
```

## Adding a New API Endpoint

1. Add method signature to `ApiClient` interface in `types.ts`
2. Implement mock version in `mock.ts`
3. Create/update the relevant store in `state/`
4. Consume from page/component via store
5. Later: implement HTTP version in `http.ts`
