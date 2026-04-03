# PKU-DAS — UTHM Dental Appointment System

A production-ready dental appointment booking system for **Pusat Kesihatan Universiti (PKU), UTHM**.

Patients can view real-time slot availability, book 30-minute dental appointments, and manage their bookings. Staff and admins get a full operational dashboard with appointment management, time-slot blocking, reports with CSV export, and audit logging.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, React 19) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4 |
| Backend | Supabase (Postgres, Auth, Realtime, RLS) |
| Validation | Zod |
| Forms | React Hook Form |
| Date handling | date-fns + date-fns-tz |
| Toasts | Sonner |
| PWA | Custom service worker + manifest |

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.example .env.local

# 3. (Optional) Add Supabase credentials to .env.local
#    Leave empty to run with built-in mock data

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo Accounts (Mock Mode)

The app ships with an in-memory mock data layer that works without Supabase.

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@pku.uthm.edu.my` | `admin123` |
| **Staff** | `staff@pku.uthm.edu.my` | `staff123` |
| **Patient** | `ahmad@student.uthm.edu.my` | `patient123` |
| Patient | `nurul@student.uthm.edu.my` | `patient123` |
| Patient | `ali@student.uthm.edu.my` | `patient123` |

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | For production | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For production | Supabase anonymous (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | For production | Server-only service role key |

> Leave all three empty to run in mock mode with demo data.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Homepage — weekly availability grid
│   ├── login/              # Login page
│   ├── signup/             # Registration page
│   ├── book/[date]/        # Booking flow for a specific date
│   ├── my-appointments/    # Patient appointment list
│   ├── offline/            # PWA offline fallback
│   └── admin/
│       ├── page.tsx        # Staff dashboard
│       ├── appointments/   # Manage all appointments
│       ├── blocks/         # Block/unblock time slots
│       ├── reports/        # Statistics + CSV export
│       └── audit/          # Admin-only audit log viewer
├── components/
│   └── layout/             # Navbar, Providers
├── lib/
│   ├── auth/               # Auth context (mock + Supabase-ready)
│   ├── mock-data.ts        # In-memory data store for dev
│   ├── utils/              # Date helpers, cn(), SW registration
│   └── validators/         # Zod schemas
├── types/
│   └── database.ts         # TypeScript interfaces
public/
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
└── icons/                  # 192×192 + 512×512 PWA icons
supabase/
├── migrations/
│   └── 001_initial_schema.sql  # Full schema + RLS + triggers
└── seed.sql                    # Demo data seed
```

## Database Setup (Supabase)

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the migration: paste `supabase/migrations/001_initial_schema.sql` into the SQL editor
3. Create auth users via the Supabase dashboard (matching the emails above)
4. Run `supabase/seed.sql` to set roles, names, and availability rules
5. Copy your project URL + anon key into `.env.local`

## Core Features

### Patient Side
- **Weekly availability grid** with color-coded occupancy (green/yellow/red)
- **Date-based slot picker** with real-time status
- **One-click booking** with confirmation dialog
- **My Appointments** view with cancel capability
- **PWA installable** with offline fallback

### Admin / Staff Side
- **Dashboard** with today's appointment summary cards
- **Appointments table** — filter by date/status, search by patient, change status
- **Block slots** — block/unblock time ranges with reasons
- **Reports** — daily & weekly stats, occupancy bars, CSV export
- **Audit log** — full activity history (admin only)

## Scheduling Rules

- **Operating hours:** Mon–Fri, 08:00–17:00 (Asia/Kuala_Lumpur)
- **Slot duration:** 30 minutes
- **Slots per day:** 18
- **Constraint:** One active future appointment per patient (enforced server-side)
- **Double-booking prevention:** Unique partial index on `(appointment_date, start_time) WHERE status != 'cancelled'`

## PWA

The app is installable as a Progressive Web App:
- Custom service worker caches static assets
- Navigation fallback to `/offline` when disconnected
- Booking mutations are network-only (no unsafe offline writes)

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint check
```

## License

Internal project for PKU UTHM.
