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
8. ~~Session 9 interview/engineering courses + roadmaps + Explain with AI~~ — DONE (see below)

## Session 10 — E2E VERIFICATION AUDIT (COMPLETE)
- **Honest status: NOT all-perfect.** Claim of "everything works 100%" would be false. Verified items + real gaps below.
- **VERIFIED**: 44/44 course previews 200; 6/6 roadmaps 200; all lesson/content/access/SEO endpoints 200 (real slugs); search, navigation, learning-paths, gamification leaderboard/badges work; CSRF + auth gates enforce on payments/admin/tutor/code-exec; `/api/lessons/{slug}` for empty lessons returns `content_blocks: []` (the source of blank pages). Frontend: `tsc` clean, `pnpm build` green (36 routes), dev-server runtime zero errors, all key pages HTTP 200 (home, lesson, roadmap, pricing, leaderboard, dsa, admin-redirect).
- **AUTH E2E VERIFIED**: inserted a `UserSession` for `test_admin_fixture` (admin/pro) → `/api/auth/me`, `/api/gamification/profile`, `/api/gamification/streak` all 200 with real data (XP 2190, rank 1); `/api/tutor/explain` passed auth+CSRF+pro-gate+rate-limit+lesson-context and reached the Emergent proxy (`POST integrations.emergentagent.com/llm/chat/completions`) — failed ONLY at `budget_exceeded` (Emergent credits). Payments return clean 422 `field required` (no traceback leak); geo pricing 200.
- **REAL GAP — empty lessons (NOW RESOLVED — Session 11)**: `ai-engineering` 68 empty (79 total; 11 enriched by seed scripts), `mobile-system-design-interview` 10 empty (ch01 has 39 blocks). Same on both DBs. **Closed by curated deterministic backfill — no LLM/credits required.**
- **DATA-LOSS BUG FOUND & FIXED (`_pg.py`)**: `seed_course_data` overwrote existing non-empty `content_blocks` with `[]` on upsert. This **already wiped 11 enriched ai-engineering lessons on `algokube`** (staging kept them because enrichment ran last there). Fix: `if blocks and row.content_blocks != blocks:` — skeleton seeders can no longer clobber generated content. Verified: skeleton re-run on staging kept all 11; re-ran orchestrator `--only ai-engineering` on algokube → 11 lessons restored, counts unchanged (44/316/1261).
- **ORCHESTRATOR BUG FOUND & FIXED (`seed_production.py`)**: `--db` only affected backup/verify — subprocess seeders inherited env `DATABASE_URL` and ignored `--db`. Now `run_script` sets `env["DATABASE_URL"]=asyncpg_url(db_url)` so `--db` is authoritative. Verified live. `verify_post` now also reports `empty_lessons` and warns.
- **MANIFEST FIXED (`seed_production.py`)**: added the 5 Session-9 courses (`microservices`, `ml-system-design`, `concurrency-interview`, `lld`, `system-design-interviews`) → `seed_interview_engineering_courses.py`; corrected `ai-engineering` + `mobile-system-design-interview` descriptions.
- **NEW `scripts/generate_lesson_content.py`** (READY, blocked on credits): LLM backfill for empty lessons. `--list-empty` (finds 78), `--dry-run`, `--only <slug>`, `--all-courses`, `--limit`, `--model`, `--min-words`, `--db`. Safe: never overwrites non-empty content; validates JSON blocks; computes `read_time`; fail-fasts on auth/budget errors. Verified: `--list-empty` correct; fail-fast path works against budget-blocked key. `scripts/README.md` updated.
- **UX FIX (`ArticleContent.tsx`)**: empty `content_blocks` with access → graceful "Content coming soon" panel instead of blank page; `QuizComponent` only rendered when content exists. TSC + build green.
- **REMAINING BLOCKER (content only)**: Emergent Universal Key works (auth OK, proxy routing OK) but the account **budget is exceeded** (`Current cost: 163.14, Max budget: 160.93`). No longer blocks production content — all 78 empty lessons were filled with curated deterministic content (Session 11). Only affects optional LLM features (Explain with AI live generation, admin `/lessons/{id}/generate-content`) until credits are topped up / budget raised.

## Session 11 — EMPTY-LESSONS CLOSED (COMPLETE)
- **Goal met: ZERO empty lessons in production.** Curated deterministic content authored for all 78 empty skeleton lessons (`ai-engineering` 68 + `mobile-system-design-interview` 10) — no LLM, no Emergent credits, no budget dependency. Verified on BOTH DBs: `courses=44 sections=316 lessons=1261 EMPTY=0`.
- **NEW `scripts/backfill_content.py`**: `--list-empty/--only/--dry-run/--yes/--db/--verify`; `_load_library()` merges 8 content modules; `empty_lessons()`/`persist()` via `_pg` (never overwrites non-empty content; computes `read_time` from word count; `--verify` re-queries and exits 1 if any empty remain).
- **NEW content modules** (`backend/scripts/`): `content_lib_helpers.py` (block builders `h/h3/p/div/li/code/callout/table/bq`), `content_library_mobile.py` (10 chapters), `content_library_ai_eng_p1.py` (6), `p1b` (12), `p2` (12), `p2b` (6), `p3` (8 agents), `p3b` (19 architecture/production/optimization), `p4` (5 multimodal). ~32k words total, all blocks schema-validated (`heading/subheading/paragraph/list/code/callout/table/blockquote/divider`).
- **Fixed `p="..."` → `p("...")` authoring bug**: 176 lines across p1b/p2/p2b/p3 were written as assignment instead of function call (overwrote the helper import). Fixed programmatically (fix + double-paren collapse + restore); hand-fixed 3 more: bare `encoding="utf-8"` quotes in a callout (p1b:216), unescaped f-string quotes colliding with `"""` block close (p3:110, switched to `f'...'`), missing trailing comma after a `p(...)` (p3:573), and a mangled JSON-snippet escape in mobile (line 261).
- **Ran live on both DBs**: `scripts/backfill_content.py --yes --verify` against `algokube` AND `algokube_staging` → 78/78 written, **Verify: 0 empty remaining** on both. Spot-checked via API: `scaling-ai-applications` (26 blocks), `latency-optimization` (29), `vision-models-and-image-understanding` (32), `text-to-image-generation` (33), mobile ch11 (22) all served with real headings/code blocks.

## Session 9 (COMPLETE)
- **LLM provider DECIDED: Emergent Universal Key** (not Anthropic). Rationale: Universal Key is `sk-emergent-*`, one credential + unified billing off existing Emergent credits, and routes through an OpenAI-compatible proxy — so all 20+ existing `LlmChat`/`with_model("openai", "gpt-4.1-mini")` call sites work UNCHANGED (the codebase was originally built on `emergentintegrations.llm.chat`, which `app/core/llm_chat.py` replaced). Anthropic would have needed a separate paid account + SDK. Confirmed via `github.com/emergentbase/emergentintegrations` README: plain keys hit the OpenAI API (or `LLM_BASE_URL`), `sk-emergent-*` keys set `base_url` to `${INTEGRATION_PROXY_URL:-https://integrations.emergentagent.com}/llm`, plus `X-App-ID` header from `APP_URL`/`REACT_APP_BACKEND_URL` for attribution.
- **`llm_chat.py` now routes by key**: `LlmChat(api_key, ..., base_url=None, custom_headers=None)`; `_resolve_base_url()` → explicit `base_url` > `sk-emergent-*` → `INTEGRATION_PROXY_URL` env or Emergent proxy > `LLM_BASE_URL` env > official OpenAI. `with_model` is now chainable (returns self). `.env.local` updated with `EMERGENT_LLM_KEY` (config fallback already wired `settings.DEFAULT_LLM_KEY` → `EMERGENT_LLM_KEY`), commented `INTEGRATION_PROXY_URL`/`LLM_BASE_URL` overrides. Verified live: backend restart healthy (44/316/1261); direct `LlmChat` call with placeholder key now reaches `integrations.emergentagent.com/llm` and returns Emergent `AuthenticationError: Invalid API key` (previously hit `api.openai.com`). **BLOCKER: user must paste the real Universal Key into `.env.local` `EMERGENT_LLM_KEY`, then restart backend.**
- **5 new courses seeded live** (`backend/scripts/seed_interview_engineering_courses.py`, upsert-by-slug via `_pg.seed_course_data`; run with `PYTHONPATH=. .venv/bin/python scripts/...`): `microservices` (10/41, DevOps), `ml-system-design` (9/32, AI & ML), `concurrency-interview` (9/33, Interview Prep), `lld` (9/36, Interview Prep), `system-design-interviews` (10/39, System Design). Applied to BOTH `algokube` + `algokube_staging`; all now `status='published'`.
- **`ai-engineering` published** (`UPDATE courses SET status='published'`) on both DBs. **CAVEAT**: its 79 lessons are a title-only skeleton (seeder `seed_ai_engineering.py` writes empty `content_blocks`) — roadmaps render, but lesson pages are empty until content is generated (admin `/lessons/{id}/generate-content` or a future seed).
- **All 6 roadmap URLs live** (HTTP 200, verified via dev server + backend preview): `/learn/{microservices,ml-system-design,concurrency-interview,lld,system-design-interviews,ai-engineering}/course-roadmap`. Generic page `src/app/learn/[courseSlug]/course-roadmap/page.tsx` consumes `{course, stats, curriculum}` from `/courses/{slug}/preview` (returns lesson `slug`/`read_time`/`status`).
- **"Explain with AI" implemented**: backend `POST /api/tutor/explain` in `app/api/ai_tutor.py` (`ExplainRequest{lesson_slug,course_slug,text}`; pro-gated + rate-limited, lesson-context-aware, plain-language structured prompt). Frontend `Explain with AI` button in `src/components/ArticleContent.tsx` header — uses `window.getSelection()` text if the user selected a passage, else explains the whole lesson; inline collapsible panel with loading/Pro-upgrade/sign-in states. Verified live: auth + CSRF + context pipeline works (LLM call fails only because `DEFAULT_LLM_KEY` is a 6-char dev placeholder — prod key required).
- **`/n/dsa` broken link already fixed** (verified: Header.tsx, `navigation.ts`, and DB `navigation` header `more_items` all point to `/animations/dsa`; no `n/dsa` refs remain).
- **`src/config/courseConfig.ts`**: added `COURSE_ICONS`/`COURSE_COLORS` entries for the 5 new slugs + `Interview Prep`/`System Design`/`Product Management` `CATEGORY_META`.
- **Verify**: `npx tsc --noEmit` clean, `pnpm build` green (36 routes). Backend restarted (44 courses/316 sections/1261 lessons).

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
