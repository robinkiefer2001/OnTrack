# OnTrack API Reference

This document describes the `ApiClient` interface that defines all data operations in OnTrack. The current implementation uses a mock client with localStorage persistence. When connecting a real backend, implement this same interface with HTTP calls.

## Interface Location

```
frontend/src/lib/api/types.ts    — TypeScript interface & types
frontend/src/lib/api/mock.ts     — Mock implementation (localStorage)
frontend/src/lib/api/index.ts    — Active client export
```

---

## Authentication

### `login(username, password)`

Authenticate a user and establish a session.

- **Parameters**:
  - `username: string` — Username in `firstname.lastname` format (case-insensitive)
  - `password: string` — User password
- **Returns**: `Promise<AuthResult>`
- **AuthResult**:
  ```ts
  {
    success: boolean;
    token?: string;       // Session token (for Authorization header)
    user?: CompanyEmployee;
    error?: string;       // Human-readable error message
  }
  ```
- **Backend endpoint**: `POST /api/auth/login`
- **Request body**: `{ username: string, password: string }`
- **Response**: `{ success, token, user, error }`

### `logout()`

End the current session.

- **Returns**: `Promise<void>`
- **Backend endpoint**: `POST /api/auth/logout`
- **Headers**: `Authorization: Bearer <token>`

### `getCurrentSession()`

Check if a valid session exists and return the authenticated user.

- **Returns**: `Promise<CompanyEmployee | null>`
- **Backend endpoint**: `GET /api/auth/session`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `CompanyEmployee` or `null` (401 if expired)

---

## Employees

### `getEmployees()`

Retrieve all company employees.

- **Returns**: `Promise<CompanyEmployee[]>`
- **Backend endpoint**: `GET /api/employees`
- **CompanyEmployee**:
  ```ts
  {
    employeeID: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    jobTitle: string;
    department: string;
    role: RoleName;  // "Admin" | "ProjectManager" | "TeamLead" | "Developer" | "Viewer"
  }
  ```

### `addEmployee(employee)`

Create a new employee.

- **Parameters**: `Omit<CompanyEmployee, "employeeID">` — All fields except ID
- **Returns**: `Promise<CompanyEmployee>` — Created employee with generated ID
- **Backend endpoint**: `POST /api/employees`
- **Request body**: Employee fields (without employeeID)

### `updateEmployee(employeeID, patch)`

Update an existing employee.

- **Parameters**:
  - `employeeID: number`
  - `patch: Partial<CompanyEmployee>` — Fields to update
- **Returns**: `Promise<CompanyEmployee>` — Updated employee
- **Backend endpoint**: `PATCH /api/employees/:id`
- **Request body**: Partial employee fields

### `deleteEmployee(employeeID)`

Delete an employee.

- **Parameters**: `employeeID: number`
- **Returns**: `Promise<void>`
- **Backend endpoint**: `DELETE /api/employees/:id`

---

## Projects

### `getProjects()`

Retrieve all projects with their tasks, subtasks, and metadata.

- **Returns**: `Promise<Project[]>`
- **Backend endpoint**: `GET /api/projects`
- **Project** (key fields):
  ```ts
  {
    projectID: number;
    title: string;
    description: string;
    projectManager: string;
    budget: number;
    totalHoursPool: number;
    startDate: string;         // ISO date
    dueDate: string;           // ISO date
    currentPhase: string;      // "Initiation" | "Planning" | "Execution" | "Closure"
    status: string;
    customer: Customer;
    Tasks: Task[];
    phases: Phase[];
    teamMembers: string[];
    hourlyRateType: string;
  }
  ```

### `addProject(project)`

Create a new project.

- **Parameters**: `Project` — Full project object
- **Returns**: `Promise<Project>`
- **Backend endpoint**: `POST /api/projects`

### `updateProject(project)`

Update an existing project (including its tasks and subtasks).

- **Parameters**: `Project` — Full project object with changes
- **Returns**: `Promise<Project>`
- **Backend endpoint**: `PUT /api/projects/:id`

---

## Customers

### `getCustomers()`

Retrieve all customer records.

- **Returns**: `Promise<Customer[]>`
- **Backend endpoint**: `GET /api/customers`
- **Customer**:
  ```ts
  {
    customerID: number;
    companyName: string;
    contactName: string;
    email: string;
    phone: string;
    address: string;
    employees: CustomerEmployee[];
  }
  ```

---

## Roles & RBAC

### `getRoles()`

Retrieve all role definitions with their permissions.

- **Returns**: `Promise<RoleDefinition[]>`
- **Backend endpoint**: `GET /api/roles`
- **RoleDefinition**:
  ```ts
  {
    name: RoleName;
    permissions: Permission[];
  }
  ```
- **RoleName**: `"Admin" | "ProjectManager" | "TeamLead" | "Developer" | "Viewer"`
- **Permission** (16 values):
  ```
  projects.create, projects.edit, projects.delete, projects.view, projects.assign_team
  tasks.create, tasks.edit, tasks.delete, tasks.view
  users.create, users.edit, users.delete, users.view
  roles.manage, rates.manage, admin.access
  ```

### `updateRole(role)`

Update a role's permission set.

- **Parameters**: `RoleDefinition` — Role with updated permissions
- **Returns**: `Promise<RoleDefinition>`
- **Backend endpoint**: `PUT /api/roles/:name`

---

## Hourly Rates

### `getHourlyRates()`

Retrieve all hourly rate definitions.

- **Returns**: `Promise<HourlyRate[]>`
- **Backend endpoint**: `GET /api/hourly-rates`
- **HourlyRate**:
  ```ts
  {
    id: string;
    name: string;
    rate: number;
    isDefault: boolean;
  }
  ```

### `saveHourlyRates(rates)`

Replace all hourly rate definitions.

- **Parameters**: `HourlyRate[]` — Complete list of rates
- **Returns**: `Promise<void>`
- **Backend endpoint**: `PUT /api/hourly-rates`

---

## Backend Implementation Guide

When implementing the real backend, follow this pattern:

1. Create a new file `frontend/src/lib/api/http.ts`
2. Implement the `ApiClient` interface using `fetch()` (or Axios, etc.)
3. Add the base URL configuration (environment variable)
4. Swap the export in `frontend/src/lib/api/index.ts`:

```ts
// frontend/src/lib/api/http.ts
import type { ApiClient, AuthResult, CompanyEmployee } from "$lib/api/types";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getToken(): string | null {
  return localStorage.getItem("auth_token");
}

function headers(): HeadersInit {
  const h: HeadersInit = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

export const httpApiClient: ApiClient = {
  async login(username, password) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    return res.json();
  },

  async logout() {
    await fetch(`${BASE_URL}/auth/logout`, {
      method: "POST",
      headers: headers(),
    });
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  },

  async getCurrentSession() {
    const res = await fetch(`${BASE_URL}/auth/session`, { headers: headers() });
    if (!res.ok) return null;
    return res.json();
  },

  async getEmployees() {
    const res = await fetch(`${BASE_URL}/employees`, { headers: headers() });
    return res.json();
  },

  // ... implement remaining methods following the same pattern
};
```

Then update the export:

```ts
// frontend/src/lib/api/index.ts
import { httpApiClient } from "$lib/api/http";
export const api: ApiClient = httpApiClient;
```

## Error Handling

The mock implementation throws errors for invalid operations (e.g. updating a non-existent employee). The real backend should return appropriate HTTP status codes:

| Status | Meaning                    |
|--------|----------------------------|
| 200    | Success                    |
| 201    | Created                    |
| 400    | Bad request / validation   |
| 401    | Unauthorized (no/expired token) |
| 403    | Forbidden (insufficient permissions) |
| 404    | Resource not found         |
| 500    | Internal server error      |

The frontend auth guard in `+layout.svelte` redirects to `/login` on 401 responses.
