# Frontend organization

This document describes the current structure. `FRONTEND-MODULES.md` records delivered increments and their validation; earlier entries there describe the structure at the time of each increment.

## Application wiring

- `src/main.tsx` mounts React and global CSS.
- `src/app/App.tsx` owns providers.
- `src/app/router.tsx` owns all browser routes and lazy page imports. Each screen loads from its feature's `pages/` directory. `/households` remains a compatibility redirect to `/groups`.
- `src/app/store.ts` registers the base RTK Query reducer and the `auth`/`groups` slices.
- `src/app/listeners.ts` handles browser persistence and API-cache cleanup after auth/group actions. Redux reducers do not write browser storage.
- `src/app/hooks.ts` provides typed Redux hooks. Components read `state.auth` and `state.groups.selectedGroup`.

## Feature ownership

```text
features/<feature>/
  <feature>Api.ts        Injected RTK Query endpoints and hooks
  <feature>Slice.ts      Client state, if needed
  types.ts              Feature-specific API/domain contracts
  pages/                Route-level components and orchestration
  components/           Feature-owned dialogs, forms and sections
  lib/                  Pure helpers/persistence specific to this feature
```

Keep existing singular API/slice filenames (`groupApi.ts`, `groupSlice.ts`) and plural feature folders (`groups`). Use PascalCase for React components, camelCase for API/slice files and descriptive kebab-case for supporting helpers. Use `@/` imports across directories, and relative imports inside the same feature or small shared module.

The Groups feature is the single owner of group API data, group types, selection state, storage compatibility and the group selector. There is no separate household API or household Redux slice.

Auth owns its login screen, route guard, auth contracts, header account menu/profile dialog and shared sign-out hook. Dashboard owns its page and query. Expenses and Bills own their financial forms and routes. Members currently owns the shared group-members query; its full management screen remains future work.

Pages coordinate state and dialogs. Extract sections with independent requests/state into feature components: Bills has separate reminders, payment orchestration, payment setup/review and amount-summary components; Expenses has its own recurring-schedule controls. Avoid growing pages into duplicate form implementations.

Cross-feature imports should express a real domain relationship. For example, Bills displays the linked expense using the Expenses details component, and payment forms use the Members query. Reusable calculations, dates, formatting and generic contracts belong in shared modules instead.

## Shared code

- `components/ui/`: local shadcn/Base UI primitives. Keep feature requests/business logic out of these files. The shadcn configuration points to `lib/utils.ts` for `cn`. Controlled dropdowns use the shared `components/ui/form-select.tsx` wrapper around the local shadcn Select. It accepts labeled options and preserves explicit empty-string filter values.
- `components/brand/`: the shared wordmark/icon components. Active files live under `public/brand/`; original legacy/design assets are retained separately.
- `components/shell/`: header/sidebar/layout and `navigation.ts`. The shell composes the local shadcn Sidebar provider, menus and trigger; mobile navigation uses its Sheet. Shared Sidebar context lives in `components/ui/sidebar-context.ts`, and responsive media subscriptions in `hooks/use-mobile.ts`.
- `lib/finance/`: currency precision, money formatting/validation, split calculations and shared split/recurrence contracts. It has no dependency on Expenses or Bills.
- `lib/date.ts`: UTC display dates and local calendar defaults.
- `lib/format.ts`: display labels, person names and user identifiers.
- `types/`: shared pagination and user-summary contracts.
- `services/api.ts`: the single base RTK Query API and bearer-header/401 handling.
- `services/api-error.ts`: extraction of server error messages.
- `services/session.ts`: current bearer-token persistence.

ESLint prevents shared `lib`, `services`, `types`, branding and UI primitives from importing feature code. Do not add speculative generic abstractions or barrel files that eagerly import every route.

## Data flow and compatibility

Backend data stays in RTK Query. Store only client-owned session/selection state in Redux slices; do not duplicate lists in slices or use a second API client.

Feature endpoints inject into `services/api.ts` and invalidate the appropriate cache tags. Bill payment invalidates bills, expenses, dashboard, balances and settlements, including failure/recovery paths. Query arguments contain filters and pagination so distinct list views have distinct cache entries.

Both persisted group formats can be read. `selectedGroup` wins when valid; legacy `selectedHousehold` is a fallback. Selecting a group writes the canonical key and removes the legacy key. Logout/account changes clear both selections and reset API cache. The token storage key and bearer authentication contract remain unchanged.

## Adding the next module

1. Add its feature-owned types, API endpoint injections and focused components. Add a slice only for client state that RTK Query does not own.
2. Put its route screen in `features/<feature>/pages/` and register its lazy route in `app/router.tsx`.
3. Update `components/shell/navigation.ts` if the destination is new.
4. Reuse UI primitives, theme tokens, branding and shared currency/split helpers. Synchronize currency lists/precision with the backend when those contracts change.
5. Add meaningful regression tests for calculations, contracts or state transitions. Run build, lint and tests; verify affected flows in a browser.
6. Record the increment in `FRONTEND-MODULES.md` with remaining API limitations and validation scope.

## Validation commands

`npm run build` checks TypeScript and bundles the lazy routes. `npm run lint` includes shared-to-feature import boundaries. `npm test` runs Node regression tests under `test/`; the project currently uses Node 24's TypeScript support for pure helpers.

Use isolated fixture API responses for reproducible browser checks, and validate real backend/database/worker behavior separately. This refactor does not add cookie authentication or change backend endpoints.
