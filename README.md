# OnTrack — Project Management Platform

OnTrack is a full-featured project management application built with **SvelteKit** (Svelte 5) and designed for seamless migration from mock data to a real backend API.

## Quick Start

```sh
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Development Credentials

All mock users share the password **`1234`**. Usernames follow the pattern `firstname.lastname` (lowercase):

| Username             | Name              | Role            | Department |
|----------------------|-------------------|-----------------|------------|
| michael.mueller      | Michael Mueller   | Admin           | IT         |
| sandra.schmidt       | Sandra Schmidt    | ProjectManager  | Finance    |
| thomas.weber         | Thomas Weber      | Developer       | Operations |
| claudia.keller       | Claudia Keller    | Developer       | Sales      |
| stefan.schneider     | Stefan Schneider  | Developer       | Development|
| angela.fischer       | Angela Fischer    | ProjectManager  | IT         |
| peter.bauer          | Peter Bauer       | ProjectManager  | Finance    |
| daniela.wolf         | Daniela Wolf      | TeamLead        | Operations |
| klaus.meyer          | Klaus Meyer       | Developer       | Sales      |
| martina.hoffmann     | Martina Hoffmann  | Developer       | Development|

## Project Structure

```
OnTrack/
├── frontend/               # SvelteKit application
│   ├── src/
│   │   ├── lib/
│   │   │   ├── api/        # API abstraction layer (types, mock, index)
│   │   │   ├── assets/     # Static assets (logos, images)
│   │   │   ├── components/ # Reusable UI components
│   │   │   ├── data/mock/  # Mock data generation (seeded PRNG)
│   │   │   ├── domain/     # Business domain logic
│   │   │   ├── language/   # i18n (English & German)
│   │   │   ├── modules/    # Feature modules (projects, dashboard, user, admin)
│   │   │   ├── state/      # Global state stores (auth, RBAC, user, notifications)
│   │   │   └── utils/      # Utility functions (date, format)
│   │   └── routes/         # SvelteKit routes (pages)
│   └── static/             # Public static files
├── backend/                # Python backend (Flask) — placeholder
└── docs/                   # Documentation (API reference, architecture)
```

## Architecture

### API Abstraction Layer

All data access goes through the `ApiClient` interface defined in `frontend/src/lib/api/types.ts`. The current implementation (`mock.ts`) uses localStorage for persistence. To connect a real backend, implement the same `ApiClient` interface with HTTP calls and swap the export in `api/index.ts`.

```ts
// frontend/src/lib/api/index.ts
import { mockApiClient } from "$lib/api/mock";
export const api: ApiClient = mockApiClient;
// Replace with: export const api: ApiClient = httpApiClient;
```

### Authentication

- Auth state managed in `$lib/state/auth/auth.store.ts`
- Login/logout/session-check via `ApiClient.login()`, `.logout()`, `.getCurrentSession()`
- Layout guards redirect unauthenticated users to `/login`
- Mock implementation stores sessions in localStorage with a token pattern

### RBAC (Role-Based Access Control)

- 5 roles: Admin, ProjectManager, TeamLead, Developer, Viewer
- 16 granular permissions (projects.create, tasks.edit, admin.access, etc.)
- Managed via `$lib/state/rbac/rbac.store.ts`
- Admin panel for role/permission management at `/admin`

### Internationalization

- Two languages: English (`en.ts`) and German (`de.ts`)
- Reactive `$t` store from `$lib/language`
- All UI strings go through the translation layer

## Documentation

See the [docs/](docs/) folder for:
- [API Reference](docs/API.md) — Full endpoint specification
- [Architecture Guide](docs/ARCHITECTURE.md) — System design and patterns
- [User Manual](docs/USER_MANUAL.md) — End-user documentation

## Tech Stack

- **Frontend**: SvelteKit 2, Svelte 5 (runes), TypeScript
- **Styling**: Tailwind CSS 4, DaisyUI (dropdowns)
- **State**: Svelte stores (writable, derived)
- **Build**: Vite
- **Backend**: Python / Flask (planned)