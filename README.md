# Daywise

A Next.js workforce planning application with split-screen Gantt/workload planner, time variance tracking, employee recommendations, and capacity management.

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
