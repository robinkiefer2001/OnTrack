# OnTrack User Manual

## Getting Started

OnTrack is a project management platform for tracking projects, tasks, employees, and customers. This guide covers all features accessible from the application.

---

## Logging In

1. Open the application in your browser
2. Enter your **username** (format: `firstname.lastname`, e.g. `michael.mueller`)
3. Enter your **password**
4. Click **Sign In**

If your credentials are incorrect, an error message will appear. Contact your administrator if you cannot log in.

---

## Navigation

The top navigation bar provides access to all sections:

| Menu Item  | Description                          |
|------------|--------------------------------------|
| Home       | Dashboard with portfolio overview    |
| Projects   | Manage all projects                  |
| Customers  | View customer directory              |
| Employees  | Browse employees and workloads       |
| Tasks      | Calendar, work log, and messaging    |
| Admin      | User and role management (admins)    |

Additional items in the user menu (click your initials in the top right):
- **My Profile** — Edit personal information
- **Settings** — Language and rate configuration
- **Logout** — End your session

---

## Dashboard (Home)

The dashboard shows an at-a-glance overview of your work:

- **Portfolio Health** — Cards showing total, active, overdue, and over-budget projects
- **Your Assignments** — Current tasks assigned to you with due dates
- **Quick Actions** — Links to common tasks (open projects, create project, manage rates, settings)
- **Overdue & Due Soon** — Items requiring immediate attention

---

## Projects

### Viewing Projects

The projects page shows a table of all projects with:
- Project name, number, and manager
- Customer name
- Current phase and status indicators
- Budget usage bar

Use the **search bar** to filter by project name or the dropdown filters for project manager and customer.

### Creating a Project

1. Click **New Project** in the toolbar
2. Fill in project details:
   - Name and description
   - Customer (select from list)
   - Project manager
   - Budget and total hours pool
   - Start and due dates
3. Add **tasks** with assigned team members, hours, and phase
4. Add **subtasks** within each task
5. Click **Save**

### Editing a Project

1. Click the **edit icon** (pencil) on any project row
2. Modify fields as needed
3. Add or remove tasks and subtasks
4. Click **Save**

### Project Details

Click a project name to view its details:
- **Summary** — Budget allocation, hours usage, cost overview
- **Timeline** — Visual phase timeline chart
- **Team Members** — Assigned employees with their workload
- **Tasks** — Full task breakdown with subtasks

### Printing / Export

Click **Print Project State** to generate a printable view of the current project.

---

## Tasks

### Calendar View

The tasks page displays a monthly calendar showing your assigned tasks:
- **Red items** — Overdue tasks
- **Orange items** — Due soon (within 2 days)
- **Regular items** — Future tasks

Use the **Today** button and month navigation arrows to browse dates.

### Work Log

Log hours spent on tasks:
1. Select a date on the calendar
2. Click **Add Work Entry**
3. Select the project and task
4. Enter hours and description
5. Save the entry

The total logged hours for the selected date appear at the bottom.

### Chat / Messages

Communicate with team members:
1. Select a recipient from the **To** dropdown
2. Type your message
3. Click **Send**

Messages appear in the notification bell in the navigation bar for the recipient.

---

## Employees

### Employee Directory

Browse all company employees with:
- Name, role, department
- Email and phone
- Workload indicator
- Number of assigned tasks and projects

Click an employee to view their detail panel with:
- Contact information (copy email, send email)
- Task drilldown — all assigned tasks across projects
- Team assignment — current project memberships

---

## Customers

View all customer records with:
- Company name
- Contact person
- Email, phone, address

Customers are linked to projects and can be selected when creating new projects.

---

## Settings

### Language

Switch the interface language between **English** and **German**. The change takes effect immediately across all pages.

### Hourly Rates

Manage rate definitions used in project budgets:
- Add new rate types with a name and per-hour cost
- Set a default rate
- Delete unused rates

---

## My Profile

### Personal Information

View and edit your contact details:
- **Read-only**: Name, job title, department (managed by admin)
- **Editable**: Email, phone, bio

### Password

Change your account password:
1. Enter current password
2. Enter new password
3. Confirm new password
4. Click **Update Password**

### Two-Factor Authentication

Enable or disable 2FA for additional security:
1. Click **Enable 2FA**
2. Scan the QR code with your authenticator app
3. Enter the 6-digit verification code
4. Click **Verify & Enable**

---

## Administration (Admin Only)

### Role Management

View and edit the 5 system roles:
- Admin, ProjectManager, TeamLead, Developer, Viewer
- Toggle individual permissions for each role
- Changes take effect immediately

### User Management

Manage company employees:
- **Add User** — Create new employees with role assignment
- **Edit User** — Update employee details and role
- **Delete User** — Remove employees from the system

---

## Notifications

The bell icon in the navigation bar shows:
- **Messages** — Unread chat messages from team members
- **Warnings** — Overdue tasks and tasks due within 2 days

Click the notification bell to view details, or click to navigate to the tasks page.

---

## Help

Click the **?** button (visible on every page in the bottom-right corner) to open the help panel with quick reference information for all features.

---

## Keyboard Shortcuts

| Shortcut        | Action                           |
|-----------------|----------------------------------|
| Enter (search)  | Execute search in navigation bar |
| Tab             | Navigate between form fields     |
| Escape          | Close modals and dropdowns       |

---

## Troubleshooting

| Problem                        | Solution                                          |
|--------------------------------|---------------------------------------------------|
| Cannot log in                  | Check username format (firstname.lastname)        |
| Page not loading               | Refresh the browser, check console for errors     |
| Missing admin menu             | Your role does not have admin.access permission   |
| Data not saving                | Check browser localStorage is not blocked         |
| Language not changing           | Go to Settings and select your preferred language |
