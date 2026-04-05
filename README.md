# OnTrack — Project Management Platform

OnTrack ist eine mandantenfähige Projektmanagement-Plattform mit moderner Architektur:

- **Frontend:** SvelteKit 2 (Svelte 5, TypeScript, Tailwind CSS, DaisyUI)
- **Backend:** Python (Flask, REST API)
- **Datenbank:** PostgreSQL (Multi-Tenant, Authentik-Integration)
- **Auth:** Externe Userverwaltung via Authentik (User-IDs als Referenz)

---

## Schnellstart

### 1. Datenbank & Authentik

1. Authentik-Server bereitstellen (siehe Authentik-Doku)
2. PostgreSQL-Datenbank mit `frontend/postgres/init/backend-postgress.sql` initialisieren
	- Enthält alle produktiven Tabellen für Projekte, Aufgaben, Phasen, Risiken, Kunden, Mitarbeiter, Subtasks, Stundensätze etc.
	- User werden nur als Referenz (UUID) gespeichert

### 2. Backend starten

```sh
cd backend
pip install -r requirements.txt
python run.py
```
Das Backend läuft standardmäßig auf [http://localhost:5000](http://localhost:5000)

### 3. Frontend starten

```sh
cd frontend
npm install
npm run dev
```
Das Frontend läuft auf [http://localhost:5173](http://localhost:5173)

---

## Projektstruktur

```
OnTrack/
├── frontend/               # SvelteKit-Anwendung
│   ├── src/
│   │   ├── lib/
│   │   │   ├── api/        # API-Client (Types, Mock, HTTP)
│   │   │   ├── assets/     # Statische Assets
│   │   │   ├── components/ # UI-Komponenten
│   │   │   ├── data/mock/  # Mockdaten (nur Entwicklung)
│   │   │   ├── domain/     # Business-Logik (Projekte, Tasks, etc.)
│   │   │   ├── language/   # i18n (en, de)
│   │   │   ├── modules/    # Feature-Module
│   │   │   ├── state/      # Stores (auth, rbac, user, notifications)
│   │   │   └── utils/      # Hilfsfunktionen
│   │   └── routes/         # SvelteKit-Routen
│   └── static/             # Öffentliche Dateien
├── backend/                # Python-Backend (Flask, REST, WIP)
├── docs/                   # Dokumentation (API, Architektur, User Manual)
└── postgres/               # SQL-Init-Skripte
```

---

## Architektur & Features

- **Multi-Tenant:** Alle Daten sind mit tenant_id verknüpft
- **User-Referenz:** User werden nur als UUID aus Authentik gespeichert
- **Projekte, Aufgaben, Phasen, Risiken, Subtasks, Budgets, Teams, Kunden, Mitarbeiter, Stundensätze**
- **RBAC:** Rollen & Rechte (Admin, ProjectManager, TeamLead, Developer, Viewer)
- **Internationalisierung:** Deutsch & Englisch, alle UI-Texte über Translation-Layer
- **API-Layer:** Austauschbar (Mock/HTTP), alle Zugriffe über `ApiClient`-Interface
- **Migration:** Mockdaten können einfach durch echte API ersetzt werden (siehe `lib/api/index.ts`)

---

## Entwicklung & Migration

1. **Mockdaten:** Standardmäßig werden Mockdaten verwendet (`lib/api/mock.ts`)
2. **Echte API:** Für Produktivbetrieb `ApiClient`-Implementierung auf HTTP umstellen und in `lib/api/index.ts` exportieren
3. **Backend:** REST-API mit Flask, Anbindung an produktive PostgreSQL-DB
4. **Datenbank:** Siehe `frontend/postgres/init/backend-postgress.sql` für vollständiges Schema

---

## Dokumentation

### Dokumentation

- [API-Referenz](docs/API.md):
	- Endpunkte, Datenmodelle, Authentifizierung, Beispiel-Requests
- [Architektur-Guide](docs/ARCHITECTURE.md):
	- Layer-Architektur, Datenfluss, Mock-API, RBAC, Authentik-Integration
- [User Manual](docs/USER_MANUAL.md):
	- Schritt-für-Schritt-Anleitung für alle Features, Navigation, Rollen, Einstellungen, Troubleshooting

Alle Dokumente befinden sich im Ordner [docs/](docs/). Bei Änderungen an der API oder Architektur bitte die jeweiligen Dokumente mitpflegen.

---

## Tech Stack

- **Frontend:** SvelteKit 2, Svelte 5 (Runes), TypeScript, Tailwind CSS 4, DaisyUI
- **Backend:** Python 3, Flask
- **DB:** PostgreSQL (Multi-Tenant, Authentik)
- **Build:** Vite

---

## Hinweise

- Für Entwicklung: Mock-User (siehe `lib/data/mock/`), Passwort: `1234`
- Für Produktivbetrieb: Authentik-Integration, User-IDs als Referenz
- Alle Datenbanktabellen sind mandantenfähig (tenant_id)
- Bei Fragen siehe Dokumentation oder melde dich beim Entwicklerteam