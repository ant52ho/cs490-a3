# Resource Allocator

A Next.js resource allocation and workforce planning application with split-screen Gantt/workload planner, time variance tracking, employee recommendations, and capacity management.

## Stack

- Next.js 16 (App Router) + TypeScript
- PostgreSQL + Prisma
- NextAuth.js (credentials)
- Tailwind CSS + shadcn-style components
- Recharts + gantt-task-react

## Getting Started

### Prerequisites

- Node.js 20+
- Docker (for PostgreSQL)

### Setup

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start PostgreSQL
docker compose up -d

# Run migrations and seed
npm run db:migrate
npm run db:seed

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo Accounts

| Email | Password | Role |
|---|---|---|
| admin@company.com | password123 | Admin |
| manager@company.com | password123 | Manager |
| alice@company.com | password123 | Employee |

## Features

- **Dashboard** — KPI metrics, utilization bars, skill gaps, variance alerts
- **Split-screen Planner** — Gantt timeline + workload heatmap with live sync
- **Employees** — Profiles, skills, certifications, PTO/training absences
- **Projects** — Tasks, assignments, shadow placeholder booking, variance reports
- **Recommendations** — Weighted employee match scores
- **Calendar** — Company holidays affecting capacity

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run test         # Run Vitest unit tests
npm run db:seed      # Seed demo data
npm run db:studio    # Prisma Studio
```

## Environment

Copy `.env` and configure:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/resource_allocator?schema=public
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
```

PostgreSQL runs on port **5433** (mapped from Docker) to avoid conflicts with local Postgres.


## Additional info
 What's included

  Foundation

  • Next.js 16 App Router + TypeScript + Tailwind
  • PostgreSQL via Docker (docker-compose.yml, port 5433)
  • Prisma schema with all entities (employees, projects,
    tasks, assignments, placeholders, absences, calendar,
    timesheets, alerts)
  • NextAuth credentials auth with roles (ADMIN, MANAGER,
    EMPLOYEE)
  • Seed data: 10 employees, 5 projects, tasks, assignments,
    mock timesheets (70–130% of planned), PTO/holidays

  Domain engines (src/lib/engines/)

  • Capacity, Workload, Variance, Matching, Skill Gap, Advanced
    (bench risk, burnout, forecasting)
  • 9 Vitest unit tests — all passing

  Pages

  ┌────────────┬────────────────────────────────────────────────┐
  │ Route      │ Feature                                        │
  ├────────────┼────────────────────────────────────────────────┤
  │ /          │ Dashboard with all KPI metrics, utilization    │
  │            │ bars, skill gaps, variance alerts              │
  │ /planner   │ Split-screen Gantt + workload heatmap (drag    │
  │            │ tasks → capacity updates)                      │
  │ /employees │ List + detail (skills, certs, assignments,     │
  │            │ PTO/training)                                  │
  │ /projects  │ CRUD, tasks, employee/placeholder assignments, │
  │            │ variance report                                │
  │ /recommend │ Weighted match scores with                     │
  │ ations     │ skill/availability/workload breakdown          │
  │ /settings/ │ Company holiday management                     │
  │ calendar   │                                                │
  │ /login     │ Auth                                           │
  └────────────┴────────────────────────────────────────────────┘

  Demo login

  • admin@company.com / password123 (Admin)
  • manager@company.com / password123 (Manager)
  • alice@company.com / password123 (Employee)

  Run it

  docker compose up -d
  npm install --legacy-peer-deps
  npm run db:migrate
  npm run db:seed
  npm run dev

  Then open http://localhost:3000

  The dev server is already running. Build and tests pass (npm 
  test, npm run build). See README.md (README.md) for full setup 
  details.

  