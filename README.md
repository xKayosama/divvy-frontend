# Divvy frontend

Divvy helps any group share expenses: friends, trips, roommates, families, events, and other shared plans. Homes are one use case, not the product’s scope.

React + TypeScript web client for Divvy, using the mobile app's branding. UI components use shadcn/Base UI and Tailwind; Redux Toolkit manages client state and RTK Query handles API requests and caching.

## Run locally

Use Node.js 24 and npm (the current project checks were run with Node 24).

```sh
npm ci
cp .env.example .env
npm run dev
```

If you already have `.env`, keep its settings instead of replacing it. `VITE_API_URL` points to the backend API root, including `/api`; the example uses `http://localhost:5000/api`. Run `../divvy-backend` separately with its own database/environment configuration. Vite prints the available frontend URL.

## Project layout

```text
src/
  app/          App providers, routing, Redux store, listeners, typed hooks
  features/     Feature-owned pages, components, API endpoints, state and types
    auth/
    groups/
    dashboard/
    expenses/
    bills/
    members/
  components/   Shared UI primitives, branding and application shell
  lib/          Shared formatting, date and finance calculations
  services/     Base RTK Query API, API errors and token persistence
  types/        Small contracts shared by multiple features
  main.tsx      Browser bootstrap
  index.css     Mobile-aligned theme tokens and global styles
public/brand/   Active logo and icon
```

A feature owns its own `pages/`, `components/`, `<feature>Api.ts`, `types.ts`, optional `<feature>Slice.ts` and `lib/`. Features without a screen do not need empty page/component folders. Shared code does not import feature modules; ESLint enforces that boundary.

[Deployment setup](docs/DEPLOYMENT.md) · [Architecture and adding a module](docs/ARCHITECTURE.md) · [Completed modules and remaining work](docs/FRONTEND-MODULES.md)

## Checks

```sh
npm run build
npm run lint
npm test
```

Tests cover currency/split calculations, bill state/query behavior and selected-group storage compatibility. Browser workflow checks used fixture API responses; live MongoDB writes, delivery services and timed backend workers still need deployment-environment verification.

## Authentication and persistence

The backend currently returns bearer JWTs. The frontend persists the token in `localStorage`; it does not use authentication cookies. Redux reducers contain state changes only. Application listeners persist credentials/group selections and clear cached API data at session boundaries. Existing `selectedHousehold` selections are read for compatibility; new selections use `selectedGroup`.
