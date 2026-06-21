## Goal
Production-ready Next.js 16 migration: axios → fetch-based api, alert() → sonner toast, all `@ts-nocheck` removed, all useEffect API calls use AbortController cleanup, zero TypeScript errors.
Additionally: make admin panel fully reactive (no manual reloads), replace all native `window.confirm()`, fix hydration/routing errors, prevent stale/cached data and toast crashes.
Plus: geo pricing with Clerk billing sync, PhonePe payment gateway integration.

## Constraints & Preferences
- Use `api` from `@/lib/api` (fetch-based, CSRF, credentials) — returns `{ data, status, ok }`
- Use sonner toast helpers from `@/lib/toast`: `showSuccess`, `showError`, `showInfo`, `showWarning`, `handleApiError`
- Use `showConfirm` from `@/lib/confirm` for all confirmation dialogs (renders a modal overlay via `createRoot`, returns `Promise<boolean>`). Re-exported through `@/lib/toast` for convenience.
- Never use `window.confirm()` - always use `await showConfirm(message)`
- `ApiError` has `.status` and `.detail` directly
- Every `useEffect` making API calls must use inline `AbortController` + `ac.signal.aborted` guard
- Prefer `useApi` hook for components that can be refactored to use hooks

## Progress
### Fully Migrated
- **0** axios imports remaining
- **0** alert() calls remaining
- **0** `@ts-nocheck` files remaining (AdminPanel.tsx fully fixed)
- **0** window.confirm() calls remaining
- **0** TypeScript errors (`npx tsc --noEmit` passes clean)
- **All 79 files** that used axios → `@/lib/api`
- **All 62 alert() calls** → sonner toast
- **All ~80 useEffect** API calls → AbortController pattern (inline `AbortController` + `ac.signal.aborted` guard)
- **All `window.confirm()` calls** (25+) → `await showConfirm()` using modal overlay

### Infrastructure Created
- `src/lib/api.ts` — fetch-based API wrapper with CSRF, credentials, typed responses
- `src/lib/toast.ts` — sonner toast helpers (includes AbortError guard, `showConfirm` re-export, `showPromise` safe detail fallback)
- `src/lib/confirm.tsx` — modal confirm overlay via `createRoot`, themed CSS vars, backdrop dismiss
- `src/hooks/useApi.ts` — React hook with auto-cancelling AbortController
- `src/hooks/useApiFetcher.ts` — simple api wrapper hook (no auto-cancel)
- `src/hooks/useCancelable.ts` — AbortController utility hook

### Files Fixed
All 174+ `.tsx`/`.ts` files migrated. Notable:
- All 34 admin components (AdminPanel.tsx included — 178 errors fixed, `@ts-nocheck` removed)
- All 8 home/animation components (SkillsCube, HeroCodeBlock, etc.)
- All 6 algorithm/visualization components
- All 6 article/ components (MermaidDiagram, ArrayWalkthrough, etc.)
- All 3 editor/ components (BlockEditor, RichTextEditor, EditorPreview)
- All store, context, config, hooks files
- SEO.tsx refactored to use native `<title>`/`<meta>` (no `react-helmet-async`)

### Reactivity & UX Fixes (Session 2)
- `cache: 'no-store'` on all 12 course-list fetches across admin + public pages
- All mutation handlers in AdminPanel (`CourseDetail`, `CourseDashboard`, `LearningPathManager`, `PricingEditor`) now `await fetchData()` + `navigate.refresh()`
- All fire-and-forget `fetchData()` calls converted to `await` (handleSave/handleDelete/handleDragEnd)
- `navigate.refresh()` added after `LessonEditor` and `SectionEditor` saves
- Admin routing params fixed: `matchAdminRoute()` returns `params` which are `{...spread}` into components; 4 sub-components (`CourseDetail`, `BulkLessonCreator`, `LessonEditor`, `SectionEditor`) switched from `useParams()` to destructured props
- `<button>` inside `<button>` hydration error in `PolicyEditor.tsx` fixed — outer toggle changed to `<div role="button" tabIndex={0}>`
- Admin header overflow fixed — `flex-wrap` on button containers
- Global scrollbar hiding via CSS (`scrollbar-width: none`)
- LearningPathManager `coursesRes.data.filter` crash fixed — `{courses: [...]}` response unwrapped before filtering

## Key Decisions
- Inline `AbortController` per-effect over global hook sharing for surgical control
- CertificatesPage: kept `BACKEND_URL` inlined for share URLs and download `<a>` hrefs
- AITutorPanel: kept per-session `Authorization: Bearer ${sessionToken}` headers
- `react-helmet-async` removed from deps; SEO uses native HTML title/meta tags
- `REACT_APP_BACKEND_URL` → `NEXT_PUBLIC_BACKEND_URL` across all files
- `next.config.ts` env shim removed (env vars in `.env`/`.env.local`)
- `showConfirm()` uses `createRoot` portal instead of `toast.custom` — avoids sonner rendering object content as React children; dismisses on backdrop click
- `handleApiError` silently swallows `AbortError` at the top — no AbortError toast shown across any component

## Payment Architecture

### Geo Pricing (PPP)
- Backend: `backend/app/api/payments.py` — 130+ country PPP tiers, live exchange rates from open.er-api.com + Frankfurter, 24h cache
- Frontend: `PricingPage.tsx` reads `/pricing/geo` endpoint, shows local currency + PPP discount banner
- PPP detection via `cf-ipcountry` header → `COUNTRY_TO_TIER` mapping → 4 discount tiers (0/20/40/60%)

### Subscription Flow
1. **Stripe**: Frontend calls `/checkout/create` → backend creates Stripe Checkout Session → user redirected to Stripe → success redirects to `/payment/success` → polls `/checkout/status/{session_id}` → backend activates subscription + syncs to Clerk metadata
2. **PhonePe**: Frontend calls `/checkout/phonepe/create` → backend initiates PhonePe payment → user redirected to PhonePe → callback POSTs to `/checkout/phonepe/callback` → frontend polls `/checkout/phonepe/status/{merchantTransactionId}` → backend activates subscription + syncs to Clerk metadata
3. **Clerk Sync**: After any payment success, `_activate_subscription()` in `payments.py` updates both the local DB (`User.subscription_status`) and Clerk's `publicMetadata` via `update_clerk_user_metadata()` in `clerk_auth.py`. The frontend reads subscription status from `clerkUser.publicMetadata` in `AuthContext.tsx`, so the UI updates without re-login.

### PaymentTransaction Model
- Supports both Stripe (`stripe_session_id`) and PhonePe (`phonepe_transaction_id`) — identified by which ID is non-null
- Statuses: `initiated` → `paid`
- User model tracks `subscription_status`, `subscription_plan`, `subscription_expires`

### Required Env Vars
```
# Stripe (existing)
STRIPE_API_KEY=
STRIPE_WEBHOOK_SECRET=

# Clerk (required for metadata sync)
CLERK_SECRET_KEY=

# PhonePe (required for PhonePe payments)
PHONEPE_MERCHANT_ID=ALGOKUBE
PHONEPE_API_KEY=
PHONEPE_SALT_KEY=
PHONEPE_SALT_INDEX=1
PHONEPE_ENV=UAT
```

## Next Steps
1. Run `pnpm build` for production build verification
2. Audit top useState-heavy components (LLDPractice, PDFCourseCreator, AITutorPanel, SystemDesignPractice) for potential zustand consolidation
3. Remove any remaining `@ts-ignore` comments if build allows
4. Ensure backend always returns `detail` as a string (or stringify in `api.ts` `request` function)
5. Create Alembic migration for `subscription_plan` and `phonepe_transaction_id` columns

## Critical Context
- `matchAdminRoute()` extracts params from `pathname`; render `<ActiveComponent {...route.params} />` spreads them into sub-components
- `fetchData()` in CourseDetail/LearningPathManager was fire-and-forget — now `await`ed with `navigate.refresh()` so UI waits for fresh data
- `handleApiError(err)` showed `"signal is aborted without reason"` on component unmount — fixed with early AbortError return
- Backend `detail` can be an object `{code, message, request_id}` → converted to string in `showPromise` fallback via `String(detail)`
- Clerk `publicMetadata` must be synced after payment — `update_clerk_user_metadata()` in `clerk_auth.py` is called from `_activate_subscription()` in `payments.py`

## Relevant Files
- `src/lib/api.ts` — core API wrapper (fetch, credentials, CSRF)
- `src/lib/toast.ts` — sonner toast helpers
- `src/lib/confirm.tsx` — modal confirm overlay
- `src/hooks/useApi.ts` — auto-cancelling api hook
- `src/hooks/useApiFetcher.ts` — simple api hook
- `src/types/index.ts` — shared TypeScript interfaces
- `src/store/` — zustand stores (auth, courses, settings, ui)
- `src/context/Providers.tsx` — root providers with sonner Toaster
- `src/components/admin/AdminPanel.tsx` — all admin routes, param pass-through, mutation handlers
- `src/components/admin/PolicyEditor.tsx` — button nesting fix
- `src/app/globals.css` — global scrollbar hiding
