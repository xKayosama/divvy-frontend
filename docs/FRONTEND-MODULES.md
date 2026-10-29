# Frontend module updates

Deliver one module at a time for review. For the current folder layout and conventions, see [ARCHITECTURE.md](ARCHITECTURE.md); earlier increments below are historical notes.

## Increment 1: groups and session foundation

Implemented:
- Responsive groups page at `/groups`, group search, owner/member labels, loading/error/empty states.
- Group creation with the backend's supported currency list and refresh after success.
- Protected group selection, with `/households` retained as a route alias.
- Server logout, retry on logout service failure, shared 401 handling, and session cache/selection cleanup.
- Existing dashboard, expenses and members queries now use `/groups` API paths.
- Shared green UI tokens and Divvy login branding.

New group code lives in `src/features/groups`: API, components and pages. Existing household Redux names and response adapters are temporary compatibility boundaries for the other modules. The frontend currency list is copied from the backend and must stay synchronized when supported currencies change.

Validation: production build; lint for touched modules; browser checks using fixture API responses for authenticated/unauthenticated routing, list/search, creation payload and refresh, 390px mobile overflow, logout retry/success, server retry/empty state and expired sessions. Live MongoDB writes were not exercised.

## Increment 2: expenses

Implemented:
- Feature-owned list page, shared add/edit form, details, deletion and recurring schedule controls under `src/features/expenses`.
- Server description search, all 22 backend categories, UTC date filters, four sort orders and pagination. Search applies on submit; changing filters resets the page.
- Native currency formatting/validation for zero-, two- and three-decimal currencies. Summary amounts explicitly cover the current page.
- Equal, exact, percentage, shares and itemized splits with matching previews. Itemized tax/tip support equal or proportional allocation; requests omit derived participants. Item amounts are line totals and are not multiplied by quantity.
- Weekly/monthly/yearly creation schedules, optional end dates, pause/resume, and original-source links. Original dates stay fixed; recurrence updates use the dedicated endpoint. Details explain skipped dates on resume and the scope of source/occurrence edits.
- Paid-bill expenses are read-only. Missing members, member loading failures, unavailable records and mutation errors have visible feedback. Failed saves preserve drafts; pending saves/deletes block dismissal.
- Existing mobile green/mint palette, wordmark, currency-aware cards and responsive list/dialog layouts.
- Removed duplicate add/edit implementations and resolved the existing expense hook lint failures. Button variants now live in their own module so full frontend lint passes.

Validation: `npm run build`, `npm run lint`, `npm test` (8 regression tests), and 1,200 local comparisons against the backend split calculators across JPY/PHP/KWD. Browser checks use fixture API responses and cover pagination/search/filter/sort, all split payloads, paid-bill restrictions, recurring creation/pause/resume/edit, save/delete failures and retries, group/currency switching and mobile layout. Live MongoDB writes and timed recurring worker execution were not exercised. Currency precision is copied from the backend's `currency-precision.json`; synchronize it when supported precision changes.

Receipt OCR import is a separate future enhancement; manual itemized entry is available here.

## Increment 3: bills

Implemented under `src/features/bills`:
- Lazy-loaded bills page using the shared Divvy mobile green/mint palette, wordmark and status colors. The mobile shell also shows the green app icon.
- Unpaid (pending + overdue) and paid-only History views. Each retains independent search/category/recurrence/sort/page state. Clear filters stays inside its view; default sorts are nearest due date and latest due date, respectively.
- Server name/notes search, all 16 categories, effective UTC status filtering, source/one-time recurrence filters, four sort orders and pagination. Page totals are labeled explicitly.
- UTC overdue/today/next-seven-days reminder summaries and up to five previews per window from the dashboard API. Lists and reminders poll once a minute while the page is mounted; this is an in-app reminder display, not browser push notifications.
- Currency-aware bill creation/editing, weekly/monthly/yearly recurrence, and deletion with visible retry states. Generated occurrences cannot become new recurring sources. Disabling/deleting an unpaid source stops future generation and retains existing generated bills.
- Payment setup for equal/exact/percentage/shares splits, active payer/participants, native-currency allocation preview, explicit review and confirmation. The backend accepts standard bill splits; itemized entry remains in Expenses.
- The client refreshes the bill just before confirmation and requires re-review when bill details changed. Payment requests contain only payer/split/participants; recording time and linked-expense creation belong to the server. Payments do not transfer money.
- Saved payments freeze edits/deletion and use only `{ resume: true }` to finish. Failed/conflicting payments invalidate bill/expense/dashboard/balance/settlement caches; refreshed state exposes recovery or the paid result. Paid and legacy paid bills stay read-only; legacy history does not create backfilled expenses.
- Details link to generated bills' source and to the paid bill's expense. Details/payment dialogs check the selected group before showing actions. Dashboard pending/overdue/paid and upcoming-bill shortcuts now open the corresponding bills view/details.

Validation: production build, full-project lint and all 14 regression tests pass. Fixture-backed browser checks cover unpaid/history separation, cached filter restoration, server pagination/search, reminders, paid/legacy/linked-expense details, recurring create/edit/disable, generated occurrence restrictions, save/delete retries, all four payment splits, review, 409/503 recovery, one linked expense on resume, bill changes during review, zero-/three-decimal currencies, group switching, mobile layouts, retry states, keyboard tabs and dashboard shortcuts. Live database writes, real notification delivery and timed recurring workers were not exercised.

Backend limits retained: paid source bills cannot be edited/deleted, so their recurring schedules cannot be stopped through the current API after payment. Payment preflight detects changes already committed before confirmation; the API does not expose an expected-version token to eliminate a simultaneous edit after that check. Backend workers own payment deduplication/recovery and recurring generation.

## Maintenance: project organization

- Moved app providers/router/store/listeners under `src/app`; all screens now live in their feature's `pages` directory and load lazily.
- Consolidated household/group API, Redux and selector code into Groups. Runtime state is `groups.selectedGroup`; stored legacy selections remain readable.
- Moved persistence out of reducers into application listeners; kept token storage and backend contracts unchanged.
- Promoted money, split, date, formatting and error helpers into shared `lib`/`services` modules with shared contracts under `types` and `lib/finance/types`.
- Split reminders/payment setup/payment summary/recurring-expense controls into focused feature components. Extracted shell navigation configuration.
- Organized active logos in `public/brand`, removed unused Vite starter CSS/SVGs and obsolete page wrappers, and retained existing design/legacy assets.
- Added an example environment file, project README, architecture guide and ESLint shared-code import boundary.
- Added regression coverage for invalid stored selections, canonical/legacy precedence, writes and session cleanup.

Validation: build, full lint and all 19 regression tests pass. Existing fixture-backed Groups, Expenses and Bills browser suites pass after the moves. A focused session check also verified login token persistence, logout/account cache isolation, reload restoration, legacy route compatibility and 401 cleanup. Backend contracts and cookie behavior were not changed.

## Shared button consistency

Visible action controls now reuse the existing shadcn/Base UI Button: group cards and selection, logout, session retry, expense/bill detail rows and bill reminders. Existing outline, ghost, secondary and link variants provide theme, focus and disabled styling; content rows keep automatic height and wrapping. Navigation links retain link semantics, and the mobile navigation backdrop remains a structural dismiss target.

Validation: build, lint and all 19 regression tests pass. Isolated browser fixtures verified group cards, expense rows and bill rows render with the shared Button, including a visual review of the bills screen. Hosted data and API contracts are unchanged.

## shadcn navigation shell

Replaced the custom sidebar, backdrop and mobile open-state wiring with the official shadcn/Base UI Sidebar provider, header, content, footer, groups, menu items and trigger. Route links retain native link semantics and active state; selecting a link dismisses the mobile Sheet. Existing logos, green/mint sidebar tokens, group selection and logout handling are preserved. Desktop navigation can collapse through the header trigger or Cmd/Ctrl+B. The generated responsive hook uses a media-query subscription, and context is separated for Fast Refresh.

Validation: build, lint and 19 regression tests pass. Local fixture browser checks cover desktop collapse and shortcut, mobile keyboard opening, Escape dismissal, navigation closing the Sheet and no horizontal overflow at 390px. Backend behavior is unchanged.

## Header group switcher and collapsed navigation

The Groups-owned switcher lives in the top bar beside the Sidebar trigger. It uses a shadcn Button and DropdownMenu with group radio items, outlined icon tiles, single-line group names and an All groups footer action. The trigger shows group name and currency, and the menu opens below it. Loading, empty and retry states remain available, and selection uses the existing Redux/storage listeners.

The Sidebar header displays the Divvy wordmark when expanded and the existing brand icon in the collapsed desktop rail. Navigation and account icons stay centered with accessible names and hover labels. Mobile retains the full branded Sheet; group switching is available directly from the top bar.

Validation: build, lint and 19 tests pass. Local fixtures verified desktop/mobile group switching, persisted selection, switching while the Sidebar is collapsed, Escape dismissal, restored mobile branding and no horizontal overflow.

## Dashboard color refinement

Dashboard totals use reusable Card tones: a deep-green brand gradient for total expenses, soft mint for paid totals and a brighter mint activity card. Section headers have subtle mint surfaces. Pending bills use semantic amber warning tokens, overdue bills retain red and paid bills retain green; upcoming bill labels follow the same status colors. Light and dark warning tokens live in the shared theme. Amounts, queries and balance calculations are unchanged.

Validation: build and lint pass. Isolated dashboard fixtures verified populated totals, balances and bill states on desktop and 390px mobile without horizontal overflow; dark-mode colors and computed text/background values were also checked.

## Consistent page cards

Expenses and Bills use the same local shadcn Card/CardContent/CardHeader composition and brand/mint tones as Dashboard. Summary values use matching typography and icon containers. Filters, reminders and list surfaces share themed corners, shadows and padding; list headers use the same subtle mint tint. Named filter/list regions and existing data actions are preserved. Bill reminder cards stack on narrow screens.

Validation: build, lint and 19 regression tests pass. Fixture browser review verified matching themed corner radii, expanded bill reminders and desktop/390px mobile layouts without horizontal overflow.

## Header account menu

The header name/avatar is a shadcn dropdown trigger with Profile and Logout actions. Profile opens an accessible dialog for updating first and last names through `PATCH /api/auth/me`; email remains read-only. Names are trimmed, required and limited to 100 characters each. A successful response merges the returned names into the current account state, preserves its avatar and session, refreshes affected RTK Query data and updates the header immediately. Saving blocks dismissal; errors preserve the draft for retry. Sign-out behavior is owned by a shared Auth hook used by the menu and existing logout button: successful or expired sessions clear local selection/token/API caches and return to login, while server failures preserve the session and show a retry message. Email-change flows remain separate.

Validation: build, lint and 19 regression tests pass. Local fixture browser checks cover profile prefill, blank-name validation, trimmed request payloads, failed-save retry, pending-save dismissal protection, immediate header updates, saved values on reopening, discarded unsaved changes and expired-session cleanup. The backend profile suite passes 12 tests, and the hosted PATCH route returns the expected unauthenticated 401. No live user profile was modified during testing.

## Next increments

1. Members/invitations: owner invitation management, recipient consent and member removal UI.
2. Balances/settlements: currency-aware balances, suggested transfers, repayment and history.
3. Dashboard: spending periods, category summaries and navigation into completed modules.
4. Group settings/activity: edit settings, activity history, soft deletion and restoration.
5. Account: registration, password reset and profile settings.

Existing sidebar destinations for unfinished modules remain pending. Deliver each next increment separately for review.
