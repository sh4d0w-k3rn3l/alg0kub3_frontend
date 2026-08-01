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

### Security & Correctness Fixes (Session 4 — COMPLETE)
- **Clerk metadata sync (P0)**: `update_clerk_user_metadata()` added to `app/core/clerk_auth.py` (PATCH `https://api.clerk.com/v1/users/{id}/metadata` with `CLERK_SECRET_KEY`); called from `_activate_subscription` in `payments.py` (fire-and-forget, never blocks payment). Frontend `clerkUser.publicMetadata` now flips to Pro after payment.
- **PhonePe checksum (P0)**: callback now verifies `X-VERIFY` = Base64(SHA256(saltKey + "/pg/v1/pay" + payloadB64 + saltIndex)); rejects forged COMPLETED events with 401.
- **PayPal fail-closed (P0)**: webhook rejects 401 when `PAYPAL_WEBHOOK_ID` unset (no more silent skip).
- **Admin auth (P0)**: `PUT /admin/plans/{plan_id}` (payments.py) now requires `verify_admin`; `/api/admin/stats` (admin_core.py) now requires `verify_admin_session`; `verify_admin` (admin_phase3.py) now checks `expires_at`; `activate_user`/`deactivate_user` persist `is_active` and delete sessions; auth gates disabled users (403) in `_resolve_clerk_user`/`_lookup_session_user`/`login`.
- **Validation error path leak (Session 6)**: `validation_error_handler` in `app/middleware/error_handler.py` was returning `str(exc)` for FastAPI `RequestValidationError`, which renders a Python traceback including absolute filesystem paths (e.g. `/home/.../payments.py`). Now extracts `exc.errors()` into a clean `field: msg` list; verified live (returns `origin_url: Field required` instead of a traceback).
- **ai_course.py**: all generate/status endpoints require admin + rate-limited (20/hr outline, 10/hr course).
- **Audit logging fixed**: `import admin_phase3` → `from app.api import admin_phase3` (5 sites in admin_api.py) — was silently failing, now audit log entries persist.
- **Leaderboard all-time (P1)**: reads `UserStreak.total_xp` instead of never-populated `LeaderboardEntry.total_xp` (was always empty).
- **Gamification badge-awarding (P1)**: `import gamification` → `from app.api import gamification` in progress.py/quiz.py (badges/streaks/leaderboard-rank now actually award).
- **Certificates (P1)**: `verify`, PDF, PNG now load real user_name + lesson/quiz counts via `check_course_completion` (was blank + zeros).
- **Affiliate (P1)**: `ref_code` persisted on User at signup; `record_payment_conversion` credits the *referrer* via `users.ref_code` (was crediting the payer's own affiliate record).
- **Search (P1)**: content matching streams ALL lessons (was `.limit(limit*2)` = first 40) and only returns lessons whose content actually contains the query.
- **LLM key resolution (P1)**: `resolve_key_for_feature` checks `assigned_features` list first, then falls back.
- **Code execution (P1)**: anonymous runs now recorded (user_id nullable) + stdout/stderr persisted.
- **Docker sandbox (P1)**: startup sync in `main.py` lifespan restores persisted `code_execution` settings (URL + API key) into `docker_runner` on restart.
- **Admin analytics (P1)**: MRR computed from real `PLANS` prices by `subscription_plan` (annual/12, lifetime full); tutor-usage `mastered`/`needs_review` from real flashcard status counts; system-health DB stats via `pg_database_size`/`pg_indexes` (real MB + index counts).
- Migration chain (both DBs): `d8f1a2c3e4b5` (users.is_active) ← `e6b2c4d8a9f1` (users.ref_code) ← `f9a3c5e7b2d4` (code_executions.user_id nullable) ← `c7d1e3f5a9b2` (code_executions.elapsed_ms) ← `d2b4a6c8e0f1` (api_metrics status counts). Head now `d2b4a6c8e0f1` (applied to both DBs).

### Mock-Data Elimination (Session 7 & 8 — COMPLETE)
- **Frontend**: removed all fabricated social proof — `HomePage.tsx` no longer shows `TRUST_COMPANIES`/`TESTIMONIALS`, the fake "Just launched" hero ribbon, ticker, or live student counter. Deleted `src/components/home/SocialProofTicker.tsx` + `LiveStudentCounter.tsx`. `PricingPage.tsx` no longer shows "X people claimed this deal" (removed `useSocialProof` hook + `social_proof_base/drift`). `whatsNew.ts` fallback emptied (only real `announcements` rows served). **Deleted the fabricated `/ai-engineering-for-beginners` launch page** (`AIEngBeginnersLaunchPage.tsx` + route; hardcoded 68 lessons/85 diagrams, lesson links 404'd; real course is `ai-engineering` with 79 lessons). Nav refs repointed to `/course/ai-engineering` in `navigation.ts`, `proxy.ts`, `CoursesMegaMenu.tsx` (launch banner removed), and in the DB `navigation` table (both DBs).
- **C3 api-metrics (Session 8)**: migration `d2b4a6c8e0f1` adds `status_2xx/4xx/5xx` columns; `flush_buffer` increments per-status; overview returns real `error_rate`/`total_errors`/status counts; slow_endpoints + trends return real error counts. Verified live (2815/5/0).
- **M8 ai_tutor.py `/stats`**: mastered=`got_it`, needs_review=`review` real flashcard status counts (was hardcoded 0).
- **M10 phonepe.py**: `_resolve_plan_amount_inr(plan_id)` resolves USD price via `_resolve_plan` (DB overrides honored) × live INR rate → paise; hardcoded `PLAN_AMOUNTS_INR` dict removed; checkout uses async amount.
- **M11 llm_keys.py**: seed-demo endpoint gated behind `LLM_SEED_DEMO_ALLOWED=1` (404 by default). Verified.
- **M12 gamification.py**: real `_compute_current_streak()` (lesson/quiz/progress-created days) + `check_streak_milestones()` writing real `Notification` rows (`type='streak'`, dedup by title); called from `progress.py` on completion.
- **M14 admin_api.py**: quiz-analytics `section_title` resolved from `Section` table for `hardest_quizzes` + `popular_quizzes`. Verified live with a temp row.
- **Session 7 backend**: C1 code-exec fail-closed provider (env-gated, no silent fallback to a hardcoded URL), C2 `social_proof` removed from `courses.py` responses, M1 spoofable client headers removed (clerk_auth fetch fallback), M4/M5 email_digest uses real MRR + real `pg_database_size`, M6 `elapsed_ms` migration `c7d1e3f5a9b2`, M7 affiliate leaderboard real counts.
- **DB stale-data cleanup**: `backend/scripts/cleanup_demo_data.py` (asyncpg, `--dry-run`/`--yes`/`--db`) ran against both DBs — deleted 2 initiated payment_transactions, 2590 expired admin_sessions, 4000 demo llm_usage_logs, 1 demo llm_credential (`id='default' AND api_key='demo'`). Real usage untouched.

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

### Production Seed Pipeline (Session 3 — COMPLETE)
- **`scripts/seed_production.py`** — THE single seed entry point (local + Railway console: `python scripts/seed_production.py --yes`). Covers all 39 courses. UPSERT-ONLY, non-destructive, never touches auth. Features: `--list`, `--dry-run`, `--only <slug>`, `--db <URL>`/`DATABASE_URL` override, `--yes`, `--skip-backup`, `--skip-verify`, pre/post row-count snapshot via asyncpg, optional pg_dump backup, pre-flight missing-script check. Uses `sys.executable` for subprocesses (no hardcoded venv — Railway-safe). `run_all_seeds.sh` is a thin wrapper; `scripts/README.md` documents everything.
- **Cleanup (Session 3.5)**: `scripts/` reduced from 321 → 43 files. **Deleted** all 279 legacy/dev files: Mongo-facade seeders (`seed_soft_skills_course`, `seed_devops_prereq_course`, `seed_aws_ai_practitioner`, `seed_ai_assisted_dev`, `seed_claude_code_course`, `seed_chatgpt`, `seed_google_translate`, `seed_gmail_smart_compose`, `seed_image_captioning`, `seed_ml_expansion`, all `*_diagrams`/`*_tables`/`*_images`, `seed_callouts`, `seed_llm_training_pipeline`), LESSON_ID patch scripts (`seed_what_are_llms`, `seed_tokenization`, `seed_advanced_prompting_techniques`, etc.), aieb modules (`seed_aieb_module_*`, `seed_ai_engineering_for_beginners_skeleton` — course not in prod), all `publish_dsa_*`/`_publish_*`/`_backfill_*`/`_walkthrough*`/`_matrix_*` DSA content scripts, image pipelines, scrapers, `seed_test_data.py`, `seed_gamification_profile.py`, `p1p2_enhance.py`, `seeddata` kept (imported by `seed_devops_prereq_pg.py`). No Mongo code exists anywhere in the backend (verified: app/, requirements, tests all clean).
- **Non-destructive conversions**: `_pg.seed_course_data` and `app/core/seed_helpers.py::seed_course` upsert by slug (preserve ids, update in place, no deletes); `seed_learning_paths.py` no longer wipes `LearningPath`/`LearningPathCourse`. `_seed_utils.seed_lesson_content` falls back to course/section/lesson **slug** lookup when the hardcoded lesson UUID is stale (fixes unique-slug collisions). `seed_what_are_embeddings.py` slug fixed → `what-are-embeddings-ai-engineering`. Stale "deletes" docstrings removed.
- **Verified against `algokube_staging`** (clone of prod, 39/269/1080): full pipeline green multiple times AFTER cleanup, pre/post counts identical (courses=39, sections=269, lessons=1080, bookmarks=1, progress=199, feedback=33), per-lesson user state preserved across full-course re-seed (lesson `58c65178-ccc5-4684-8ff1-d6a55c576d13` kept `completed=t, starred=t, notes='my notes'` through `seed_soft_skills_pg.py`).
- **PROD RUNBOOK (Railway console)**: `cd backend && python scripts/seed_production.py --yes` (DATABASE_URL already set in Railway env; starts with pg_dump backup; re-run-safe). For a single course: add `--only <slug>`. Orchestrator sets `PYTHONPATH=backend` for subprocesses.
- **NOTE**: backend `scripts/` is NOT under the frontend git repo (repo root is `algokube/frontend`); a safety archive of deleted files is at `/tmp/opencode/scripts_cleanup/scripts_before_cleanup.tar.gz`.

## Next Steps
1. ~~Run `pnpm build` for production build verification~~ — DONE (33 routes, passes)
2. ~~Audit top useState-heavy components for zustand consolidation~~ — DONE (all KEEP AS-IS except AITutorPanel, which was fixed in-place, see below)
3. ~~Remove any remaining `@ts-ignore` comments~~ — DONE (zero in `src/`)
4. ~~Ensure backend always returns `detail` as a string~~ — DONE (verified both ends)
5. AITutorPanel fixed (Session 5): `sessionToken` stub `''` → resolved via `useAuth().getAuthHeaders()`; tab switch no longer unmounts tabs — all four tabs always mounted, inactive ones hidden via `display:none` wrapper, preserving chat/quiz/flashcard/interview state across switches.
6. **Execute the prod seed run** (`scripts/seed_production.py --yes` against the real prod DB, using the runbook above)
7. ~~Session 7/8 mock-data elimination~~ — DONE (all backend M-items + C1-C3, frontend fabricated-social-proof removal, fake AI launch page deleted, DB nav repointed, stale DB data cleaned)

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
- `src/components/AITutorPanel.tsx` — 4-tab tutor panel; tabs always mounted (display:none when inactive), sessionToken resolved via `useAuth().getAuthHeaders()`
- `src/app/globals.css` — global scrollbar hiding
- `src/data/mockData.js` — 175 DSA algorithms (mock data for animations)
- `src/components/DSAHeader.tsx` — DSA section header with "Roadmap" link to `/learn/dsa/course-roadmap`
- `src/components/DSAAnimations.tsx` — DSA listing with "Course Roadmap" button
- `src/components/Sidebar.tsx` — course sidebar with "Course Roadmap" link at bottom
- `src/components/d3/D3BarChart.tsx` — D3 bar chart visualization
- `src/app/learn/[courseSlug]/course-roadmap/page.tsx` — generic course roadmap page
- `src/app/animations/dsa/[algorithmId]/page.tsx` — DSA algorithm animation page
- `backend/scripts/seed_dsa_course.py` — canonical DSA seeder (175 algorithms from mockData.js)
- `backend/scripts/seed_production.py` — production seed orchestrator (single entry point, `--dry-run`/`--only`/`--db`, pg_dump backup, pre/post verify, `sys.executable`)
- `backend/scripts/run_all_seeds.sh` — thin Railway wrapper around `seed_production.py`
- `backend/scripts/README.md` — seed docs (Railway + local usage)
- `backend/scripts/_seed_utils.py` — `seed_lesson_content` upsert with slug fallback + auto-create
- `backend/scripts/seed_learning_paths.py` — now upserts learning paths (no wipe)
- `backend/scripts/_pg.py` — `seed_course_data` upsert-by-slug (preserves ids, no deletes)
- `backend/scripts/seeddata/` — data package imported by `seed_devops_prereq_pg.py`
