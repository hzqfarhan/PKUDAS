You are my principal full-stack engineer and product-minded software architect.

Build a production-ready MVP for a web app called:

PKU UTHM Dental Appointment System (PKU-DAS)

You have permission to:
- inspect the repository
- create/edit/delete files
- install dependencies
- run the app locally
- add environment examples
- create SQL migrations
- refactor code when needed

Do not give me long theory. Work like a senior engineer inside the repo.
First inspect the codebase, then make a short execution plan, then implement in phases.
Prefer shipping working vertical slices over scaffolding.
Do not leave pseudocode or fake TODO placeholders for core features.

==================================================
PROJECT CONTEXT
==================================================

This system is for Pusat Kesihatan Universiti (PKU), UTHM dental clinic.

Current problem:
- users must walk in or call just to check slot availability and book
- staff get interrupted constantly by scheduling questions
- the process is manual and inefficient

Target outcome:
- 24/7 digital booking platform
- real-time weekly slot visibility
- easy self-service booking for students/staff/patients
- admin dashboard for clinic staff
- streamlined management of the clinic’s fixed daily capacity

Core schedule rule:
- clinic runs 18 slots per day
- operating hours: 08:00 to 17:00
- timezone: Asia/Kuala_Lumpur
- default slot size: 30 minutes
- week view should be easy to scan visually

Core features required:
1. Real-time slot availability grid on homepage/dashboard
2. Specific date search and occupancy status viewer
3. Patient/student appointment booking interface
4. Staff/admin management dashboard

Advanced features strongly preferred:
- color-coded availability states
- dynamic admin time blocking
- automatic slot reopening after cancellation
- exportable schedule reports
- audit logs
- installable PWA
- offline fallback page
- role-based security
- realtime updates after booking/cancel/block

==================================================
TECH STACK
==================================================

Use this stack by default:
- Next.js latest stable with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui for component primitives if useful
- Supabase for backend if possible:
  - Postgres
  - Auth
  - Realtime
  - Storage only if truly needed
  - Row Level Security
- Zod for validation
- React Hook Form for forms
- date-fns for date handling
- ESLint + strict TypeScript
- deploy-friendly structure for Vercel

Important:
- Supabase is the primary backend choice
- if Supabase credentials/setup are unavailable, still architect the app around clean repository/service interfaces and provide a mock/local fallback adapter so the app remains runnable without changing the frontend architecture later
- do NOT switch to Firebase unless absolutely necessary
- do NOT use outdated Supabase auth-helpers; use the current SSR-safe pattern
- do NOT expose sensitive server keys to the browser

==================================================
ENGINEERING RULES
==================================================

Follow these rules strictly:
- use App Router, not Pages Router
- default to Server Components unless a Client Component is actually required
- use Server Actions and/or Route Handlers where appropriate
- keep business logic out of UI components
- validate all inputs on server and client
- use strong typing everywhere
- avoid `any`
- write clean, modular, production-style code
- use meaningful file names and folder structure
- keep comments minimal and useful
- no overengineering
- no dead code
- no fake mockups for implemented flows

Security rules:
- never trust client-side checks alone
- enforce appointment conflict rules at database or transactional server level
- use RLS on all exposed tables
- server-only secrets must never enter client bundles
- add authorization guards for patient vs admin/staff access
- add audit logging for important write actions

PWA rules:
- app must be installable
- add a manifest
- add icons
- add service worker/offline support safely
- booking writes must require network and must not create dangerous offline conflicts
- offline mode should gracefully allow app shell and read-only fallback, not unsafe queued bookings unless explicitly designed and conflict-safe

==================================================
USER ROLES
==================================================

Implement these roles:
- patient
- staff
- admin

Behavior:
- patient can browse availability and manage only their own appointments
- staff/admin can see operational dashboards
- only staff/admin can block slots and manage all appointments
- admin can view audit logs and reports
- keep the role system simple and extensible

==================================================
AUTHENTICATION
==================================================

Implement auth with Supabase if available.

Requirements:
- email/password login for now
- structure the code so future UTHM matrix-number / campus SSO integration can be added later without major rewrites
- store matrix number as an optional profile field now
- protect private routes
- redirect unauthenticated users properly
- create role-aware route protection

==================================================
DATA MODEL
==================================================

Create proper SQL migrations and types for at least these tables:

1. profiles
- id uuid primary key references auth.users(id)
- role text check in ('patient','staff','admin')
- full_name text not null
- email text
- matrix_no text
- phone text
- created_at timestamptz default now()
- updated_at timestamptz default now()

2. availability_rules
- id uuid primary key
- weekday int not null
- start_time time not null
- end_time time not null
- slot_minutes int default 30
- active boolean default true
- created_at timestamptz default now()

3. blocked_slots
- id uuid primary key
- block_date date not null
- start_time time not null
- end_time time not null
- reason text
- created_by uuid references profiles(id)
- created_at timestamptz default now()

4. appointments
- id uuid primary key
- patient_id uuid references profiles(id)
- appointment_date date not null
- start_time time not null
- end_time time not null
- status text check in ('booked','confirmed','cancelled','completed','no_show')
- notes text
- cancelled_reason text
- created_by uuid references profiles(id)
- created_at timestamptz default now()
- updated_at timestamptz default now()

5. audit_logs
- id uuid primary key
- actor_id uuid references profiles(id)
- action text not null
- entity_type text not null
- entity_id uuid
- metadata jsonb default '{}'::jsonb
- created_at timestamptz default now()

Optional if useful:
- clinic_settings
- notifications
- report_exports

==================================================
DATABASE CONSTRAINTS AND SAFETY
==================================================

Critical:
- prevent double booking at the database level, not just UI level
- use either:
  a) a unique constraint / partial unique index for active appointments on a specific date+time
  OR
  b) a Postgres function / RPC / transaction that atomically checks conflicts then inserts
- blocked slots must also prevent booking conflicts
- cancellation must immediately free the slot again
- patient should only have 1 active future appointment unless staff/admin overrides
- use clear server-side error messages for conflicts

==================================================
RLS POLICIES
==================================================

Implement explicit RLS policies.

Minimum rules:
- profiles: users can read/update only their own profile, admins can read all
- appointments:
  - patients can read only their own appointments
  - patients can insert only their own appointment
  - patients can cancel only their own future appointment
  - staff/admin can read/manage all appointments
- blocked_slots:
  - patients can read availability effect if needed through safe queries
  - only staff/admin can insert/update/delete blocked slots
- audit_logs:
  - only admin can read all
  - writes created automatically or via server logic

Enable RLS on every exposed table.
Do not leave policies wide open.

==================================================
BOOKING AND SCHEDULING LOGIC
==================================================

Use Asia/Kuala_Lumpur timezone everywhere.

Default scheduling behavior:
- fixed daily schedule from 08:00 to 17:00
- 30-minute intervals = 18 slots/day
- slots are derived dynamically from schedule rules + blocked slots + appointments
- do not pre-generate years of slot rows unless there is a strong reason

Core booking rules:
- patient selects date
- patient sees available slots
- patient books one slot
- booking instantly updates UI
- cancellation instantly reopens slot
- rescheduling can be implemented as cancel + rebook or dedicated flow
- past slots are not bookable
- blocked slots are not bookable
- admin can override and manage statuses

Occupancy UX:
- weekly view
- color coding:
  - green = available
  - yellow = limited / 1 remaining within grouped hour or near full
  - red = fully booked
- clear labels for available/booked/blocked/completed/cancelled
- date filter and quick navigation to next/previous week

==================================================
PAGES AND ROUTES
==================================================

Build these routes/screens:

Public / patient side:
- /                  -> homepage with weekly availability grid
- /availability      -> detailed date search and occupancy view
- /book/[date]       -> booking flow for selected date
- /my-appointments   -> patient’s upcoming and past appointments
- /login
- /signup
- /offline           -> offline fallback page

Admin/staff side:
- /admin
- /admin/appointments
- /admin/blocks
- /admin/reports
- /admin/audit

Nice-to-have:
- /profile
- /install or install prompt banner logic

==================================================
UI / UX REQUIREMENTS
==================================================

Design tone:
- clean
- trustworthy
- modern healthcare style
- simple enough for students and staff
- mobile-first
- accessible

Use:
- responsive layout
- empty states
- loading states
- error states
- success toasts
- confirmation dialogs for destructive actions
- keyboard-friendly controls
- clear badges/chips for status
- obvious call-to-action buttons

Homepage must feel high-value:
- immediate weekly slot overview
- fast scanability
- clear legend for colors/status
- quick “Book now” path

==================================================
PWA REQUIREMENTS
==================================================

Implement a real PWA.

Add:
- app manifest
- proper name and short_name
- stable id
- standalone display
- start_url
- theme/background colors
- at least 192x192 and 512x512 icons
- installability support
- service worker
- offline fallback page

Caching strategy:
- cache app shell/static assets safely
- do not cache sensitive authenticated responses recklessly
- do not cache booking mutation responses
- support safe offline read fallback where reasonable
- show a helpful offline message when booking cannot proceed

Treat service worker as progressive enhancement:
- core app should still work online even if SW is unavailable
- no fragile hard dependency on the service worker

==================================================
REALTIME
==================================================

Use Supabase Realtime if available.

Required realtime behaviors:
- availability grid updates after booking
- availability grid updates after cancellation
- availability grid updates after admin blocks/unblocks slots
- admin dashboard reflects live changes
- unsubscribe cleanly and avoid memory leaks

==================================================
ADMIN FEATURES
==================================================

Admin/staff dashboard should include:
- today’s appointment summary
- upcoming appointments table
- filters by date/status
- search by patient name/email/matrix number where available
- block slot / unblock slot actions
- mark appointment completed / cancelled / no-show
- operational summary cards
- export daily schedule to CSV
- export daily schedule to PDF if feasible
- audit log viewer for admin

==================================================
REPORTING
==================================================

Include at least basic reporting:
- total appointments for selected day/week
- booked count
- available count
- cancelled count
- no-show count

Exports:
- CSV required
- PDF preferred

==================================================
SEED DATA
==================================================

Create a seed script with:
- 1 admin demo account
- 1 staff demo account
- 3 patient demo accounts
- sample weekly availability rules
- sample blocked slots
- sample booked/cancelled/completed appointments

Also generate realistic demo content so the UI is not empty on first run.

==================================================
PROJECT STRUCTURE
==================================================

Use a clean structure similar to this, but refine as needed:

- app/
- components/
- lib/
  - supabase/
  - auth/
  - booking/
  - utils/
- actions/
- types/
- hooks/
- public/
- supabase/
  - migrations/
  - seed.sql or seed scripts
- tests/

Keep Supabase client utilities separate for:
- browser client
- server client
- middleware / auth refresh pattern if needed

==================================================
IMPLEMENTATION DETAILS
==================================================

You may choose exact implementation details, but these outcomes are mandatory:
- strict typing
- clean schema
- safe booking flow
- secure auth
- RLS
- installable PWA
- realtime availability
- admin dashboard
- readable code
- runnable locally

Also add:
- `.env.example`
- setup instructions in README
- clear notes for required env vars
- any required scripts in package.json
- migration instructions
- seed instructions

==================================================
TESTING
==================================================

Add pragmatic tests:
- unit tests for slot generation logic
- unit tests for date/time validation
- integration test or equivalent for booking conflict prevention
- auth/authorization smoke coverage
- basic PWA/offline smoke checklist in README if automated tests are not practical

==================================================
OUTPUT / WORK STYLE
==================================================

Work in this order:
1. inspect repository structure
2. summarize current state in a few lines
3. propose target architecture
4. implement database schema and migrations
5. implement Supabase auth + role system
6. implement availability computation
7. implement booking flow
8. implement patient appointment screens
9. implement admin dashboard and slot blocking
10. implement realtime updates
11. implement PWA features
12. add seed data, exports, docs, and tests
13. run/build/check for obvious errors
14. summarize what was built and any remaining edge cases

When reporting progress:
- be concise
- name changed files
- explain decisions briefly
- keep moving forward without asking unnecessary questions

When forced to choose:
- choose the simplest stable production-worthy solution
- prefer correctness and maintainability over cleverness

Do not stop at a design doc.
Do not stop at wireframes.
Do not stop at mock data only.
Build the actual app.

Start now by scanning the repository and deciding whether to scaffold a fresh Next.js App Router app or extend the existing one.