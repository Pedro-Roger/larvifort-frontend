# NOTES — Larvifort CRM Project

## Project Context
Larvifort CRM is a Next.js 16.3.4 + React 19.2.8 frontend with Tailwind CSS 4, integrated with a NestJS + Prisma backend (lavifort-API). The frontend has 10 pages: Dashboard, Kanban, Clientes, Empresas, Agenda, Equipe, Pesquisa, Perfil, Login, and 404.

## Current State (Iteration 19)
- **FASE 1 - Fundação**: COMPLETA (auth, API client, proxy, refresh token)
- **FASE 2 - Integração**: COMPLETA (Dashboard, Clientes, Empresas via API)
- **FASE 3 - Funcionalidades**: 
  - Kanban via API: COMPLETA (Iteração 17)
  - Agenda via API: COMPLETA (Iteração 18)
  - Equipe via API: COMPLETA (Iteração 19)
  - Pesquisa via API: PENDENTE
  - Perfil via API: PENDENTE

## Tech Stack
- Frontend: Next.js 16.3.4, React 19.2.8, Tailwind CSS 4, Recharts, Phosphor Icons
- Backend: NestJS, Prisma, PostgreSQL
- Auth: JWT with refresh token, cookie-based
- API: REST with normalized `{ data }` envelope tolerance

## Key Files & Patterns
- `src/services/*.ts` — API service layer (api, auth, dashboard, clients, companies, tasks, appointments, users)
- `src/app/(app)/*/page.tsx` — Pages with `useEffect` + async inline pattern (no useCallback for data fetching due to ESLint rule `react-hooks/set-state-in-effect`)
- `src/components/*` — UI components (modals, kanban, dashboard, layout)
- `src/contexts/AuthContext.tsx` — Auth state management
- `src/proxy.ts` — Next.js middleware for protected routes

## Verification Commands
- `npm run typecheck` (tsc --noEmit)
- `npm run lint` (eslint)
- `npm run build`

## Known Pending Backend Endpoints
The backend (lavifort-API) currently only has `/auth` module. All other endpoints are contracted on frontend but not implemented:
- `/dashboard/stats`, `/dashboard/charts`
- `/clients` (CRUD)
- `/companies`, `/companies/groups` (CRUD)
- `/tasks`, `/tasks/projects` (CRUD)
- `/appointments` (CRUD)
- `/users`, `/teams` (CRUD)
- `/searches` (CRUD)
- `/profile` (GET/PATCH)

## User Terminology
- "Iteração" = development iteration/sprint
- "FASE" = phase of development (Fundação, Integração, Funcionalidades, UX)
- "Mock" = hardcoded test data in frontend
- "Service" = API service file in `src/services/`
- "Normalização tolerante" = handling both `{ data: [...] }` and `[...]` response shapes

## Recurring Loops Identified
1. **Feature Implementation Loop** — Each iteration: create service → create/update page → verify (typecheck/lint/build) → update GOAL/STATE
2. **Verification Loop** — After each change: typecheck → lint → build → audit (TODO/as any/console.log)
3. **Backend Contract Loop** — Frontend defines API shape → waits for backend implementation → E2E validation
4. **Mock-to-API Migration Loop** — Page uses mocks → service created → page integrated → mocks removed
5. **Component CRUD Loop** — Create modal → Create service method → Integrate in page → Add edit/delete modals → ConfirmDeleteModal