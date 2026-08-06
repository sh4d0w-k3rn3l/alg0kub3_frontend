# AlgoMaster Scraper → AlgoKube Data Instructions

This document is the **single source of truth** for the AI agent that scrapes
content from **algomaster.io** and converts it into data that plugs **100%**
into the AlgoKube production database (Postgres) **without breaking anything**.

> Context: AlgoKube is purging its DB of all current course content and replacing
> it with AlgoMaster's content. Everything that currently exists in
> `courses`, `sections`, `lessons`, `learning_paths`, `navigation`, and the DSA
> animation data will be replaced by AlgoMaster equivalents.
>
> **HARD RULE: never touch auth/user tables** (`users`, `user_sessions`,
> `admin_sessions`, `user_progress`, `bookmarks`, `lesson_feedback`, `quiz_results`,
> `user_streaks`, `badges`, `leaderboard_entries`, `affiliates`, `notifications`,
> `discussions`, `certificates`, `payment_transactions`, `announcement_dismissals`).
> The purge is CONTENT-ONLY.

---

## 1. Mission

Scrape `https://algomaster.io` (all public course/lesson pages, course-roadmap
pages, and any embedded content) and emit **content payloads** that map 1:1 to
the AlgoKube schema described below. The payloads will be loaded by a seed
pipeline (`backend/scripts/`). Your output must be **deterministic, complete,
and schema-valid** — no placeholders, no TODOs, no "coming soon", no empty
lessons.

**Deliverable format:** a set of JSON files (one per course, e.g.
`algomaster_ai_engineering.json`, plus `algomaster_dsa.json` for the animation
dataset), validated against the schema in §4–§9, plus a `manifest.json`
indexing all slugs for cross-referencing.

---

## 2. What to scrape from algomaster.io

1. **Course roadmaps** — `https://algomaster.io/learn/<course>/course-roadmap`
   for every course. Capture the exact section titles, lesson/chapter titles,
   and their order.
2. **Every lesson page** for every course — full body content, code samples,
   diagrams, complexity tables, callouts, and problem links.
3. **Problem pages / practice problems** — any per-problem data (title,
   difficulty, topics, companies, LeetCode links) for the `problem_header`
   block.
4. **Visualizations/animations** — algomaster's DSA content has step-by-step
   visualizations. Capture the algorithmic data needed to reproduce them
   (§8 / §10).
5. **Images** — download and re-host locally; never reference algomaster's
   image URLs (§4, `image` block).

The 6 primary courses already targeted (current slugs):
`ai-engineering`, `ml-system-design`, `concurrency-interview`, `lld`,
`system-design-interviews`, `microservices` — plus a **DSA course** for the
animation dataset. Capture whatever else algomaster exposes and classify it.

---

## 3. Target data model

### 3.1 `courses` table
```
id          string (64)  — UUID, auto-generated, NEVER set it
title       string (255) — REQUIRED
slug        string (128) — REQUIRED, globally unique, kebab-case
description text         — REQUIRED (this drives roadmap + course card)
language    string (32)  — "python" (or the course's primary language)
icon        string (32)  — lucide icon name: bot|cpu|git-branch|layers|server|boxes|code|book-open|brain...
order       int          — global sort position
category    string (64)  — one of: "AI & Machine Learning" | "Interview Prep"
                            | "System Design" | "DevOps" | "Programming Languages"
status      string (16)  — "published"
```

### 3.2 `sections` table
```
id          string (64)  — UUID, auto
course_id   FK -> courses.id
title       string (255) — REQUIRED
slug        string (128) — REQUIRED, kebab-case, unique WITHIN the course
icon        string (32)  — "compass" for the Welcome section, "book" otherwise
order       int          — 1-based, matches roadmap order
course_slug string (128) — the owning course slug
```

### 3.3 `lessons` table
```
id              string (64)   — UUID, auto
section_id      FK -> sections.id (REQUIRED)
title           string (255)  — REQUIRED
slug            string (128)  — REQUIRED, GLOBALLY unique (unique index!)
                                kebab-case, lowercase alphanumerics + hyphens only
order           int           — 1-based within section
content_blocks  JSONB array   — REQUIRED (see §4). MAY NOT be empty/[]/null.
read_time       string (32)   — REQUIRED, format "<n> min read"
last_updated    datetime      — set by seeder
completed       bool          — default false (don't touch)
starred         bool          — default false (don't touch)
notes           text          — default "" (don't touch)
status          string (16)   — "published"
access_type     string (16)   — "premium" (leave as-is; gating is a separate concern)
course_slug     string (128)  — owning course slug
content_version int           — optional, leave unset
```

> **Slug collision rule (CRITICAL):** `lessons.slug` is a **globally unique
> index**. If two courses want the same lesson slug, the second one gets a
> `-<course_slug>` suffix automatically (handled by the seeder). **Your JSON
> must use the canonical plain slug for each lesson.** Never invent prefixed
> slugs yourself.

### 3.4 Route contract (frontend depends on these)
- Course roadmap page: `GET /api/courses/{course_slug}/preview` → `{course,
  stats:{total_lessons,total_sections,total_minutes,estimated_hours},
  curriculum:[{title,id,lessons:[{id,title,slug,order,read_time,status}],lesson_count}],
  first_lesson_slug}`. **Every course MUST have a lesson with slug
  `course-roadmap` in its FIRST section** (the roadmap page is that lesson).
- Lesson page: `GET /api/lessons/{slug}?course={course_slug}` → lesson object.
  Rendered by `frontend/src/components/ArticleContent.tsx`.
- Learn sidebar: `GET /api/sections?course_slug={slug}` → sections with lessons.

---

## 4. `content_blocks` — the content schema (MOST IMPORTANT)

`content_blocks` is a JSONB **array of ordered block objects**. Every block has
a `type` field. The frontend `ArticleContent.tsx` switch handles exactly these
types. **Use ONLY these types.** Any other type renders as a plain `<p>` (or
`null` if no text), which is a silent defect — do not ship unknown types.

Legend: ✔ required · ○ optional

### 4.1 Text blocks

**paragraph**
```json
{ "type": "paragraph", "text": "Supports **bold**, *italic*, `inline code`, [links](https://...)." }
```
✔ `text`. The renderer runs a mini-markdown pass: `**bold**` → `<strong>`,
`*italic*` → `<em>`, `` `code` `` → inline code, `[label](url)` → link.
Safe HTML tags (`<strong>`, `<em>`, `<code>`) also pass through.

**heading** — top-level section title (h2)
```json
{ "type": "heading", "text": "Problem Statement", "level": 2 }
```
✔ `text` · ○ `level` (default 2; 2/3/4 map to h2/h3/h4). This is your **H1-equivalent**.

**subheading** — h3
```json
{ "type": "subheading", "text": "Approach 1: Brute Force", "level": 3 }
```
✔ `text` · ○ `level` (default 3).

**list**
```json
{ "type": "list", "ordered": false, "items": ["first", "second"] }
```
✔ `items` (string[]) · ○ `ordered` (false → bullet `<ul>`, true → numbered `<ol>`).
Items may contain the same inline markdown as paragraphs.

**blockquote**
```json
{ "type": "blockquote", "text": "Quote text with **markdown**." }
```
✔ `text`.

**divider**
```json
{ "type": "divider" }
```
Horizontal rule — use to visually separate major sections.

### 4.2 Code blocks

**code** — single snippet
```json
{ "type": "code", "code": "print('hi')", "language": "python", "runnable": true, "title": "Solution" }
```
✔ `code` · ○ `language` (default "python") · ○ `runnable` (false) — when true,
the block gets a **Run button** wired to the sandbox
(`POST /api/execute-code`, languages: python, javascript, typescript, java, c,
cpp, go, rust, ruby, php, perl, bash, sql) · ○ `title` (shown above the code).

**codegroup** — tabbed language variants
```json
{ "type": "codegroup", "tabs": [
    { "label": "Python",     "language": "python",     "code": "def solve(): pass" },
    { "label": "Java",       "language": "java",       "code": "class S {}" },
    { "label": "C++",        "language": "cpp",        "code": "int main(){}" }
] }
```
✔ `tabs` (array of `{label, language, code}`). Use for multi-language problem
solutions. Tabs are NOT runnable.

### 4.3 Visual / data blocks

**mermaid** — diagram. Rendered by `frontend/src/components/article/MermaidDiagram.tsx` (mermaid v11).
```json
{ "type": "mermaid", "code": "flowchart LR\n A[Input] --> B[Process]",
  "title": "Pipeline overview", "caption": "Optional caption text.",
  "theme": "brand" }
```
✔ `code` (raw mermaid source) · ○ `title` · ○ `caption` · ○ `theme`
(one of `brand`, `brand-blue`, `brand-purple` — see §6).

**image**
```json
{ "type": "image", "url": "https://assets.algokube.in/...", "alt": "Alt text", "caption": "Caption" }
```
✔ `url` · ✔ `alt` · ○ `caption`. **URLs MUST be re-hosted** (download and serve
from our CDN/backend `/api/files`), never algomaster's origin.

**table**
```json
{ "type": "table", "headers": ["Complexity", "Best", "Avg", "Worst"],
  "rows": [["Time","O(n)","O(n log n)","O(n²)"], ["Space","O(1)","O(n)","O(n)"]],
  "headerColor": "#22c55e", "headerTextColor": "#000000" }
```
✔ `headers` (string[]) · ✔ `rows` (array of string[] — ALL rows same width as headers) · ○ `headerColor`/`headerTextColor` (default green/black). Cells are rendered as HTML — keep them plain text or simple `<code>`.

### 4.4 Rich interactive blocks

**callout**
```json
{ "type": "callout", "variant": "tip", "title": "Note", "text": "Emphasized text." }
```
✔ `text` · ○ `variant`: `note|info|warning|tip|error|complexity|insight`
(default "note") · ○ `title` (defaults to variant name capitalized).

**accordion**
```json
{ "type": "accordion", "items": [ { "title": "Why?", "content": "Answer text." } ] }
```
✔ `items` (`[{title, content|text}]`).

**tabs** (content tabs, distinct from codegroup)
```json
{ "type": "tabs", "tabs": [ { "label": "Summary", "text": "..." } ] }
```
✔ `tabs` (`[{label, text}]`).

**steps** — numbered process
```json
{ "type": "steps", "items": [ { "title": "Step 1", "text": "Do thing." } ] }
```
✔ `items` (`[{title, text}]`).

**card**
```json
{ "type": "card", "title": "Pricing note", "text": "Body", "href": "https://..." }
```
✔ `title` · ✔ `text` · ○ `href` (renders "Learn more →").

**problem_header** — algorithm problem metadata (only on algorithmic lessons)
```json
{ "type": "problem_header", "title": "Design Tic-Tac-Toe", "difficulty": "medium",
  "topics": ["Object Oriented Design", "Game"],
  "companies": ["Google", "Microsoft", "Amazon"],
  "leetcode_url": "https://leetcode.com/problems/design-tic-tac-toe/" }
```
✔ `title` · ○ `difficulty` (`easy|medium|hard`) · ○ `topics` (string[]) ·
○ `companies` (string[]) · ○ `leetcode_url`. **1 per lesson, placed right after
the intro** — never use algomaster's copyrighted problem text verbatim; write
your own paraphrase.

### 4.5 Animation blocks (DSA / walkthroughs)

**array_walkthrough** — step-by-step animated visualization
```json
{ "type": "array_walkthrough", "title": "Two Sum trace",
  "bare": false, "linked": false, "kind": "array", "steps": [
    { "array": [2, 7, 11, 15], "highlights": [0], "pointers": [{"name":"i","index":0}],
      "label": "Check 2", "description": "2 + 7 = 9 ≠ target",
      "code": "for (i=0; i<n; i++) { ... }" },
    { "array": [2, 7, 11, 15], "highlights": [0, 1], "pointers": [{"name":"i","index":0},{"name":"j","index":1}],
      "label": "Found pair", "description": "2 + 7 = 9 = target. Return [0,1]." }
  ] }
```
✔ `steps` · ✔ `title` · ○ `kind` (`array|stack` — stack sets stackMode) ·
○ `bare` (array-only, no pointers column) · ○ `linked` (linked-list rendering).
**Step schema** (all optional except at least one visual): `array: (number|string)[]`,
`matrix: (number|string)[][]`, `pointers: [{name, index, position: above|below}]`,
`highlights: int[]`, `finalized: int[]`, `swapping: int[]`, `label`, `description`,
`code`, `chart`, `tree`, `trie_nodes`, `graph_nodes`, `graph_edges`,
`graph`, `intervals`, `frames`, `scale`, `show_indices`, `edge_labels`,
`node_labels`, `path_overlay`, `path`, `visited`, `current`.
See `frontend/src/types/index.ts` `WalkthroughStep` + `ArrayWalkthrough.tsx`.

**walkthrough_storyboard** — filmstrip-style walkthrough
```json
{ "type": "walkthrough_storyboard", "title": "Merge sort phases",
  "steps": [ { "array": [3,1,2], "description": "Split", "code": "..." } ] }
```
✔ `steps` (same step schema) · ✔ `title`.

### 4.6 Interactive playground block

**playground** — embedded code runner (Monaco) with editable test cases + timer
```json
{ "type": "playground", "title": "Try it yourself",
  "starter_code": { "python": "def two_sum(...): ...", "java": "class S { ... }" },
  "languages": ["python", "java", "cpp", "javascript"],
  "test_cases": [ { "name": "Case 1", "input": "[2,7,11,15], 9", "expected": "[0,1]" } ],
  "timer": true }
```
✔ `starter_code` (dict language→code string, at minimum python + one other) ·
○ `languages` (defaults to starter_code keys) · ○ `test_cases` (`[{name,input,expected}]`)
· ○ `timer` (default true). Rendered by `frontend/src/components/article/Playground.tsx`.

### 4.7 Media blocks
```json
{ "type": "youtube", "videoId": "abc123", "title": "Video", "startTime": 30 }
{ "type": "vimeo",   "videoId": "123456", "title": "Video" }
{ "type": "loom",    "videoId": "xyz",    "title": "Video" }
{ "type": "video",   "url": "https://.../clip.mp4", "title": "Video", "poster": "...", "controls": true }
```
Use sparingly and only when the source lesson genuinely embeds a video.

---

## 5. Content structure per lesson (canonical ordering)

Every lesson's `content_blocks` MUST follow this skeleton (adapt to content type):

1. `heading` — lesson title (reuse the roadmap title verbatim).
2. `paragraph` — 2–4 sentence intro (drives SEO meta; must be real text, not filler).
3. *(algorithmic lessons only)* `problem_header`.
4. Body: mix of `subheading` + `paragraph`/`list`/`code`/`codegroup`/`table`/`callout`/`blockquote`.
5. A `mermaid` diagram for any concept that is diagram-worthy (§6).
6. `array_walkthrough` / `walkthrough_storyboard` for algorithmic steps (§4.5).
7. Optional `playground` for implement-it-yourself lessons (§4.6).
8. `callout` summary + `divider` + final `paragraph` takeaway.

**Minimum viable lesson:** ≥ 12 blocks (roughly 800+ words) for core lessons,
≥ 6 blocks for sub-topic lessons. **Zero empty lessons.** If a source lesson is
too thin, expand it with your own original explanation in the same voice.

---

## 6. Mermaid diagram guidance

- Theme: rotate `brand` → `brand-blue` → `brand-purple` across lessons (all
  three exist and render dark/light correctly).
- Diagram type by content (matches existing production style):
  - **LLD / OOP**: `classDiagram`
  - **Concurrency coordination / interaction flows**: `sequenceDiagram`
  - **Architecture / pipelines / system design**: `flowchart` (TD or LR)
  - **Lifecycles / state machines**: `stateDiagram-v2`
  - **Data models / schemas**: `erDiagram`
- Node labels: `A["Human Readable Label"]` — no raw `A --> B` without labels.
- Escape quotes: use `["Text with \"quotes\""]`.
- Multi-line: `<br/>` inside labels.
- Every mermaid block MUST pass `mermaid.parse()` (v11). Invalid diagrams are a
  hard failure. Validate with:
  `node /tmp/opencode/mermaid-check/validate.js` (requires the mermaid ESM
  namespace: `require('mermaid').default || require('mermaid')`).
- 610 existing production diagrams exist as reference style
  (`backend/scripts/content_diagrams_*.py`).

---

## 7. `read_time` computation

Formula used by the seeders: `word_count // 200` minutes, floored at 1:
```
words = sum(len((b.get("text") or b.get("code") or "").split()) for b in blocks)
read_time = f"{max(1, words // 200)} min read"
```
Apply this to every lesson in your JSON so the seed pipeline doesn't have to.

---

## 8. DSA course + animation dataset

The DSA course (`dsa`) is special: lessons are **algorithm pages** whose
interactive visualizations are driven by **frontend static data files** (NOT
content_blocks). To replace with algomaster DSA content you must produce a
**separate animation dataset** in the same shape:

- `frontend/src/data/mockData.js` — `algorithms: [{id, title, description,
  category, difficulty, timeComplexity, spaceComplexity}]` (175 entries today)
  + `categories[]` + `difficulties[]`.
- `frontend/src/data/algorithmInfo.js` — `algorithmInfo[id] = {description,
  howItWorks, whenToUse, interviewTip, relatedProblems: [ids]}`.
- `frontend/src/data/codeImplementations/<group>.js` — `{id: {java|python|
  javascript|typescript: "source"}}` for every algorithm, in at least 2 langs.
- `frontend/src/utils/animationEngine.js` — per-algorithm step generators
  producing `AnimationStep[]` (§4.5 step schema) — for the 175 current
  algorithms.

Produce an equivalent dataset from algomaster's DSA content (or keep + enrich
the existing 175 if algomaster's set is smaller). Algomaster DSA slugs map to
the `dsa` course sections (categories) and lessons (algorithms) in `courses`/
`sections`/`lessons` as normal content (seeded via `seed_dsa_course.py`).

---

## 9. Non-course content you must also produce

### 9.1 Learning paths (`learning_paths` + `learning_path_courses`)
Re-derive from algomaster's course ordering:
```json
{ "title": "AI Engineer Path", "slug": "ai-engineer",
  "description": "...", "icon": "brain", "difficulty": "Intermediate",
  "estimated_hours": 120, "order": 0,
  "courses": ["ai-engineering", "ml-system-design", "lld", "..."] }
```
`courses` = ordered list of **course slugs that MUST exist** in your output.

### 9.2 Navigation (`navigation` table, areas `header` + `footer`)
Two JSON documents. Header: `{primary_links, practice_items, more_items}`
each item `{id, label, path, is_new?, visible, order, desc?, icon?}`. Footer:
`{tagline, sections:[{id,title,visible,order,dynamic_courses,dynamic_courses_limit,links}]}`.
Re-point every course link to the new course slugs. Remove links to courses
that no longer exist (e.g. old `/ai-engineering-for-beginners`).

### 9.3 Announcements
Derive 1–2 real announcements from algomaster content (e.g. new course launch),
matching `{title, message, audience:"all", type:"general", active:true,
dismissible:true, link?}`.

### 9.4 Course config (frontend)
`frontend/src/config/courseConfig.ts` — `COURSE_ICONS`, `COURSE_COLORS`,
`CATEGORY_META`. Add/update entries for every new course slug you emit.

---

## 10. Content-quality rules (scraped → original)

1. **Rewrite, don't copy.** Do NOT dump algomaster's text/HTML verbatim —
   paraphrase into original teaching content. Code samples are fine to
   reproduce (they're the functional part), but surrounding prose must be yours.
2. **No copyrighted verbatim problem statements.** For problem_header, write a
   one-line own-words description + link to the LeetCode page.
3. **Code must run.** `runnable: true` blocks must actually execute in the
   sandbox. Test every snippet mentally: no undefined vars, valid syntax.
4. **No broken links.** All `href`/`leetcode_url`/`url` must be real, reachable
   URLs.
5. **No empty strings.** Every `text`/`title`/`description` non-empty.
6. **HTML safety.** Text content may use only `**bold**`, `*italic*`,
   `` `code` ``, `[link](url)` plus the inline tags `<strong>`, `<em>`,
   `<code>`. Do not inject `<script>`/`<img>`/`<iframe>` in text fields.
7. **Consistent tone.** Practical, interview-focused, developer-friendly —
   match existing production style (see `backend/scripts/content_library_*.py`).

---

## 11. JSON file format (final deliverable)

One JSON per course:
```json
{
  "schema_version": 1,
  "course": { "title": "...", "slug": "ai-engineering", "description": "...",
              "language": "python", "icon": "bot", "order": 1,
              "category": "AI & Machine Learning" },
  "sections": [
    { "title": "Welcome", "slug": "welcome", "icon": "compass", "order": 1,
      "lessons": [
        { "title": "Course Roadmap", "slug": "course-roadmap", "order": 1,
          "read_time": "2 min read", "content_blocks": [ ... ] },
        { "title": "Join the Community", "slug": "join-community", "order": 2,
          "read_time": "2 min read", "content_blocks": [ ... ] }
      ] }
  ]
}
```
Rules:
- First section of every course is **"Welcome"** with slug `welcome`,
  containing at least `course-roadmap` and `join-community` lessons.
- Lesson slugs: `[a-z0-9]+(-[a-z0-9]+)*`. No leading/trailing hyphens, no `--`.
- No duplicate slugs anywhere (globally across ALL files — the DB enforces it).
- `read_time` present on every lesson (§7).
- Every `content_blocks` array non-empty (§5).

`algomaster_dsa.json` (or equivalent) holds the animation dataset (§8).

`manifest.json`:
```json
{ "courses": ["ai-engineering", "..."], "lesson_slugs": { "ai-engineering": ["course-roadmap", ...] },
  "section_slugs": { "ai-engineering": ["welcome", ...] },
  "learning_paths": ["ai-engineer", "..."], "algorithms": ["bubble-sort", "..."] }
```

---

## 12. Validation checklist (run BEFORE handing off)

1. **JSON validity** — every file parses; keys exactly as documented.
2. **No empty lessons** — every lesson has `content_blocks.length ≥ 1`.
3. **Slug uniqueness** — no duplicate lesson slug across all files; kebab-case.
4. **Block types** — every block `type` ∈ the §4 set; no typos.
5. **Block shape** — required fields present; arrays typed correctly;
   `table.rows` widths match `headers`.
6. **Mermaid** — all mermaid `code` parses in mermaid v11.
7. **Read times** — every lesson has `<n> min read` with `n ≥ 1`.
8. **Welcome section** — every course starts with `welcome` containing
   `course-roadmap`.
9. **Code validity** — `runnable` snippets are syntactically valid in their
   declared language; playground `starter_code` has ≥ python + one lang.
10. **Ref integrity** — `problem_card.children`, `codegroup.tabs`,
    `accordion.items`, `steps.items`, `tabs.tabs`, walkthrough `steps` arrays
    all non-empty; `learning_paths.courses` slugs all exist in course files.

---

## 13. How the output is loaded (pipeline reference)

The JSON files are consumed by the existing seed infrastructure in
`backend/scripts/`:
- `_pg.py::seed_course_data(course, sections, lessons_by_section_slug)` — the
  canonical upsert entry point (§3 semantics, slug-collision suffixing,
  content-preservation safety net).
- `seed_production.py` — the orchestrator (`--yes`, `--only <slug>`, `--db`,
  `--skip-backup`). Add each new course file to its `MANIFEST`.
- `seed_learning_paths.py`, `seed_dsa_course.py` — §9.1 / §8.
- Purging: a one-time destructive script will delete all current content rows
  (`lessons`, `sections`, `courses`) BEFORE the new seed — this is the ONLY
  place deletion is allowed; nothing in your JSON deletes anything.

After loading, verify with:
- `npx tsc --noEmit` in `frontend/` (types stay clean).
- `pnpm build` in `frontend/` (routes render).
- Backend: hit `/api/courses/{slug}/preview`, `/api/lessons/{slug}?course=...`,
  `/api/sections?course_slug=...` — all 200 with real content.
- `backend/scripts/seed_production.py --skip-backup --yes` reports **0 empty
  lessons**.

---

## 14. Files you may reference (read-only) while working

- `frontend/src/components/ArticleContent.tsx` — authoritative block renderer.
- `frontend/src/components/article/Playground.tsx`, `ArrayWalkthrough.tsx`,
  `ArrayStoryboard.tsx`, `ProblemHeader.tsx`, `MermaidDiagram.tsx`.
- `frontend/src/types/index.ts` — `ContentBlock`, `WalkthroughStep`, `TestCase`.
- `frontend/src/components/CodeBlock.tsx` — runnable code UI + `/execute-code`.
- `backend/app/models.py` — Course/Section/Lesson/LearningPath/Announcement.
- `backend/scripts/content_lib_helpers.py` — block-builder helpers (reference
  for field names only; your JSON is the actual output).
- `backend/scripts/algomaster_curriculum.py` — current roadmap source of truth
  for the 6 courses (section titles, chapter titles, ordering).
- `backend/scripts/content_diagrams_*.py` — mermaid style reference.

---

## 15. Deliverable summary (final handoff)

- `algomaster_<course>.json` for every course (incl. DSA animation dataset).
- `manifest.json` (slug index).
- Validation report showing §12 items all green.
- Any new images downloaded to a local `assets/` dir with a mapping to where
  they must be uploaded (backend `/api/files` or CDN).

**Definition of done:** a full purge of current content + load of your JSON
produces a live site where every roadmap renders, every lesson has real
content, every mermaid parses, every animation plays, every code block runs,
and `npx tsc --noEmit` + `pnpm build` are green with zero broken links.
