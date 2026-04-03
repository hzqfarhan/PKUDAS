You are my senior full-stack engineer working inside an EXISTING web app repository.

Your job is to UPGRADE the current app into a polished, installable, accessible PWA called:

e-Dent

Do not rebuild everything from scratch unless the current implementation is fundamentally broken.
First inspect the repository and understand the current architecture.
Then implement the changes directly in the existing app in clear phases.
Preserve working features where possible.
Do not stop at planning. Ship the implementation.

==================================================
PRIMARY GOAL
==================================================

Transform the current PKU-DAS web app into a modern healthcare-style PWA named e-Dent with:
- the same soft liquid-glass visual language as the attached medical UI reference
- excellent desktop + mobile responsiveness
- accessibility-first UX
- a clean light-only theme
- collapsible sidebar navigation
- Google OAuth
- improved onboarding/profile capture
- a floating WhatsApp button to contact Dr Amin
- embedded map to PKU UTHM
- simplified admin/staff experience with one dashboard page using bento-style modules

==================================================
NON-NEGOTIABLE PRODUCT CHANGES
==================================================

Apply all of the following:

1. Rename the product everywhere from:
- PKU-DAS
to:
- e-Dent

2. Remove dark mode entirely:
- remove theme toggle
- remove dark theme tokens/classes
- use one polished light theme only
- ensure all pages, components, and layouts follow the same light system

3. Use the attached UI image as the design direction:
- soft frosted liquid-glass cards
- rounded corners
- premium healthcare/mobile-app look
- airy spacing
- calm blue-grey background
- deep teal primary action color
- glass blur surfaces with subtle borders and shadows
- modern medical dashboard aesthetic

4. Keep the app fully responsive:
- mobile first
- tablet friendly
- desktop polished
- large touch targets
- sidebar collapses elegantly
- cards rearrange cleanly on smaller screens

5. Make it a real PWA:
- installable
- manifest
- icons
- service worker
- offline fallback page
- safe caching
- no risky offline appointment writes that can cause booking conflicts

6. Accessibility:
- semantic landmarks
- keyboard accessible navigation
- visible focus states
- aria labels where needed
- form labels and validation messages
- good contrast even with glass effects
- avoid using glass effects in ways that make text hard to read
- respect reduced motion where appropriate

==================================================
DESIGN SYSTEM TO IMPLEMENT
==================================================

Match the visual language of the attached image closely, but adapt it to the current web app and keep it accessible.

Use this design direction:

Color palette:
- background: #DCE3E7
- soft surface: #F6F7F7
- glass tint: rgba(246,247,247,0.55)
- secondary glass tint: rgba(255,255,255,0.35)
- border highlight: rgba(255,255,255,0.45)
- primary teal: #05384C
- hover teal: #0B5B73
- muted blue-grey: #9DB7C3
- text primary: #17323B
- text secondary: #5F7279
- success: accessible green
- warning: accessible amber
- danger: accessible red

Glass style:
- backdrop blur: 16px to 24px
- subtle saturation increase
- soft 1px translucent border
- soft shadow, not heavy
- rounded corners:
  - cards: 24px to 28px
  - buttons/chips: pill or 18px to 999px
- layered surfaces with depth
- avoid clutter

Typography:
- clean modern sans-serif
- strong hierarchy
- large readable headings
- concise muted metadata

Buttons:
- primary CTA in deep teal
- secondary ghost/glass buttons
- rounded/pill style
- strong hover and focus states

==================================================
HIGH-LEVEL UX CHANGES
==================================================

Public/user-facing experience:
- keep the booking experience elegant and simple
- homepage should feel premium and clear
- highlight real-time availability and booking flow
- include map/contact section
- include floating WhatsApp button
- use the same visual language across homepage, booking, auth, profile, and appointments

Authenticated app layout:
- add a left collapsible sidebar
- desktop: collapsible fixed sidebar
- mobile: slide-in drawer / sheet
- keep navigation simple and consistent

Admin and clinic staff UX:
- do NOT create multiple major tabs like the user-facing availability flow
- use ONE main dashboard route for admin/staff
- inside that single dashboard, compose everything as bento-style modules/cards
- no separate “availability” tab for admin/staff like the user side
- admin/staff should manage operations from one dashboard view

==================================================
SIDEBAR / NAVIGATION REQUIREMENTS
==================================================

Implement a collapsible sidebar for authenticated layouts.

Public/user sidebar items can include:
- Dashboard / Home
- Availability
- Book Appointment
- My Appointments
- Profile

Admin/staff sidebar items:
- Dashboard
- Logout

Important:
- for admin/staff, keep only ONE main page/route for operations: Dashboard
- other operational sections should appear as modules INSIDE the dashboard, not as separate major pages

Sidebar behavior:
- expanded + collapsed states
- remember user preference locally
- keyboard accessible
- mobile drawer with overlay
- active route highlighting
- top brand area shows e-Dent
- include placeholder for UTHM logo in sidebar/header

==================================================
BRANDING / ASSETS / PLACEHOLDERS
==================================================

Add placeholders and show clearly where the files live.

Create these folders and placeholder files if they do not already exist:
- public/branding/uthm-logo-placeholder.svg
- public/branding/e-dent-logo-placeholder.svg
- public/images/backgrounds/uthm-clinic-bg-placeholder.jpg
- public/icons/pwa/icon-192.png
- public/icons/pwa/icon-512.png

Also create:
- public/branding/README.md

In that README, document clearly:
- where to replace the UTHM logo
- where to replace the main site background image
- where to replace the PWA icons

Use the background image placeholder in the public-facing layout:
- soft full-page or hero background treatment
- keep it subtle
- do not overpower content
- combine with a light glass overlay

==================================================
WHATSAPP BUTTON
==================================================

Add a floating circular WhatsApp button:
- fixed at bottom-right
- visible on public pages and user pages
- styled to fit the glass + teal aesthetic while still clearly recognizable
- include tooltip / accessible label:
  "Chat with Dr Amin on WhatsApp"

Behavior:
- clicking opens WhatsApp redirect in a new tab
- use a configurable value, not a hardcoded made-up number

Implement with env/config:
- NEXT_PUBLIC_DR_AMIN_WHATSAPP_URL

Example usage:
- if env var exists, use it
- if missing, show a disabled/dev fallback state or obvious placeholder note in development, but do not break the UI

Also:
- add a short default prefilled message text if appropriate

==================================================
MAP / LOCATION SECTION
==================================================

Add a map section for PKU UTHM on the public homepage/contact area.

Use the clinic location:
Pusat Kesihatan Universiti (Kampus Parit Raja), Universiti Tun Hussein Onn Malaysia, 86400 Parit Raja, Batu Pahat, Johor, Malaysia.

Implementation:
- embed an accessible map card
- prefer a simple, reliable implementation that works without complicated setup
- Google Maps embed or OpenStreetMap/Leaflet is acceptable
- include:
  - location title
  - address text
  - “Open in Maps” / “Get Directions” button
- style the map container with the same rounded liquid-glass aesthetic

==================================================
AUTHENTICATION
==================================================

Use the current auth system if it already exists and is solid.
If using Supabase, keep Supabase Auth and add Google OAuth properly.

Requirements:
- email/password auth
- Google OAuth
- protected routes
- proper callback handling
- secure session handling
- clear sign-in / sign-up UX

IMPORTANT ROLE MODEL:
Separate PUBLIC registrant type from INTERNAL clinic staff/admin role.

Public self-registration should only create normal end users.
Users can choose:
- student
- uthm_staff

This is NOT the same as clinic admin/staff.
PKU clinic staff/admin must NOT be self-assignable during public registration.

Use a data model like:
- app_role: user | clinic_staff | admin
- affiliation_type: student | uthm_staff

Where:
- public registrations always get app_role = user
- affiliation_type is chosen by the registrant
- clinic_staff and admin are seeded or manually promoted by authorized admins only

==================================================
NEW REGISTRATION / ONBOARDING REQUIREMENTS
==================================================

For every new registration, require these fields:
- FULL NAME
- FACULTY
- MATRIC NUMBER / STAFF ID
- role selection:
  - student
  - uthm_staff

Important:
- because staff users may not have a matric number, implement the field in a way that can support both:
  UI label:
  "Matric Number / Staff ID"
- store it in a consistent profile field
- validate required input
- prevent users from skipping onboarding

This onboarding must happen for:
- email/password sign-up
- first-time Google OAuth sign-in

Flow:
1. user authenticates
2. if profile is incomplete, redirect to onboarding/profile-completion page
3. require completion before allowing access to main app features

Profile fields to support:
- full_name
- faculty
- matric_number
- affiliation_type
- phone (optional if useful)
- avatar_url (optional if useful)

==================================================
ADMIN / STAFF DASHBOARD REQUIREMENTS
==================================================

For admin and clinic staff, create only one main route/page:
- /admin
or the existing equivalent if the repo already has a structure

That page must use a bento-style operational dashboard layout with modules such as:
- Today’s appointments
- Upcoming appointments
- Quick actions
- Slot blocking controls
- Appointment status updates
- Occupancy summary
- Recent activity / audit log preview
- Exports
- Realtime activity feed if available

Do NOT create a separate admin availability tab mirroring the user flow.
Instead:
- integrate operational scheduling info directly into the dashboard modules

Bento dashboard style:
- asymmetric grid
- rounded glass cards
- visually balanced
- compact but premium
- strong information hierarchy

Quick actions module can include:
- block slot
- unblock slot
- mark completed
- mark no-show
- cancel appointment
- export schedule

==================================================
PUBLIC PAGES / USER PAGES
==================================================

Public/home side should include:
- elegant hero/overview
- weekly availability preview
- quick search/book path
- floating WhatsApp button
- map/location/contact section
- UTHM logo placeholder placement
- subtle background image usage
- brand name e-Dent

User pages should include:
- availability
- booking flow
- my appointments
- profile
- onboarding if incomplete

Keep the public/user side visually aligned with the attached reference:
- high-end medical booking app feel
- card-based
- soft gradients and glass
- deep teal CTA buttons
- no dark mode

==================================================
PWA REQUIREMENTS
==================================================

Make the app a proper PWA.

Implement:
- manifest.webmanifest
- app name: e-Dent
- short_name: e-Dent
- description for dental booking at PKU UTHM
- start_url
- display: standalone
- theme_color based on the new light palette
- background_color matching the page background
- 192 and 512 icons
- installability support
- service worker
- offline fallback page

Offline strategy:
- cache app shell/static assets safely
- allow graceful read-only fallback where sensible
- do not allow unsafe offline booking submission that can cause conflicts
- show clear offline state messaging

==================================================
ACCESSIBILITY + RESPONSIVE REQUIREMENTS
==================================================

The UI must be accessible on both mobile and desktop.

Required:
- semantic HTML
- proper labels
- buttons with aria-labels when icon-only
- keyboard-friendly sidebar and dialogs/drawers
- focus trap where needed
- visible focus ring
- accessible form errors
- avoid low-contrast text on glass
- touch targets at least comfortably tappable
- responsive grid/card stacking
- reduce visual overload on small screens
- test at common widths:
  - 375px
  - 768px
  - 1024px
  - 1440px

==================================================
REMOVE DARK MODE COMPLETELY
==================================================

Find and remove:
- theme providers that support dark mode
- dark class variants
- dark mode toggle UI
- dark palette tokens
- conditional theme switching logic

Replace with:
- one consistent light theme system
- stable palette tokens
- consistent surfaces and shadows

==================================================
IMPLEMENTATION APPROACH
==================================================

Work in this order:

1. Inspect the repo
- summarize current routing, auth, UI system, state management, backend integration, and component structure
- identify what can be reused

2. Establish design tokens
- centralize colors, radii, shadows, glass styles
- remove dark mode
- apply new light liquid-glass visual language

3. Rename branding
- replace PKU-DAS with e-Dent across UI text, metadata, manifest, and branding

4. Build/update layout shell
- collapsible sidebar
- mobile drawer
- shared header/top area if needed
- logo placeholders
- background image placeholder support

5. Upgrade auth
- add Google OAuth
- add onboarding/profile completion
- enforce public registrant type vs internal app role separation

6. Update profile/data model
- support full_name, faculty, matric_number, affiliation_type
- keep clinic internal roles protected from self-assignment

7. Rework public-facing pages
- hero
- availability
- booking entry points
- map/contact section
- WhatsApp floating action button

8. Rework user pages
- my appointments
- profile
- onboarding UX

9. Rework admin/staff UX
- collapse into one dashboard route
- bento-style operational modules
- no separate availability tab like the user flow

10. Add PWA support
- manifest
- icons
- service worker
- offline page
- install prompt

11. Accessibility pass
- keyboard
- focus
- aria
- contrast
- responsive fixes

12. Final polish
- loading states
- empty states
- error states
- success feedback
- README updates
- env example updates
- final implementation summary

==================================================
TECHNICAL RULES
==================================================

- respect the existing stack unless there is a strong reason to change it
- keep the codebase production-style and clean
- avoid any
- avoid dead code
- use server-safe auth patterns
- do not expose secrets to the client
- do not let public users self-assign admin/clinic staff roles
- keep business logic out of presentational components
- do not break existing appointment rules
- do not remove working functionality unless replaced with something better
- keep changes modular and understandable

==================================================
EXPECTED OUTPUT STYLE
==================================================

As you work:
- first give a concise repo audit
- then a short implementation plan
- then implement directly
- after each phase, list changed files and what changed
- do not ask unnecessary questions
- make reasonable engineering decisions and keep moving

At the end provide:
- summary of what was implemented
- exact asset placeholder folder paths
- any env vars added
- any migrations or setup steps required
- any remaining edge cases

Start now by scanning the current repository and upgrading the existing app into e-Dent without rewriting it from scratch.