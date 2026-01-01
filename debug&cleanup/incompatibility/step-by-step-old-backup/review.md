## Review: “incompatibility” workflow (Next.js production + Vite prototypes → Next.js sandbox → promotion)

**Location reviewed**

- **Overview + invariants**: `planning/migrate-nextjs-to-vite-composable.md`
- **Executable runbooks**: `debug&cleanup/incompatibility/step-by-step/` Phase 0–5
- **Repo reality spot-check** (to validate docs match code): `loomis-course-app/*` (Tailwind, theme, sandbox CSS, storage schemas, scripts, tests)

**Last updated**: 2026-01-01

---

## Executive summary

### What the workflow actually does (vs what the naming implies)

Despite the filename `planning/migrate-nextjs-to-vite-composable.md`, the current workflow **does not migrate the production app from Next.js to Vite**. It is a **fidelity-first intake and promotion workflow**:

- Keep **existing production routes** visually/behaviorally stable
- Port **Vite-exported prototypes** into **Next.js `/sandbox`**
- Validate parity
- Promote to production safely

This is a strong and sensible approach for “prototype → production” integration, but it’s **misnamed** and can confuse contributors.

### Overall assessment

- **Strengths**: solid phased approach; correct emphasis on baselines; clear Tailwind v4 + Preflight risk framing; sensible promotion concept (“move-and-import wrapper”).
- **High-risk issues**: inconsistent “working directory” + path usage (runbooks not always executable); several snippets are incorrect or unsafe if copy-pasted; sandbox theme/token/Tailwind setup currently contradicts app invariants; Phase 5 has markdown formatting issues (broken fences) and rollout guidance that’s not industry-standard.
- **Top recommendation**: treat this as **two separate initiatives**:
  1) **Prototype intake + promotion** (current plan; rename docs accordingly), and  
  2) **Full Next.js → Vite composable migration** (create a separate, explicit plan if you truly want it).

---

## Goals/invariants (as stated) vs coverage (what the runbooks guarantee)

### Stated non-negotiables (overview)

The overview defines correct invariants: protect production visual/behavior stability, localStorage/cookies, and theme semantics (`data-theme`, Proxima Nova).

### Where the runbooks fully align

- Phase 0 focuses on baselines + tests (good gate).
- Phase 2 treats Tailwind Preflight as risky and emphasizes token ownership + dark mode selector correctness (good).
- Phase 4 mandates evidence-driven parity checks (good).

### Where coverage is incomplete / under-specified

- **Behavior invariants** (onboarding redirect logic, browser↔planner interaction, print behavior) are not fully covered by automation in Phase 0 (unit tests only). Visual baselines alone are insufficient.
- **Theme semantics**: current repo uses `data-theme`, but sandbox currently uses `.dark` and overrides `:root` tokens (direct conflict with invariants).
- **Rollout safety**: Phase 5 asserts “no feature flags required” which is not generally best practice for high-impact UI refactors.

---

## Evidence-based repo reality (what’s true today)

These facts matter because multiple runbook steps depend on them.

- **Theme system uses `data-theme` (not `.dark`)**
  - `loomis-course-app/src/app/ThemeToggle.tsx` sets `data-theme` on `html` + `body`.
  - `loomis-course-app/src/app/globals.css` defines theme tokens keyed off `[data-theme="dark"]`, `[data-theme="light"]`, and `:root:not([data-theme])` for system default.

- **Sandbox CSS currently conflicts with the invariants**
  - `loomis-course-app/src/app/sandbox/sandbox.css`:
    - imports Tailwind directly (`@import "tailwindcss";`)
    - defines `@custom-variant dark (&:is(.dark *));` (mismatch with `data-theme`)
    - defines many tokens at `:root` and `.dark` (can overwrite app token meaning)

- **Tailwind content scanning is sandbox-only today**
  - `loomis-course-app/tailwind.config.ts` `content` includes only `./src/app/sandbox/**`.

- **Planner storage schema differs from Phase 0 example**
  - `loomis-course-app/src/lib/plannerStore.ts` uses `plannerV2` with `{ version: 2, selectedCourses: [], grid: ... }`.
  - Phase 0’s “populated” localStorage snippet uses a different object shape (`courses`, `schedule`, `metadata`) and is likely to break the app if pasted.

- **Tests already exist (Phase 0 prerequisites mostly satisfied)**
  - `loomis-course-app/tests/lib/courseUtils.test.ts`
  - `loomis-course-app/tests/lib/plannerStore.test.ts`
  - `loomis-course-app/package.json` has `test:run` script.

---

## Cross-cutting issues (highest priority)

### 1) Working-directory and path-prefix inconsistency (high impact)

Multiple runbooks say “Working directory: `loomis-course-app/`” and then use paths like `loomis-course-app/src/...` in commands. If a user literally follows both, paths become wrong (`loomis-course-app/loomis-course-app/...`).

**Recommendation (pick one convention and enforce it everywhere):**

- **Option A (recommended)**: “Run from repo root; only `cd loomis-course-app` for npm commands.”  
  - Pros: stable; fewer accidental path errors; easier to reference both `design_ideas/` and `loomis-course-app/`.
  - Cons: slightly more verbose paths.

- **Option B**: “Run from `loomis-course-app/`; never prefix paths with `loomis-course-app/`.”  
  - Pros: shorter paths.
  - Cons: frequent context switching when referencing `design_ideas/` and debug docs.

Add a single “Path convention” section at the top of the overview and remove ambiguity.

### 2) “Hard rules” contradict “escape hatches”

The overview says “remove styled-components” as a hard rule, but Phase 3 adds a styled-components escape hatch. Either:

- allow styled-components as a controlled exception (and reflect that in the overview), or
- remove the escape hatch and require Tailwind/CSS Modules only.

### 3) Unsafe or incorrect copy-paste snippets

Examples:

- Phase 0 “populated localStorage” uses the wrong `plannerV2` schema.
- Phase 1 asset copy script is not correct as written (Dirent fields are wrong; `glob` import is wrong).

**Recommendation:** any snippet that is intended to be executed should be:

- generated from the real codebase’s types/schemas, or
- explicitly labeled **pseudocode** with a “DO NOT COPY/PASTE” warning.

### 4) Theme + Tailwind dark variant is under-specified (system theme edge case)

The app’s “system” mode removes `data-theme`, relying on `prefers-color-scheme` tokens. If Tailwind’s `dark:` variant is wired only to `[data-theme="dark"]`, then **Tailwind dark utilities will not activate in “system dark”**.

**Recommendation:** explicitly decide and document one of:

- **A (simplest):** Tailwind `dark:` follows only explicit dark selection (acceptable if documented).
- **B (best UX):** ensure system-dark produces a deterministic selector that Tailwind can match (e.g., set `data-theme="dark|light"` derived from media query when theme=system).

### 5) Rollout best practices missing in Phase 5

Phase 5 currently says “No feature flags required.” This is risky for major UI replacements (especially `/browser` which interacts with `plan` storage and onboarding flows).

**Recommendation:** add at least one minimal rollout control:

- a query param toggle, env flag, or route group that keeps old UI available
- explicit rollback plan (including how to preserve user storage semantics during rollback)

---

## Phase-by-phase review and recommendations

## Phase 0 — Baselines + tests (legacy app)

### What’s good

- Correctly requires a gate: tests + build + visual baselines.
- Repo already has Vitest and some core tests.

### Issues

- “Populated state” instructions can break the app due to incorrect localStorage schema.
- Only unit tests are emphasized, but invariants include onboarding redirects, browser↔planner interactions, and print mode.

### Recommendations

- Add a minimal **smoke E2E** layer for key flows (even 3–6 tests provides disproportionate value):
  - onboarding “intro seen” cookie/localStorage logic
  - browser add/remove plan items and persistence
  - planner load/migration and persistence
  - theme toggle toggles `data-theme` and UI remains readable
  - planner print mode shows correct elements
- Ensure baseline tooling supports **clean** and **populated** states using the **real schemas** (derive from `plannerStore` + browser plan logic).

## Phase 1 — Inventory + standardization (design ideas intake)

### What’s good

- Correctly identifies unsafe patterns in prototypes (CDN Tailwind, external fonts, importmaps, secrets).

### Issues

- The asset-copy script snippet is not implementable as written.
- Sandbox stub creation in Phase 1 is fine, but it couples inventory and implementation; consider making stubs optional if you adopt “features-first” structure (see Phase 3/5 notes).

### Recommendations

- Replace the asset copy snippet with a vetted approach (or require manual asset localization with a strict checklist).
- Extend the inventory template to include:
  - list of all CSS assumptions (reset expectations, Preflight reliance)
  - fonts expected
  - icon set
  - any “data sources” (mock vs real)

## Phase 2 — Tailwind global and stable (Next.js app)

### What’s good

- Correctly treats Preflight as high regression risk given existing `globals.css` resets.
- Correctly flags token ownership and `data-theme` dark mode requirement.

### Issues (today)

- Current repo imports Tailwind only via sandbox (`sandbox.css`), and sandbox defines tokens at `:root` + `.dark` that conflict with production invariants.

### Recommendations

- Add a “Current state → Target state” table at the top of Phase 2.
- If you introduce a global Tailwind entry:
  - ensure sandbox stops re-importing Tailwind (avoid double generation and conflicts)
  - scope any sandbox-only token overrides under a `.sandbox-scope` wrapper (not `:root`)
  - align Tailwind `dark:` variant with your theme decision (explicit or system-aware)

## Phase 3 — Sandbox integration (fidelity-first)

### What’s good

- Clear, practical porting rules (no CDN assets; prefer Tailwind; use CSS Modules when needed).
- Encourages absolute imports (supported by tsconfig).

### Issues

- Styled-components escape hatch contradicts “hard rule” language elsewhere.
- The example “smoke tests” in Phase 3 reference a `src/features/...` structure that isn’t created until Phase 5, which can confuse the intended order.

### Recommendations (industry-standard structure)

- Use a **features-first** structure earlier:
  - create `src/features/...` at or before Phase 3
  - keep `page.tsx` files as thin wrappers
  - write tests against `src/features/...` components (stable import paths)
- For any API integration (e.g., Gemini):
  - do not call third-party APIs directly from client with secrets
  - prefer Next route handlers (server-side) + safe client consumption
  - provide deterministic mock mode for parity testing

## Phase 4 — Visual parity validation

### What’s good

- Forces evidence-based decisions; establishes a repeatable screenshot process.

### Issues

- Adds optional Playwright toolchain, but the repo already uses Puppeteer for baseline capture. Fragmentation increases maintenance.

### Recommendations

- Consolidate on **one** screenshot stack:
  - either extend the existing Puppeteer baseline tooling to capture parity sets
  - or migrate both baseline + parity capture to Playwright (preferred long-term)
- Document:
  - naming convention for screenshots
  - how to handle animations (disable, pause, or capture at deterministic time)

## Phase 5 — Promotion to production

### What’s good

- “Move-and-import wrapper” is a strong anti-duplication pattern.
- Correctly calls out Tailwind `content` scanning must include `src/features/**` once promoted.

### Issues

- Some markdown formatting appears broken (code fences).
- “Copy vs move” language is inconsistent (intro says “copy”, steps say “do NOT copy”).
- Path/working-directory inconsistency is especially dangerous here (moves are destructive).
- Rollout guidance is too casual (“no feature flags required”).

### Recommendations

- Fix markdown formatting and enforce a “runnable runbook” style:
  - every block is executable
  - every command assumes one consistent working directory convention
- Add a minimal rollout strategy:
  - keep old `/browser` behind a simple toggle until confidence is high
  - document rollback steps including how to avoid storage incompatibilities
- Add an explicit “storage compatibility” checklist for `/browser` promotion:
  - `localStorage.plan` compatibility preserved
  - onboarding reset behavior unchanged
  - browser/planner navigation semantics unchanged

---

## Specific doc-level improvements to make this “industry-standard”

### Rename/restructure to avoid goal confusion

If the real goal is prototype intake + promotion:

- rename `planning/migrate-nextjs-to-vite-composable.md` to something like:
  - `planning/prototype-intake-next-sandbox-promotion.md`
- reserve “Next.js → Vite” naming for a separate true migration plan

### Add a shared “Runbook conventions” section (in overview)

- Working directory conventions (root vs `loomis-course-app/`)
- When to commit vs when to batch commits (team preference)
- Required checks at each checkpoint:
  - `npm run test:run`
  - `npm run build`
  - `npm run lint` (recommended to add to checkpoints)
  - baseline capture / parity evidence

### Promote a “single source of truth” for schemas used in docs

Any time docs mention localStorage keys or payload shapes, reference the owning module:

- `plannerV2` schema: `src/lib/plannerStore.ts`
- browser plan schema: `src/app/(app)/browser/page.tsx` (or extracted module once you refactor)

---

## If you *actually* want a “Next.js → Vite composable framework” later (separate plan needed)

The current workflow explicitly avoids migrating production to Vite. If the real long-term goal is a composable architecture, the industry-standard path is usually:

- Extract a **shared UI/package layer** (e.g., `packages/ui`) built with Vite (library mode) and consumed by:
  - the existing Next app (incrementally), and/or
  - a Vite SPA (if you truly want a Vite runtime app)
- Keep routing/data/deployment concerns separate:
  - Next App Router + SSR concerns are not “drop-in” replaceable by Vite without design changes.

If you want, create a dedicated plan file that addresses:

- routing equivalence strategy
- SSR vs SPA decision
- data fetching / API layer
- asset and font pipeline replacement
- deployment strategy and CI

Do **not** mix those steps into the current Phase 0–5 workflow; it will blur scope and increase risk.

---

## Prioritized action list (what to fix next)

### P0 (must fix before others rely on runbooks)

- Standardize working directory + paths across all Phase docs.
- Fix incorrect or unsafe snippets (Phase 0 localStorage; Phase 1 asset script).
- Fix Phase 5 markdown formatting (code fences) and “copy vs move” wording.
- Resolve sandbox `.dark` + `:root` token collisions vs `data-theme` invariants.

### P1 (high value safety improvements)

- Add minimal E2E smoke coverage for behavior invariants.
- Consolidate screenshot tooling (Puppeteer vs Playwright) and document deterministic capture.
- Clarify Tailwind dark-mode behavior for “system” theme.

### P2 (DX + maintainability)

- Move to features-first architecture earlier (Phase 3) so promotion is mostly wiring, not file moves.
- Add CI checklist and PR template expectations (validation evidence attached).

