# GetYovo frontend: setup and handover guide

Last reviewed: 2 November 2026. This guide describes the repository as inspected on that date. It records observed behaviour, not a guarantee that every production flow has been tested.

## Working agreement for this project

1. Work on one requested task at a time.
2. Before executing commands or writing application code, first state a concrete plan: objective, files or systems in scope, likely effects on the live app, and how the result will be checked. Ask the project owner to approve that plan and give the command to proceed. A command for one task does not authorize the next task.
3. Do not implement application changes before that approval. Inspection permission alone does not mean permission to edit application code.
4. Update this documentation only when the project owner explicitly requests a documentation update. Do not treat an earlier documentation request as standing permission for later tasks.
5. Record every completed change in the change log below: date, request, files changed, commands run, verification, and anything still unresolved. Record user-run commands and observations separately from assistant-run commands.
6. Never invent missing credentials or configuration values. Request them from the person who manages the relevant service.
7. The project owner has chosen to keep the live API configuration. Do not change API endpoints without a new, explicit instruction.

The instruction to create this document and prepare the local `.env` was given explicitly. These two changes are the only implementation in this documentation step.

## What this repository contains

This is a single React frontend with three areas:

- Public website: landing, about, privacy policy, terms, and account deletion information.
- Superadmin dashboard: platform analytics and management of customers, vendors, riders, orders, transactions, payments, user and vendor wallets, referral activities, promotions, notifications, and settings.
- Rider web app: sign in, available and active orders, history, notifications, profile, and password flows.

The frontend is already online. The backend is a separate service at `https://api.getyovo.app/api/v1`. This repository does not contain backend source code or a database.

## First-time setup on a cloned repository

These are instructions for a human developer. Under the working agreement above, the assistant must wait for the owner's command before running any of them.

### Prerequisites

- Git, Node.js, and npm must be installed.
- The exact Node.js version used for production is not recorded here. Confirm it with the person managing deployment. Avoid changing Node versions in production without that information.
- Admin and rider credentials are required to inspect protected screens. Do not put passwords or access tokens in this repository.
- For rider push notifications, obtain the Firebase Web Push public VAPID key from the person managing Firebase.

### Windows PowerShell setup

From the cloned project directory:

```powershell
node --version
npm --version
npm ci
npm run dev
```

Open the local URL printed by Vite. `vite.config.js` requests port `4000`; if that port is occupied, Vite may print a different port. `npm ci` installs the versions in `package-lock.json` and is appropriate for a fresh clone.

### Checks and production build

```powershell
npm run lint
npm test
npm run build
npm run preview
```

`npm run build` writes generated files to `dist/`. `npm run preview` serves that built output locally. `npm test` runs Vitest against `src/**/*.test.{js,jsx}`. Passing lint, tests, or build does not prove that authenticated flows work against the backend.

### Important live API behaviour

Requests use `VITE_API_BASE_URL` when it is set. `.env.example` points local development at the staging API, `https://getyovo-staging-api.onrender.com/api/v1`. If that variable is missing, `src/config/apiConfig.js` falls back to the live API, `https://api.getyovo.app/api/v1`. Viewing public pages is different from performing an authenticated action: accepting an order, changing settings, deleting an account, recording a payout, or broadcasting a notification can affect the environment the frontend is pointed at. Do not change the API base URL without an explicit instruction.

## Environment and external services

The local `.env` is ignored by Git and currently contains the empty key below. Ask the Firebase manager for its value before using rider push notifications:

```dotenv
VITE_FIREBASE_VAPID_KEY=
```

Fill in the value after the equals sign, without quotes unless the value itself requires them, then restart the Vite server. Do not paste the value into documentation or commit `.env`. This is a Web Push public key, but it is still a configuration value that should come from the Firebase manager. Any Vite variable beginning with `VITE_` is included in browser-side code; do not put private server credentials there.

`src/api/api.js`, `src/api/axios.js`, and `src/hooks/useFCM.js` all use `API_BASE_URL` from `src/config/apiConfig.js`. Setting `VITE_API_BASE_URL` redirects those clients together. Restart the Vite server after changing `.env`.

Firebase client configuration appears in both `src/firebase.js` and `public/firebase-messaging-sw.js`. The service worker imports Firebase scripts from Google's CDN. Rider notifications require browser notification permission, service worker support, the VAPID key, and successful device-token registration with the backend. `public/firebase-messaging-sw.js` handles background notifications; `src/hooks/useFCM.js` handles registration and foreground messages.

`src/index.css` loads the Poppins font from Google Fonts. Rider map views build Google Maps embed URLs in `OrderDetails.jsx` and `ActiveOrder.jsx`. These are external browser dependencies, not local packages.

## Packages and why they are here

The authoritative versions are in `package.json` and `package-lock.json`. `^` in `package.json` allows compatible version updates; `npm ci` follows the lockfile.

| Package | Role |
| --- | --- |
| `react`, `react-dom` | Render components in the browser |
| `vite`, `@vitejs/plugin-react` | Local development and production build |
| `react-router-dom` | URL routing and nested layouts |
| `tailwindcss`, `@tailwindcss/vite` | Utility CSS generation |
| `@tanstack/react-query` | Server-data fetching, caching, and mutations |
| `zustand` | Client-side state; auth and rider stores are persisted |
| `axios` | HTTP client used by the notification broadcasting page; it shares the same API base URL and admin token refresh |
| `firebase` | Browser-side Firebase Cloud Messaging |
| `recharts` | Admin charts |
| `lucide-react` | Icons |
| `sonner` | Toast notifications |
| `date-fns` | Date formatting utilities |
| `eslint` and related plugins | Static code checks |
| `vitest`, `@testing-library/react`, `@testing-library/user-event`, `jsdom` | Frontend tests |
| `@types/react`, `@types/react-dom` | Editor/type information; source is JavaScript/JSX, not TypeScript |

There is no CSS component framework and no server-rendering framework.

## How the app starts

```text
index.html
  -> src/main.jsx
       -> React StrictMode
       -> QueryClientProvider (React Query)
       -> BrowserRouter (React Router)
       -> src/App.jsx (route definitions and global Sonner toaster)
```

`src/App.jsx` imports pages and defines the route tree. Admin pages render inside `AdminLayout` and `ProtectedRoute`. Rider app pages render inside `RiderLayout` and `RiderProtectedRoute`. Public marketing and legal pages render directly. Unmatched admin URLs and unmatched URLs elsewhere render `StatusPage` with code 404. Standalone status routes exist for 403, 419, 500, and 503.

## Route map

Routes below are frontend URLs, not API endpoints. Dynamic `:orderId` means that part of the URL is an order identifier.

| Area | Routes | Main source |
| --- | --- | --- |
| Public | `/`, `/about` | `src/pages/Home.jsx`, `About.jsx` |
| Legal/account | `/privacy-policy`, `/terms-and-conditions`, `/delete-account` | `src/pages/legal/`, `src/pages/account/` |
| Mobile legal/account | `/mobile/privacy-policy`, `/mobile/terms-and-conditions`, `/delete-account-mobile` | Mobile legal/account pages and `public/mobile/` HTML |
| Admin auth | `/admin/login`, `/admin/forgot-password`, `/admin/verify-email`, `/admin/reset-password`, `/admin/reset-success` | `src/pages/admin/auth/` |
| Admin dashboard | `/admin`, `/admin/analytics`, `/admin/customers`, `/admin/vendors`, `/admin/riders`, `/admin/orders`, `/admin/transactions`, `/admin/payments`, `/admin/wallet/vendor`, `/admin/wallet/user`, `/admin/wallet/user/balances`, `/admin/referral-activities`, `/admin/promotions`, `/admin/settings`, `/admin/push-notifications`, `/admin/vendor-management` | `src/pages/admin/` |
| Status | `/403`, `/419`, `/500`, `/503`, and any unmatched path | `src/pages/StatusPage.jsx` |
| Rider auth | `/rider/welcome`, `/rider/login`, `/rider/forgot-password`, `/rider/verify-otp`, `/rider/reset-password`, `/rider/success` | `src/pages/rider/onboarding/` and `auth/` |
| Rider app | `/rider/app/dashboard`, `/rider/app/order/details/:orderId`, `/rider/app/active-order`, `/rider/app/active-order/:orderId`, `/rider/app/history`, `/rider/app/notifications`, `/rider/app/profile` | `src/pages/rider/` |
| Rider profile password | `/rider/app/profile/reset/change-password`, `/forgot-password`, `/verify-otp`, `/new-password`, `/success` (all prefixed by `/rider/app/profile/reset`) | `src/pages/rider/profile/reset/` |

The mobile legal React routes redirect to static HTML under `public/mobile/`. Check both the React routes and those public HTML files when updating policy text.

## Directory guide

| Path | What to inspect there |
| --- | --- |
| `src/pages/` | Full page components, grouped by public, admin, and rider areas |
| `src/components/common/` | Public site Hero and Footer |
| `src/components/admin/` | Admin shell, navigation, route guard, and action dialogs |
| `src/components/rider/` | Rider shell, headers, and route guards |
| `src/config/apiConfig.js` | Shared API base URL: `VITE_API_BASE_URL`, otherwise the live API |
| `src/api/api.js` | Main `fetch` wrapper; refreshes an expired superadmin or rider token once |
| `src/api/superAdminTokenRefresh.js` | Shared superadmin refresh request |
| `src/api/axios.js` | Axios client currently used by admin push notifications |
| `src/store/useAuthStore.js` | Persisted login tokens, superadmin/rider identity, logout |
| `src/store/useRiderStore.js` | Persisted rider online/count display state |
| `src/store/useStore.js` | Sidebar and mobile-menu UI state; also contains starter counter state |
| `src/firebase.js`, `src/hooks/useFCM.js` | FCM initialization, token registration, foreground messages |
| `src/index.css` | Tailwind import, font, global scrollbars and animations |
| `src/utils/formatters.js` | Shared formatting helpers |
| `src/assets/images/` | Images imported into components |
| `public/` | Files served at fixed URLs, including favicon, mobile pages, and FCM service worker |
| `vite.config.js` | React/Tailwind plugins and local port |
| `vercel.json` | Rewrite for client-side routes |
| `eslint.config.js` | Lint rules |

## Data and authentication flow

Pages call API endpoints in `src/api/api.js` through methods named `get`, `post`, `postForm`, `patch`, and `delete`. The helper sends JSON for most requests, adds a bearer token when available, parses JSON responses, and throws errors with a status. After a 401 it refreshes once and retries. Superadmin refresh posts the saved refresh token to `/superadmin/auth/refresh` and keeps the existing refresh token. Rider refresh posts to `/rider/auth/refresh`. Each path uses one shared refresh promise so simultaneous 401 responses do not start multiple refresh calls. Push notifications go through `src/api/axios.js`, which uses the same base URL and the same superadmin refresh helper.

Admin and rider authentication share `useAuthStore`. It stores the access token, refresh token, and either `superAdmin` or `rider` in browser `localStorage` under `getyovo-auth`. The route guards inspect this client-side state to decide whether to show pages. The backend must enforce authorization for every protected API operation; a frontend guard alone is not a security boundary.

`useRiderStore` persists online state and order counts under `getyovo-rider`. `useStore` holds sidebar and menu state in memory. React Query caches fetched data in memory using query keys. Some rider screens fetch directly in effects; many admin screens use React Query. Mutations update server data, then some components invalidate query caches to refresh the screen.

Typical admin path: log in at `/admin/login` -> store returned auth data -> protected admin layout -> screen fetches dashboard data -> management dialog performs a mutation -> affected lists should refresh.

Typical rider path: log in at `/rider/login` -> store token and rider -> protected rider layout registers FCM token if available -> dashboard fetches available orders -> rider accepts an order -> active-order screen fetches and confirms delivery.

## Styling and design changes

The app uses Tailwind classes directly in JSX. The global font and a few shared animations/scrollbar rules are in `src/index.css`; there is no central design token file. Many colours are literal hex values in components, so changing a brand colour requires searching its usages. Public pages share `Hero` and `Footer`; admin pages share `AdminLayout` and `Sidebar`; rider pages share `RiderLayout` and rider headers. Start with a shared component only when the change is intended for all of its consumers.

The public pages use scroll-reveal effects with `IntersectionObserver`. Many image assets have multiple old or alternate versions; confirm which import a component uses before replacing an asset. Changes to legal content may need to be made in both JSX and `public/mobile/` static HTML.

## Deployment: known facts and missing ownership information

`vercel.json` rewrites all request paths to `/` so direct visits to React Router pages can load the app. `npm run build` produces `dist/`. The repository does not identify the hosting account, production deployment branch, build settings, environment variables configured on the host, DNS owner, rollback procedure, or person who approves deployment. Obtain and add those details before relying on this guide for a deployment.

No CI workflow was found during this review. Do not assume that a Git push automatically runs lint, build, tests, or a deployment gate. Confirm the actual hosting integration with its manager.

## Known limitations and follow-up checks

These observations are documented for takeover; this documentation task does not change application behaviour.

- Several React Query cache invalidations use array arguments (for example, rider notifications and some admin dialogs), while others use the object form expected by the installed React Query major version. Verify post-mutation refresh before relying on those screens.
- `RecordPayoutModal.jsx` passes `true` as the fourth argument to `api.postForm`, whose fourth parameter is named `extraHeaders`. Review and test this high-impact payout flow with the backend owner before modifying it.
- The public app-store buttons and footer social icons contain `href="#"` placeholders. Some admin header controls appear presentational only. Verify destinations before declaring them complete.
- The browser title is `getyovo`; starter Vite assets remain, and the background notification worker points its icon at `/vite.svg`.
- Vitest covers parts of the API client, dashboard, customers, promotions, referrals, user wallet, and two settings helpers. It does not cover the full admin or rider app. The documented Node version, deployment runbook, and original README are still missing. The dashboard chart can log a Recharts warning that its container measured width and height as -1. That warning comes from `ResponsiveContainer` using `height="100%"` inside a flex child; it is separate from a failed dashboard request.
- On 2 November 2026 the admin dashboard at `/admin` showed “Dashboard data couldn’t load” with “Failed to fetch dashboard” and HTTP 500 for `GET /superadmin/dashboard?page=1&limit=20` on the staging API. The frontend error state was behaving as written: it blocks the page and offers Retry. The owner confirmed the 500 was a missing database column on the API and that the column has been added. Do not store admin access or refresh tokens in this repository.
- Large JSX pages and repeated hardcoded styling increase the cost of design changes. Make small, reviewable changes and check public, admin, and rider views separately.
- Firebase notifications cannot be fully verified until the VAPID key is supplied and the relevant browser/backend permissions are available.

## Local setup and quality baseline

The owner ran `npm ci` successfully: 325 packages were added and 326 audited. npm reported 21 dependency vulnerabilities (2 low, 3 moderate, 15 high, 1 critical). Dependency audit findings are separate from source-code lint findings. No `npm audit fix` was run because automatic dependency changes may introduce compatibility problems. Review the audit under a separately approved task.

The owner ran `npm run dev`; Vite 7.3.1 served the app at `http://localhost:4000/`. The homepage loaded in Chrome and Opera. Brave initially showed a white page with Shields enabled. Disabling Shields for `localhost` fixed the local display; no application change was required.

### Lint cleanup completed on 17 October 2026

The initial `npm run lint` result was **107 errors and 3 warnings**. After the approved local cleanup, the measured full-project result is **0 errors and 3 warnings**. Full-project checks were run with the installed ESLint executable through Node because Windows PowerShell blocked the `npx.ps1` launcher.

The cleanup was performed in small groups and included:

- Added the correct service-worker globals to `eslint.config.js` for `public/firebase-messaging-sw.js`. The Firebase worker's runtime code was not changed.
- Configured `no-unused-vars` to accept uppercase component parameters used as JSX elements, such as `icon: Icon`. This avoids false positives. Because the pattern can also hide a genuinely unused uppercase argument, reviewers should still inspect such parameters.
- Removed confirmed unused imports, query result bindings, component arguments, state setters, and commented-out dashboard trend code. API calls and visible interactions were checked before each removal.
- Replaced empty catch blocks with explicit intent. Admin setting mutations keep the form open after their existing error toast; supplementary rider-count failures leave the existing count visible.
- Removed a redundant `try/catch` in the rider token retry wrapper. Rejected refresh and retry promises still propagate to callers naturally.
- Changed missing payment dates from a render-time `Date.now()` value to the truthful text `Date unavailable`.
- Replaced render-time summary refs in `Customers.jsx`, `Vendors.jsx`, and `Riders.jsx` with React Query `placeholderData`. Previous list and summary data remains visible while a new search, filter, sort, or page request loads; zero-valued summaries are used only before the first response.
- Changed delivery-fee, order-timing, and shop-type forms to mount only while open and initialize state directly from current data. Closing discards an unsaved draft; reopening creates a fresh draft from current settings or the selected shop type.

Files touched during the complete cleanup were `eslint.config.js`, `src/api/api.js`, selected admin pages and modal components, and the rider dashboard/history files. Package versions, live API URLs, Firebase runtime configuration, routes, and deployment configuration were not changed.

### Current lint warnings

Three `react-hooks/exhaustive-deps` warnings remain deliberately unresolved pending individual behavioural review:

| File | Current warning | Risk to review before changing |
| --- | --- | --- |
| `src/hooks/useFCM.js` | `onForegroundMessage` is missing from the effect dependency list | A careless dependency change could re-register messaging listeners or device tokens repeatedly |
| `src/pages/admin/Dashboard.jsx` | Selected order, rider, and vendor values are missing from a synchronization effect | Adding object dependencies could cause repeated modal-state updates |
| `src/pages/admin/Riders.jsx` | `selectedRider` is missing from a synchronization effect | Adding it without restructuring could create a state-update loop |

These warnings are not hidden or disabled. Handle them one at a time with focused lint, a production build, and manual verification of the affected flow.

### Verification performed and limits

- Focused ESLint checks passed for each repaired group.
- Final full-project ESLint result: **0 errors and 3 warnings**.
- `git diff --check` passed during cleanup checks.
- Vite production builds passed repeatedly after behavioural changes. The build reports a JavaScript chunk of about 1.23 MB before gzip; this is a performance warning, not a build failure.
- No package update, live API mutation, Git push, or deployment was performed as part of cleanup.
- Build and lint checks cannot prove authenticated behaviour. Before release, manually inspect customer, vendor, and rider filtering/pagination; modal open, cancel, reopen, and save behaviour; payment date display; and rider session refresh using authorized accounts and safe data.

## Change log

| Date | Request and authorization | Files changed | Commands/checks | Result / outstanding item |
| --- | --- | --- | --- | --- |
| 17 Oct 2026 | Owner explicitly requested `frontend_doc.md`, a one-task-at-a-time approval rule, and the required local environment key; live API must remain in place. | `frontend_doc.md`, local `.env` | Read-only inspection of repository configuration, routes, imports, and Git status; no install, lint, build, server start, or live API call. | Created handover guide and empty `VITE_FIREBASE_VAPID_KEY`. Firebase manager must supply its value. Deployment ownership and Node version remain unknown. |
| 17 Oct 2026 | Owner requested automatic documentation updates and a plan before any future command or application-code change; supplied local setup and lint results. | `frontend_doc.md` | Owner ran `npm ci`, `npm run dev`, and `npm run lint`; assistant read the supplied lint attachment and repository status. Assistant did not install, start a server, run lint/build, or call the API. | Recorded successful local setup, Brave Shields finding, 21 npm audit vulnerabilities, 110 lint findings, and a proposed staged lint plan. Application code remains unchanged; lint fixes await a separate command and approval. |
| 17 Oct 2026 | Owner approved the first lint task: declare Firebase service-worker globals in ESLint only. | `eslint.config.js`, `frontend_doc.md` | Inspected the worker and installed `globals` definitions. `npx eslint public/firebase-messaging-sw.js` could not start because PowerShell blocks the `npx.ps1` launcher. `node node_modules/eslint/bin/eslint.js public/firebase-messaging-sw.js` passed; `git diff --check` passed. | Declared service-worker globals and read-only `firebase` for the worker file. No runtime code, package, API, or deployment setting changed. The full-project lint count has not been rerun; the previous report contained seven worker `no-undef` errors. |
| 17 Oct 2026 | Owner approved a read-only, full-project lint review after the worker configuration change. | `frontend_doc.md` | Assistant ran installed ESLint through Node with JSON output, summarized rules and files, checked Git status and `git diff --check`; no API requests. | New baseline: 100 errors and 3 warnings in 23 files (down from 107 errors and 3 warnings). No application code changed in this review. Remaining findings are grouped above; next code fix requires a separate plan and approval. |
| 17 Oct 2026 | Owner approved a focused review and cleanup of three Analytics lint findings, followed by focused lint and a build. | `src/pages/admin/Analytics.jsx`, `frontend_doc.md` | Focused ESLint before: 3 errors. Removed only unused `useMemo` and `useMutation` imports. Focused ESLint after: 1 error (`Icon`, used in JSX). `git diff --check` passed. Initial Vite build attempt was denied access to `vite.config.js` by the sandbox; the same build was approved outside the sandbox and passed. | Analytics behaviour was not intentionally changed. Build output included a large-chunk performance warning. No push, deployment, API call, package update, or full-project lint run occurred in this task. |
| 17 Oct 2026 | Owner approved the next lint task after the Analytics review; plan limited changes to the JSX `Icon` false positives. | `eslint.config.js`, `frontend_doc.md` | Inspected nine reported `Icon` parameters and their JSX uses. Added `argsIgnorePattern` for uppercase component parameters. Focused Analytics lint passed; full-project ESLint JSON summary showed 89 errors and 3 warnings in 20 files; `git diff --check` passed. | Nine `Icon` false positives were removed without changing rendered code. The full lint command still has other findings. No package, runtime, API, or deployment change; no push. |
| 17 Oct 2026 | Owner approved a sequence of local cleanup tasks, then explicitly requested one clean and complete documentation update. | `eslint.config.js`, `src/api/api.js`, affected files under `src/components/admin/`, `src/pages/admin/`, `src/pages/rider/`, and `frontend_doc.md` | Ran focused and full ESLint checks, `git diff --check`, and repeated Vite production builds. The final measured lint result is 0 errors and 3 warnings; the final build passed with the existing large-chunk warning. | Removed all 107 original lint errors while preserving API endpoints and intended flows. Three dependency warnings remain for focused behavioural review. No packages were updated; no live API action, push, or deployment occurred. Manual authenticated checks remain required before release. |
| 2 Nov 2026 | Owner asked for a current read of the frontend, then a documentation update, then a diagnosis of the admin dashboard failing to load. The owner later reported the failure was fixed. | `frontend_doc.md` | Read routes, API client, dashboard page, tests, and environment example. A live call to the staging dashboard was not completed. No application code was changed. | The dashboard error card was showing the staging API’s HTTP 500 for `GET /superadmin/dashboard?page=1&limit=20`. The owner confirmed the cause was a missing database column and that the column has been added. The Recharts width/height warning is a separate chart-container measurement warning. Tokens supplied in chat were not written into the repository. |

For each future task, append a new row with the exact scope approved, files modified, verification performed, and any unresolved issue. Update the relevant sections of this guide when the project changes.
