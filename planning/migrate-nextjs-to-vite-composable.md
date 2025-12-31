# plan: Migrate `loomis-course-app` (Next.js) → `Vite + React + TS + Tailwind` (simple, incremental, fidelity-first)

## What changed based on your review

- No “parallel apps” workflow: use **legacy Next once** to capture baselines + add unit tests, then work primarily in the **new Vite app** and compare against saved baselines (manual).
- Reduce tooling: **no shadcn/ui**, **no DaisyUI** (you can add later if a real need shows up).
- No premature packages: **no `packages/`** right now; keep everything in `apps/web/src/` and use `apps/web/src/shared/` for shared logic.
- No enterprise-y automation: **manual visual verification** (screenshots + checklist), not Playwright.
- Porting style: **convert to Tailwind while porting** and **refactor fat components** as you move them.
- Postpone “design ideas promotion” infra: treat `design_ideas/` as **prototypes only** until the migration is complete.

---

## Current repo reality (so the steps stay grounded)

### Apps today

- **Legacy production app (Next.js)**: `loomis-course-app/`
  - Routes: `/` (marketing), `/login`, `/onboarding`, `/browser`, `/planner`, `/sandbox`
  - Styling: mostly **CSS Modules**, plus Tailwind used inside `/sandbox`
  - Global tokens + font: `loomis-course-app/src/app/globals.css` (local `@font-face` + CSS variables)
  - Persistent state: `localStorage` keys `plan`, `plannerV1`, `plannerV2`, and cookie `catalogPrefs`
- **Design ideas (Vite apps)**: `design_ideas/`
  - Workspace: `pnpm`
  - Apps use React + Vite; many use **Tailwind via CDN** + importmaps (prototype style)
  - One idea injects `GEMINI_API_KEY` into the client bundle (needs fixing for production safety)

### Key migration constraint

To preserve **1:1 visual fidelity** while changing frameworks:
- Lock down **fonts + tokens + global layout behaviors** first.
- Port routes **one-by-one** and verify visually against baselines.
- When porting a route, convert to **Tailwind as you go**, but allow tiny CSS files for cases Tailwind doesn’t cover well (keyframes, complex selectors).

---

## Target architecture (intentionally simple)

### Directory layout

```
apps/
  web/                # NEW: Vite + React + TS + Tailwind (becomes production)
design_ideas/         # prototypes only (leave as-is until migration complete)
planning/             # plans + checklists
```

### `apps/web/src/` structure (recommended)

```
apps/web/src/
  routes/             # React Router route components
  features/           # larger feature modules (browser/planner/onboarding)
  shared/             # shared types/utils/hooks (during transition)
  styles/             # globals.css, tailwind.css, small css helpers
  main.tsx
```

### Technology choices (minimal)

- **Frontend**: Vite + React + TypeScript
- **Styling**: Tailwind (compiled) + existing CSS variables (ported from `loomis-course-app/src/app/globals.css`)
- **Utilities**: `clsx` + `tailwind-merge` (you already use this pattern via `cn()`)
- **Icons**: optional (you already depend on `lucide-react`; keep if you want)

---

## Non-negotiables for visual fidelity

### Fidelity contract (Definition of Done per route)

For each migrated route, the Vite version must match the Next version on:
- Fonts (same files, weights, rendering)
- Colors/tokens (CSS variables)
- Spacing + layout (including header/padding behaviors like `.hide-wordmark`)
- Scroll behavior + overflow (especially `planner` and `browser`)
- Interactive flows (query params, localStorage persistence, onboarding redirect logic)

### Manual visual verification (preferred)

Keep this simple and repeatable:
- Save baseline screenshots from legacy Next in `planning/visual-baseline/next/`
- Save current Vite screenshots in `planning/visual-baseline/vite/`
- Use the same viewport each time: `1440x900`
- Keep a short checklist per route (“looks identical” + “core interactions work”)

---

## Phase 0 — Baselines + tests in the legacy app (so you don’t guess later)

Why this exists: once you stop using Next, you still need **ground truth** for behavior and visuals.

### 0.1 Inventory what must not change

Create a checklist table in this doc (or a separate `planning/migration-inventory.md`) with:
- Route
- Data dependencies
- Storage keys used
- Cookie usage
- Any non-default CSS behaviors (padding, fixed headers)
- Any “must match” screenshots (and which viewports)

### 0.2 Add a test runner to `loomis-course-app` (Vitest or Jest)

Goal: lock down **behavior** of your shared utilities before you move anything.

Minimum scope to test (start here, then expand):
- `loomis-course-app/src/lib/courseUtils.ts`
  - `canonicalizeDepartment()`
  - `normalizeTerm()`
  - `deriveTags()`
  - `filterCourses()` (most important)
  - `flattenDatabase()` (if used to build the in-memory list)
- `loomis-course-app/src/lib/plannerStore.ts`
  - localStorage migration behavior (`plannerV1`/`plan` → `plannerV2`)
  - default state shape

Deliverables:
- `loomis-course-app` has `npm run test` (or `pnpm test`) that runs locally.
- Unit tests cover edge cases (empty input, weird department strings, tag combinations, query search).

Acceptance:
- You can run tests repeatedly and trust failures as “real drift”.

### 0.3 Capture baseline screenshots (legacy Next)

Deliverable:
- `planning/visual-baseline/next/` with labeled screenshots per route + viewport.
- Baselines for each route at all viewports.

Notes:
- Do not change CSS yet.
- Capture with clean storage (fresh profile) AND with typical storage populated (planner filled).

Acceptance:
- You can reproduce the baseline screenshots on demand from the legacy app.

#### 🛑 CHECKPOINT [Phase 0]: Baseline Verification
> **STOP:** The agent must pause here.
**Agent Instruction:**
1. Perform the verification steps below.
2. Present the results to the user.
3. **Ask for user approval.** Do not proceed to Phase 1 until the user explicitly says "Approved" or "Proceed".

- [ ] **Tests Passing:** Run `npm run test` in `loomis-course-app`. All tests must pass.
- [ ] **Baselines Secured:** Check `planning/visual-baseline/next/`. Are screenshots present for all core routes (`/`, `/browser`, `/planner`) at all 3 viewports?
- [ ] **Data Integrity:** Verify `src/lib/courseUtils.ts` logic is covered by tests.

---

## Phase 1 — Create `apps/web` (Vite) with “same look” defaults

Why this exists: you need the **new runtime** before you can port routes.

### 1.1 Create `apps/web` (React + TS)

Recommended command (you can also do this manually):
```bash
pnpm create vite apps/web --template react-ts
```

### 1.2 Add Tailwind (compiled, not CDN)

Goal: Tailwind available, and your legacy global tokens/fonts are preserved.

Deliverables:
- `apps/web/src/styles/globals.css` (or similar) that:
  - Imports Tailwind
  - Imports/contains the legacy global tokens from `loomis-course-app/src/app/globals.css`

Critical: copy the font setup + CSS variables from:
- `loomis-course-app/src/app/globals.css`

### 1.3 Copy static assets needed for visual parity

Copy (or symlink) required legacy assets:
- `loomis-course-app/public/logo.svg`
- `loomis-course-app/public/fonts/*`
- landing images used by `/` and `/login`
- any `catalog*.json` files used by `CATALOG_PATHS`

Preferred path compatibility:
- Keep assets at identical public URLs (e.g. `/fonts/...`, `/logo.svg`, `/catalog.json`)

### 1.4 Add React Router with your real routes (empty shells first)

Routes to scaffold:
- `/` → marketing landing page
- `/login`
- `/onboarding`
- `/browser`
- `/planner`
- `/sandbox`
- `/sandbox/archive`

Acceptance:
- Every route renders without crashing and uses the shared globals (font + tokens).

### 1.5 Add Vitest to `apps/web` (so tests follow you)

Goal: reuse the same behavioral tests from legacy Next as you port utilities.

Deliverables:
- `apps/web` has `pnpm test` (or `npm run test`) and it runs fast.
- You can copy/move unit tests from `loomis-course-app` into `apps/web` as functions migrate.

Acceptance:
- `apps/web` can render a simple page that uses the same font and token colors as legacy.

#### 🛑 CHECKPOINT [Phase 1]: Shell Verification
> **STOP:** The agent must pause here.
**Agent Instruction:**
1. Perform the verification steps below.
2. Present the results to the user.
3. **Ask for user approval.** Do not proceed to Phase 2 until the user explicitly says "Approved" or "Proceed".

- [ ] **Dev Server Boots:** Run `pnpm dev` in `apps/web`. Does it start without errors?
- [ ] **Visual Shell:** Open `http://localhost:5173`. Do you see the correct font (e.g., custom webfont) and background color?
- [ ] **Global Tokens:** Inspect an element. Are CSS variables (e.g., `--foreground`) available?
- [ ] **Test Runner:** Run `pnpm test` in `apps/web`. Does it run (even if 0 tests)?

---

## Phase 2 — Incremental route porting (convert to Tailwind while you port)

Why this exists: this is the shortest path to “Vite replaces Next” without big-bang rewrites.

### 2.0 Porting rules (keep you fast + consistent)

- **Tailwind-first**: replace CSS module styles with Tailwind as you go.
  - Exception: keep a small CSS file for keyframes/complex selectors if Tailwind gets awkward.
- **Refactor while porting**: split “fat pages” into:
  - `apps/web/src/routes/<route>.tsx` (thin)
  - `apps/web/src/features/<feature>/*` (logic + UI)
  - `apps/web/src/shared/*` (types/utils/hooks)
- **Behavior locked**: when you move a utility into `apps/web/src/shared`, move its unit tests too.
- **No parallel runtime**: after Phase 0, rely on saved screenshots/tests for comparison; only run legacy Next if you truly need to re-capture a baseline.

### 2.1 Replicate legacy “wordmark padding / hide-wordmark” behavior

Legacy global behavior:
- `globals.css` applies top padding to the first child to avoid overlap with a fixed header.
- Pages opt out by applying `.hide-wordmark` to `html` or `body`.

Vite requirements:
- Apply the same `globals.css` rules.
- Ensure pages that currently add/remove `.hide-wordmark` still do so (marketing/app/sandbox).

Acceptance:
- Marketing + App pages don’t shift vertically compared to legacy.

---

### 2.2 Port `/browser` (and convert to Tailwind during the move)

Source reference:
- `loomis-course-app/src/app/(app)/browser/page.tsx`
- `loomis-course-app/src/app/(app)/browser/page.module.css`
- `loomis-course-app/src/lib/courseUtils.ts`

What to do:
1) Copy the page logic into `apps/web/src/routes/browser.tsx`.
2) Refactor into feature modules (example):
   - `apps/web/src/features/browser/BrowserPage.tsx`
   - `apps/web/src/features/browser/components/*` (filters, list, drawer, plan panel)
3) Move shared types/utils into `apps/web/src/shared/` (only what `/browser` needs).
4) Convert the CSS Module into Tailwind classes:
   - Start with layout containers + spacing + typography
   - Then refine micro-styles (borders, hover, transitions)
5) Verify behavior:
   - Catalog loads from the same URL(s)
   - Plan add/remove works
   - Query params (picker mode) work
6) Manual visual check against `planning/visual-baseline/next/`

Acceptance:
- Visual layout matches baseline at all three viewports.
- Utility tests moved to `apps/web` still pass.

### 2.3 Port `/planner` (Tailwind + refactor)

Source:
- `loomis-course-app/src/app/(app)/planner/page.tsx`
- `loomis-course-app/src/app/(app)/planner/page.module.css`

What to do:
- Keep localStorage keys the same (`plannerV2`, plus migration support).
- Convert grid + slots styling to Tailwind.
- Keep “print” behavior working (it’s a common regression).

Acceptance:
- Clicking slots navigates to picker mode in `/browser` with the same query string.
- Printing still works.
- `plannerV2` localStorage compatibility preserved.

### 2.4 Port `/onboarding` (remove Next server wrapper behavior cleanly)

Source:
- `loomis-course-app/src/app/(app)/onboarding/OnboardingClient.tsx`
- CSS modules it imports:
  - `loomis-course-app/src/app/(app)/onboarding/wizard.module.css`
  - `loomis-course-app/src/app/(app)/browser/page.module.css` (topbar reuse)

Important legacy behavior:
- Server wrapper currently checks cookies and injects an early redirect script.

SPA replacement (no SEO):
- Compute `showIntroDefault` client-side synchronously by checking `document.cookie` for `onboardingIntroSeen`.
- Keep the same cookie names and `localStorage` key `catalogPrefs`.

Tailwind conversion:
- Convert the wizard layout to Tailwind; keep tiny CSS only for any stepper/animation details that are painful in utilities.

Acceptance:
- No flicker on first load of onboarding.
- If prefs already complete, it redirects to `/browser` immediately.

### 2.5 Port `/` and `/login` (Tailwind + keep animations)

Source:
- `loomis-course-app/src/app/(marketing)/page.tsx` + CSS module
- `loomis-course-app/src/app/(marketing)/login/page.tsx` + CSS module

Notes:
- These pages often have the most “pixel” drift due to backgrounds, blur, and animation timing.
- Convert to Tailwind, but allow a small CSS file for keyframes and complex pseudo selectors.

Acceptance:
- Visuals match (background images, animations).
- Navigation to onboarding works.

### 2.6 Port `/sandbox` and `/sandbox/archive` (minimal)

Source:
- `loomis-course-app/src/app/sandbox/*`
- `loomis-course-app/src/app/sandbox/experiments.ts`

Acceptance:
- Sandbox index renders identically.
- Archive works.
- Toolbar behavior retained (or improved).

#### 🛑 CHECKPOINT [Phase 2]: Route & Visual Verification
> **STOP:** The agent must pause here.
**Agent Instruction:**
1. Perform the verification steps below.
2. Present the results to the user.
3. **Ask for user approval.** Do not proceed to Phase 3 until the user explicitly says "Approved" or "Proceed".

- [ ] **Route Completeness:** Are `/browser`, `/planner`, `/onboarding`, `/login`, and `/` implemented?
- [ ] **Visual Comparison:** Compare `planning/visual-baseline/vite/` screenshots against `planning/visual-baseline/next/`.
  - [ ] Font rendering matches?
  - [ ] Layout/spacing matches?
  - [ ] Colors match?
- [ ] **Interactive Check:**
  - [ ] Can you search for a course?
  - [ ] Does the planner drag-and-drop (or click-to-assign) work?
  - [ ] Does refreshing the page persist the plan?

---

## Phase 3 — Cutover (private app = simplest possible)

Why this exists: when all routes are ported and verified, you stop maintaining Next.

### 3.1 Decide the cutover moment

Cut over when:
- All routes exist in `apps/web`
- Manual screenshots match your baselines closely (or you explicitly approve diffs)
- Unit tests (utilities) pass in `apps/web`

### 3.2 Preserve user state (if you care)

Because this is your private app, you can keep it simple:
- Keep the same `localStorage` keys (`plannerV2`, `plan`, `catalogPrefs`) in the Vite app.
- If you deploy to the same origin, your browser storage will keep working.

Acceptance:
- `apps/web` is the primary app you run and deploy.

#### 🛑 CHECKPOINT [Phase 3]: Production Readiness
> **STOP:** The agent must pause here.
**Agent Instruction:**
1. Perform the verification steps below.
2. Present the results to the user.
3. **Ask for user approval.** Do not proceed to archiving until the user explicitly says "Approved" or "Proceed".

- [ ] **Build Success:** Run `pnpm build` in `apps/web`. Does it complete without errors?
- [ ] **Production Preview:** Run `pnpm preview`. Does the build work in the browser?
- [ ] **Data Persistency:** Verify `localStorage` migration works for an existing user (simulate by manually setting keys).

---

## Phase 4 — Post-migration (explicitly postponed)

These are good ideas, but not required to finish “Next → Vite”:
- “Promotion pipelines” for `design_ideas/`
- Embedded builds + iframe references
- Introducing component libraries (shadcn/ui, DaisyUI)
- Re-architecting into `packages/`

---

## Suggested milestones (small, practical)

- Milestone A (1–2 days): Phase 0 done (tests + baselines captured)
- Milestone B (1–2 days): Vite app boots with globals + router shells
- Milestone C (2–4 days): `/browser` + `/planner` ported + verified
- Milestone D (1–3 days): `/onboarding` + marketing/login + sandbox
- Milestone E (0.5–1 day): cutover + archive Next
