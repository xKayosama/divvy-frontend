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

Receipt OCR import was added in the later Receipt scanning increment below; manual itemized entry remains available.

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

## Members and invitations

- Added the lazy Members route with a searchable roster, role filter, shadcn avatars/badges and owner-only invite/removal controls. Management permissions come from the current authenticated account's active roster membership, not the stored group role. Owners cannot remove themselves or another owner through the UI.
- Owner invitations support normalized email entry, creation errors, the one-time code display/copy flow, status filtering, expiry labels and confirmed revocation. Member removal requires confirmation, preserves server errors for retry and refreshes member/group/financial caches.
- Added a standalone Invitations route, accessible from both the Groups page and sidebar even with no selected group. Recipients can inspect an owner-shared code, review pending invitations and explicitly accept or decline. Lookup never joins automatically. Acceptance requires the code and account matching the invited email.
- Accept, decline and revoke send the exact `createdAt` generation from the displayed invitation. Stale/replaced/expired responses require refreshing instead of blindly replaying an old request. Success refreshes group and invitation caches; joining does not silently change the selected group.
- Reused existing Card, PageHeader, FormSelect, Field, Dialog, Input, Button, Skeleton and Avatar components. Added themed local shadcn Badge, Alert and Empty primitives. No email-editing, role-changing, owner-transfer or leave-group features were added.

Backend readiness: the existing `/groups/:id/members`, `/groups/:id/invitations` and `/invitations` routes support this increment; direct member addition is retired (410). The backend invitation suite passes all 14 tests. The hosted incoming endpoint responds with the expected unauthenticated 401. Real authenticated database writes were not exercised during UI testing.

Backend limits: invitation codes are returned only when created, expire after seven days and must be shared manually; the invitation service does not send emails. Recipient access is scoped to the authenticated email. Owner and incoming lists return at most 100 recent entries; there is no invitation pagination. Existing memberships are made inactive when removed.

Validation: build and lint pass, along with all 23 frontend regression tests. Isolated desktop/mobile browser flows cover owner permissions, search, invalid/duplicate email, one-time code display, normalized payloads, revocation generation, member-removal failure/retry, ordinary-member restrictions, inbox access with no memberships, invalid/wrong-account lookup, code-required acceptance, generation-aware accept/decline, stale/expired recovery, query-error retry and no horizontal overflow at 390px. No real invitations or membership changes were made by these checks.

## Balances and settlements

- Added lazy `/balances` and `/settlements` routes using the existing Divvy theme, PageHeader, Card, Avatar, Badge, Alert, Empty, Skeleton, Field, Input, Button and Dialog components.
- Balances shows group expense totals, your remaining payable/receivable balance, searchable member balances and separate purchase/share/repayment amounts. The server owns all balance calculations and repayment suggestions.
- Settlements shows suggested sender/recipient pairs and allows only the authenticated sender to record a full or partial repayment already sent outside Divvy. Amounts respect native currency precision; payment time uses local input converted to ISO and rejects future dates. Review and final confirmation both refresh the outstanding suggestion before a new submission.
- Payment history uses server pagination and populated participant/recorder names, with former-member fallbacks. Queries have visible loading, empty, error and retry states; balance/suggestion queries refresh every 30 seconds and on focus. Saves invalidate balances, settlements and dashboard data, including failure paths.
- Interrupted saves retain an immutable payload/request ID in this browser tab’s session storage. Reload recovery replays that exact request without a new balance preflight, allowing the backend to return an already saved payment even when its suggestion disappeared. A pending save blocks another record in the same group/account. Confirmed success and logout/account changes clear the reference. No credentials are stored with this payload.
- Fixed the protected route guard to wait for the account to enter Redux before rendering account-dependent pages, preventing a direct Settlements reload from incorrectly redirecting to Groups.

Backend readiness: existing balances, suggested settlements, recording and paginated history endpoints support this module. The backend settlement suite passes all nine tests, including sender-only recording, partial balances, overpayment rejection, identical-request replay and concurrent-save protection. No backend edits were required. The hosted history endpoint returned the expected unauthenticated 401.

Validation: production build, full lint and all 28 frontend regression tests pass. Isolated desktop/mobile browser checks cover searchable balances, history pagination/former members, sender-only actions, partial repayments, validation, current-balance preflight, 409 recovery, lost-response save/reload/identical retry without duplication, loading-account routing, query errors/retry, zero-/three-decimal currencies, pending-save dismissal protection and session cleanup. No real payments or authenticated database writes were made during these checks.

Backend limits retained: history has no edit/delete endpoint. Ordinary inactive memberships are excluded from current balances; no suggestions therefore does not promise that every historical member is settled. Divvy records external payments and does not transfer money. Recovery references survive reload in the same browser tab; closing the tab or signing out clears them, so check history before starting a new record after either action.

## Next increments

1. Account deletion settings and complete group-icon presentation; inspect backend readiness before implementation. Email editing is excluded by user preference.

Deliver each next increment separately for review.

## Group settings and activity

- Added `/group-settings` with server-verified owner controls for name, currency and supported icon settings. Members can view settings and activity. Currency changes are disabled when the backend reports existing financial activity; backend validation errors preserve drafts.
- Added paginated activity history for expense additions/edits/deletions, bill payments and group updates, with actor/date labels and loading/error/retry states.
- Added reversible deletion with group-name confirmation, pending dismissal protection and selection cleanup after success. No permanent deletion control is exposed.
- Groups now includes a lazy-loaded Deleted groups section with confirmed restoration. Copy explains preserved records/memberships, paused expense schedules and skipped missed bill periods. Restoring does not automatically select the group.
- Mutations invalidate related group, membership and financial queries. Group-switch/navigation during pending settings operations cannot restore an old selection.

Validation: production build, full lint and 28 existing regression tests pass. Local Chrome checks against the running backend verified settings/activity rendering, currency locking and the deletion confirmation's disabled action and cancellation. No real settings, groups or memberships were modified. Save/delete/restore mutations, failure recovery, multi-page activity and mobile layouts still need end-to-end verification.

## Shared shadcn pagination

Expenses, Bills, settlement history and group activity now compose the existing local shadcn Pagination primitives through `components/ui/page-pagination.tsx`. Numbered pages, current-page indication, ellipses and accessible previous/next controls retain each feature's server pagination and filter state. Controls block navigation during loading and at the relevant page boundaries; narrow layouts wrap controls.

Validation: production build and full lint pass. Local Chrome confirmed group activity renders numbered pagination and disables previous/next on its single page. Multi-page and mobile interaction checks remain pending.

## Pagination browser verification

Tested the running frontend against an isolated, read-only fixture server exposing 12 pages for Expenses, Bills, settlement history and group activity. Desktop (1440×900), mobile (390×844) and narrow mobile (320×740) checks passed:

- Next, Previous, numbered jumps and first/last boundaries display the requested page's data and current-page marker. Requests stayed within pages 1–12.
- Middle activity pages show ellipses on both sides; controls wrap at 320px without horizontal document overflow. All four pages had document widths equal to their mobile viewports.
- Loading blocks pagination actions (Expenses/Bills hide their controls while fetching; history/activity disable them).
- Expense search remains in page-two requests. Bills retains separate Unpaid and History page states. Enter activates numbered navigation.

No application changes were needed. Fixtures used synthetic records, intercepted API requests locally and rejected mutations; no real records or account state were modified. This validates frontend pagination behavior, not production backend pagination correctness.

## Group settings lifecycle verification

Fixture-backed browser checks passed at desktop 1440×900 and mobile 390×844 and 320×740:

- Save trims names, persists name/currency/icon across reload and updates selected-group display. Blank names cannot submit; existing financial activity locks currency. Pending saves disable editing and deletion.
- Deletion requires the exact current group name; cancellation sends no mutation. Pending delete/restore dialogs prevent Escape dismissal and disable controls. Successful deletion clears the selection, redirects to Groups and survives reload.
- Deleted groups appear in the owner list. Restoration refreshes active/deleted lists, closes the confirmation and keeps the user on Groups without selecting the restored group.
- Simulated 503 responses for save/delete/restore preserve drafts/confirmation and support successful retries. Mutation logs verified trimmed update payloads and dedicated soft-delete/restore POST requests.
- Server-reported members see disabled settings and no save/delete actions even when the stored selection claims OWNER.
- Fixed a Groups header overflow found at 320px by allowing the branding/action row to wrap. Rechecked after reload: document width equals viewport width; delete/restore dialogs fit within the viewport.

Validation: production build, full lint, all 28 frontend tests and all 35 selected backend activity/currency/group-lifecycle regression tests pass. Backend tests mock storage; browser checks use an isolated in-memory fixture API. Real database writes, recurring workers and production recovery were not exercised.

## Dashboard spending periods and categories

- Dashboard now requests server-owned analytics for All time (default), This month and Last month. Query caching includes group and period; switching groups resets the period and never reuses another group's dashboard data. A labeled shared FormSelect stays available while loading or retrying errors.
- Spending totals, recent expenses and category rows follow the backend's UTC calendar period. Current balances, bill summaries and upcoming bills keep their existing scope, explained in the UI. Empty months keep current balances/bills visible.
- Added a category summary with server amounts, expense counts, percentages and proportional mint/green bars. Category rows and Recent Expenses' View all link open Expenses with the exact server date bounds; Expenses validates linked categories and real calendar dates before querying.
- Monthly comparisons use server-provided differences/percentages, describe the previous calendar month, flag the current month as in progress and explain the missing percentage when the comparison baseline is zero. No financial aggregation is duplicated in the frontend.
- Dashboard now uses shared native currency precision and UTC date formatting. Small-screen bill summaries stack to preserve readable amounts.

Validation: production build, full lint and all 31 frontend regression tests pass. All 34 backend dashboard-period/category/comparison tests pass. Isolated browser fixtures verified all three periods, category/date drilldown requests, current balance/bill scope, zero-spend months, zero-baseline comparisons, loading without stale-period results, failed-query retry, group/currency switching, PHP/JPY/KWD precision, and desktop/390px/320px layouts without horizontal overflow. No real records were changed; production analytics/database behavior was not exercised.

## Registration and password reset

Backend readiness was checked before implementation: `POST /auth/register`, `/auth/forgot-password` and `/auth/reset-password` already exist with validation, rate limits, code expiry and session invalidation. No backend edits were needed. Corrected the frontend registration response contract: registration returns a user without a token, so success offers an explicit sign-in action.

- Added public `/register`, `/forgot-password` and `/reset-password` routes and login links. All reuse the existing Divvy branding through a shared auth layout and local shadcn/Base UI controls.
- Registration trims names, normalizes email, validates confirmation and enforces backend-compatible password limits (at least 8 JavaScript characters and at most 72 UTF-8 bytes). Field errors are labeled; duplicate/service errors preserve drafts; pending requests disable controls.
- Reset requests preserve the generic account-existence response. The code form accepts exactly eight digits, including leading zeros, with password confirmation, 15-minute expiry guidance, a 60-second resend cooldown and a different-email action. Expired/invalid codes, rate limits, unavailable delivery and transient failures have visible feedback and retry paths.
- Reset success clears code/password state and local token/group/API state, then offers sign-in. Codes and passwords are never put in URLs or persistent storage. Existing-code entry is available without requesting another email.
- Added the user's requirement to check backend readiness before every new feature to `AGENTS.md`.

Validation: production build and full lint pass, along with 35 frontend tests and 25 backend auth/readiness/reset tests using mocked storage/transports. Isolated browser fixtures verified blank/confirmation validation, trimmed registration payloads, duplicate conflict, service retry, explicit sign-in, generic code requests, code length/leading zeros, invalid/expired recovery, pending locks, resend cooldown/countdown, different-email handling, 429/503 feedback, reset success and existing local-session cleanup. Desktop 1440×900 and mobile 390×844/320×740 layouts fit without horizontal overflow. Required reset email configuration keys are present in the local backend environment; real email delivery, real account creation and actual password changes were not exercised. Hosted delivery configuration remains a deployment concern.

## Notifications inbox

Backend readiness was checked first: the authenticated notification router exposes inbox, unread-count, mark-one-read and mark-all-read endpoints. Inbox pages contain up to 20 entries, scoped to the authenticated account. Current bill digests and pending invitations are discovered during reads, with deduplicated snapshots and no historical backfill. All nine backend inbox regression tests pass; no backend changes were required.

- Added lazy `/notifications`, a sidebar link and an unread bell in the application header and Groups page. Inbox access does not require a selected group. Counts are account-scoped; large badges display 99+ while accessible labels retain the exact number. Count failures do not display a misleading zero.
- Added shadcn pagination, unread styling, explicit mark-as-read and mark-all-read controls, refresh, loading/empty/error/retry states and readable local timestamps. Successful reads invalidate both inbox and unread-count queries. Failures preserve unread status and allow retries.
- Opening an invitation marks it read and opens Invitations without accepting anything. Bill links refresh active group memberships before switching to the notification's group and opening the bill/list. Unavailable groups remain in the inbox with an explanation; they are not silently marked read. Digests spanning multiple groups open Groups. Unknown future notification types remain readable without guessed destinations.
- Queries poll every 60 seconds while focused and refetch on focus. Enabled RTK Query's shared browser listeners so the existing focus/refetch settings work. Account/session checks prevent a pending notification action from navigating or changing group selection after the originating session is gone.

Validation: production build, full lint and all 39 frontend tests pass. All nine backend inbox tests pass. Isolated browser fixtures verified single/all-read count updates, failed-query and failed-mutation recovery, first/last pages and seven-page navigation, keyboard pagination, no-selected-group access, invitation/cross-group bill/multi-group destinations, unavailable membership handling, large unread counts, logout/login cache isolation and desktop/390px/320px layouts without horizontal overflow. Mutation logs confirmed opening an unavailable group sends no mark-read request. Real notifications were not marked read by these tests. Browser push delivery remains outside this feature; the current backend push transport accepts Expo device tokens.

## Receipt scanning

Backend readiness was checked before implementation: authenticated `POST /groups/:id/receipts/scan` accepts a single multipart `receipt` file (JPEG, PNG, WebP or PDF, up to 10 MB), verifies group access and returns transient extraction data for review. Local Tesseract OCR dependencies and bundled English data are installed, and the Docker runtime includes Poppler for PDFs (first three pages only). All nine backend receipt tests pass, including real local OCR, upload/access limits and cancelled-scan cleanup. No backend changes were required.

- Added Scan receipt to Expenses, a cancellable upload/review dialog, file validation, processing feedback and server error/retry messages. Closing the dialog or changing groups aborts an in-flight scan. The frontend does not retain a public attachment URL or persist the file.
- Review displays extracted merchant/date/currency/totals, item quantities/unit prices/line totals and backend warnings. Explicit acknowledgment is required before transferring data into the existing expense form. Currency mismatches block import; unknown currency requires confirmation against the group currency. No conversion is performed.
- Users can review a total-only equal-split draft or an itemized draft. Items use extracted line totals, never quantity multiplied again, and start with no member assignments. Missing values stay blank, incompatible currency precision is not rounded into the draft, and the existing expense validation/preview remains authoritative before saving.

Validation: production build, full lint and all 45 frontend tests pass. All nine backend receipt tests pass. An isolated browser fixture performed real OCR on the generated backend receipt image, verified required review, saved a total-only synthetic expense, and verified itemized quantity/line-total/tax import, required member assignments and a single synthetic save. Browser checks also verified unsupported-file rejection before upload, cancellation before submission, 320px/390px dialog fit and the 320px expense-form scrolling. Native file-chooser operations were exceptionally slow; service-error/mismatch/unknown-value/oversize and in-flight cancellation paths are covered by helpers/backend tests or source review rather than a complete browser matrix. PDF end-to-end OCR and real authenticated production scans remain unverified. No real expenses or personal receipts were used.

## Receipt camera capture

Checked the backend upload contract first: camera-produced JPEG/PNG/WebP files already use the existing multipart scan endpoint and 10 MB limit; no backend change is required. Added separate Take photo and Upload receipt buttons. The photo input requests `capture="environment"` and accepts supported image formats; the ordinary upload input also accepts PDFs and has no camera capture hint. Both share validation and the existing review flow, show the chosen filename and allow selecting the same file again. Cancelling a picker preserves the current selection.

Validation: build, lint and all 45 frontend tests pass. Browser DOM checks verified distinct camera/upload inputs, the rear-camera hint and PDF separation; 320px/390px layouts have no horizontal overflow. Physical-device camera capture remains unverified and depends on browser support; desktop browsers may open a normal file picker.

## Camera-photo OCR timeout mitigation

Investigated the reported Android scan timeout. The backend enforces a 60-second OCR deadline, while camera images were previously uploaded at their full pixel dimensions. Large-image OCR workload is a plausible cause; the exact failing phone image was not available to reproduce.

Added cancellable browser photo preparation before upload: images are bounded to a 2400px edge and four megapixels, preserve aspect/orientation, and are encoded as high-quality JPEG over white when resized. Smaller images and PDFs are unchanged. Controls remain locked during preparation and scanning. Preparation failures, server OCR deadlines and client network timeouts now have distinct actionable feedback. Existing upload limits and backend OCR safeguards are retained.

Validation: build/lint and 49 frontend tests pass. A browser harness exercised actual image decoding/canvas encoding and sent the optimized synthetic photo through the real local OCR service: 4000×3000 became 2309×1732, retained a readable PHP 224 total and completed preparation plus OCR in approximately 0.6 seconds. The built phone preview was refreshed; the original Android photo still needs a retry to confirm resolution on the user's device.

## Automatic camera scanning and scan progress

A valid file returned by Take photo now starts image preparation and OCR automatically, using the captured File directly rather than waiting for React selection state. Upload receipt retains the manual scan action. Empty/cancelled selections and invalid files do not start scans; synchronous in-flight guards continue to prevent duplicate requests.

Added a mint scan-progress card with a sweeping receipt scan line, skeleton text and spinner. Accessible status text distinguishes Preparing your photo from Scanning your receipt, and animations respect reduced-motion preferences. Cancellation remains available during both stages; expenses still require review and an explicit save.

Validation: build, lint and all 49 existing tests pass. An isolated browser preview verified both progress messages, active scan-line/spinner animations and 320px layout without overflow. Physical Android camera capture/automatic handoff still requires the user's device retry.

## Automatic scan mobile browser verification

Verified the actual Take photo control and camera-input change handler using a synthetic file returned through the browser file chooser. At 390×844, file selection immediately displayed Preparing your photo and then Scanning your receipt, without clicking Scan receipt. The scan-line, skeleton and spinner animations were active, source/submit controls were disabled during work, and the successful response opened receipt review with acknowledgment still required. Fixture logs confirmed exactly one OCR request and no expense writes.

Repeated at a fresh 320×740 viewport: the busy dialog stayed within the screen (680.8px height), had no horizontal overflow, and Cancel scan aborted its backend request. A separate Upload receipt selection stayed idle with the manual Scan receipt button enabled and did not increment the OCR request count. Total fixture results: two camera requests, one cancellation and zero saved expenses. No code changes were needed. The physical Android camera UI/hardware was not exercised; tests simulated the camera-returned file through the real file input. Native picker tooling was exceptionally slow, but both flows completed.
