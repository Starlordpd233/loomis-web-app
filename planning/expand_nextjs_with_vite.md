# plan: Solve design-idea ↔ app incompatibility (Next.js sandbox + Tailwind v4, fidelity-first)

This repo contains a production Next.js app (`loomis-course-app/`) plus “design ideas” exported as Vite prototypes (`design_ideas/`). The goal of this plan is to make it safe and repeatable to:

1) Preserve **existing production UI/behavior** (browser/planner/onboarding/login/landing), while  
2) Integrating Vite-exported design ideas into the **Next.js `/sandbox`**, and then  
3) Promoting validated experiments into production routes with **zero unintended regressions**.

This file is the **overview + invariants** that the detailed runbooks must follow.

---

## Source-of-truth runbooks (step-by-step)

The executable plans live here (follow these when implementing):

- `debug&cleanup/incompatibility/step-by-step/migration-phase-0-baselines-tests.md`
- `debug&cleanup/incompatibility/step-by-step/phase-1-inventory-and-standardization.md`
- `debug&cleanup/incompatibility/step-by-step/phase-2-tailwind-global-stable.md`
- `debug&cleanup/incompatibility/step-by-step/phase-3-sandbox-integration-fidelity.md`
- `debug&cleanup/incompatibility/step-by-step/phase-4-visual-parity-validation.md`
- `debug&cleanup/incompatibility/step-by-step/phase-5-production-promotion.md`

If any runbook contradicts this document’s invariants, fix the runbook first.

---

## Current repo reality (keep the plan grounded)

### Primary app (production)

- App: `loomis-course-app/` (Next.js App Router, Next 15, React 19)
- Dev port: `3001` (`loomis-course-app/package.json` → `next dev -p 3001`)
- Styling:
  - Global tokens + resets + Proxima Nova font: `loomis-course-app/src/app/globals.css`
  - Main routes are mostly CSS Modules: `loomis-course-app/src/app/**.module.css` (6 files)
  - Sandbox currently uses Tailwind classes
- Theme system:
  - Theme is stored in `localStorage` key `theme`
  - `data-theme="light|dark"` is applied to `html` and `body` (`loomis-course-app/src/app/ThemeToggle.tsx`)
  - Do **not** assume a `.dark` class is present.
- Persistence / “must not break” storage:
  - `localStorage`: `plannerV1`, `plan`, `plannerV2`, `catalogPrefs`
  - Cookies: `catalogPrefs`, `onboardingIntroSeen` (onboarding uses both cookie + localStorage)

### Tailwind in the app (important for Phase 2)

- Tailwind version: v4 (`loomis-course-app/package.json` → `tailwindcss`)
- Tailwind build pipeline: PostCSS (`loomis-course-app/postcss.config.mjs` → `@tailwindcss/postcss`)
- Current Tailwind content scanning is sandbox-only: `loomis-course-app/tailwind.config.ts`
- Current sandbox Tailwind entry: `loomis-course-app/src/app/sandbox/sandbox.css` uses Tailwind v4 syntax (`@import "tailwindcss"`)

### Design ideas (prototypes)

- Folder: `design_ideas/`
- Most ideas are Vite apps with:
  - Tailwind via CDN (`<script src="https://cdn.tailwindcss.com"></script>`)
  - Sometimes importmaps and external fonts (e.g. Inter via Google Fonts)
  - Sometimes additional libs (e.g. `styled-components`, `@google/genai`)
- These are prototypes. They are **not production-safe** as-is (CDN assets, external fonts, importmaps, client-side secrets).

---

## Non-negotiables (fidelity contract)

Any change that violates these must be treated as a regression and blocked until fixed.

### Visual invariants (production routes)

On `/`, `/login`, `/onboarding`, `/browser`, `/planner`:
- Proxima Nova stays the effective body font
- Existing CSS variables (tokens) keep meaning (e.g., `--background`, `--foreground`, `--border`, `--text`)
- Layout + spacing does not shift (fixed headers, paddings, scroll behavior)
- Forms/buttons do not “re-skin” unexpectedly
- Print behavior remains correct (`/planner` print mode)

### Behavior invariants

- All localStorage migrations continue to work (especially planner keys)
- Onboarding redirect/introduction logic remains correct
- Browser ↔ Planner interaction (query params + picker mode) remains correct

### Process invariants

- Changes must be validated with:
  - `loomis-course-app/npm run build`
  - `loomis-course-app/npm run test:run` (or `npm run test`)
  - Baseline screenshot comparison (at minimum manual; automated optional)

---

## Global guardrails (prevents “Phase 2” style mistakes)

### 1) Use Tailwind v4 syntax consistently

- **Do not** use Tailwind v3 directives like `@tailwind base;` / `@tailwind components;` / `@tailwind utilities;`.
- Prefer Tailwind v4 CSS-first imports:
  - `@import "tailwindcss";` (all layers)
  - or segmented: `@import "tailwindcss/theme";` + `@import "tailwindcss/utilities";` (and optionally `preflight`)

### 2) Do not assume the Tailwind CLI exists

This repo currently uses Tailwind via PostCSS. Validation should use:

```bash
cd loomis-course-app
npm run build
```

If you want to add Tailwind’s standalone CLI later, treat it as an explicit dependency decision.

### 3) Preflight is a breaking change until proven otherwise

Tailwind Preflight overlaps with `src/app/globals.css` resets and can shift typography/form controls.

Default recommendation:
- Global Tailwind: utilities (and theme) only
- Preflight: **disabled** globally unless you explicitly opt in and re-validate baselines

### 4) Token ownership: `globals.css` is the source of truth

- `loomis-course-app/src/app/globals.css` owns app-wide tokens.
- Sandbox must not redefine shared tokens at `:root` (unless scoped to sandbox only).
- If sandbox needs additional tokens, scope them under a sandbox wrapper (e.g. `.sandbox-scope { ... }`).

### 5) Dark mode must follow `data-theme`

- If you use `dark:` Tailwind utilities, make sure Tailwind’s dark variant is wired to the app’s theme system (`[data-theme="dark"]`), not `.dark`.

---

## Phase 0 — Baselines + tests (legacy app)

**Goal:** Lock down behavior and visuals before any styling framework changes.

**Artifacts (expected):**
- Tests: `loomis-course-app/tests/**`
- Visual baselines: `debug&cleanup/incompatibility/visual-baseline/next/`
  - `clean/` + `populated/`
  - Desktop viewport only (`1440x900`)

**Minimum commands:**

```bash
cd loomis-course-app
npm run test:run
npm run build
```

**Optional re-capture baselines (if needed):**
- Script: `debug&cleanup/incompatibility/visual-baseline/next/capture-script.js`
- Run with the Next dev server active (`npm run dev`)

**Checkpoint:** Do not proceed until tests pass and baseline screenshots exist for core routes.

---

## Phase 1 — Inventory + standardization (design ideas intake)

**Goal:** Turn “random exported prototypes” into a clean intake queue you can port into sandbox safely.

**Artifacts (expected):**
- Inventory docs (one per design idea), e.g.:
  - `debug&cleanup/incompatibility/inventory-current.md`
  - `debug&cleanup/incompatibility/inventory-my-list-sidebar.md`
- Asset standardization script:
  - `scripts/copy-design-assets.mjs`

**Rules:**
- Identify all external assets (images/fonts/CDNs) and decide what to localize.
- Identify any secret-like inputs (e.g. `GEMINI_API_KEY`) and ensure sandbox does not commit real secrets.
- Normalize each design idea to a single “root component” that can be mounted in Next sandbox.

**Checkpoint:** Every design idea has a short inventory + a known porting strategy (easy/medium/hard).

---

## Phase 2 — Tailwind global and stable (Next.js app)

**Goal:** Make Tailwind utilities available everywhere without breaking the existing app.

**Why Phase 2 exists:** Phase 3 ports design ideas into sandbox using Tailwind utilities. Tailwind must be stable globally so you don’t fight “scoped Tailwind” quirks.

**Runbook:** `debug&cleanup/incompatibility/step-by-step/phase-2-tailwind-global-stable.md`

**Phase 2 invariants (must hold):**
- Tailwind entry file uses v4 imports (no `@tailwind` directives)
- Global Preflight stays OFF unless you explicitly opt in and validate baselines
- Sandbox does not re-import Tailwind (avoid duplicate generation)
- Sandbox token collisions are removed or scoped
- Dark mode variant matches `[data-theme="dark"]`

**Checkpoint:** `/browser`, `/planner`, `/onboarding` look unchanged; `/sandbox` still works; build passes.

---

## Phase 3 — Sandbox integration (fidelity-first)

**Goal:** Port each design idea into `/sandbox/...` with maximum visual fidelity and minimal tech debt.

**Runbook:** `debug&cleanup/incompatibility/step-by-step/phase-3-sandbox-integration-fidelity.md`

**Recommended order (based on current inventories):**
1) `design_ideas/browser/my_list_sidebar` (simplest: Tailwind CDN + lucide only)
2) `design_ideas/browser/current` (harder: `styled-components` + Gemini integration)

**Hard rules when porting into sandbox:**
- No external font fetches (keep Proxima Nova globally; use local assets if needed)
- No Tailwind CDN usage (use the app’s Tailwind v4 build)
- Prefer Tailwind utilities for layout/spacing/typography; use CSS Modules for:
  - keyframes
  - complex selectors/pseudo elements
  - “hard to express” CSS
- Remove `styled-components` from sandbox code (rewrite to Tailwind/CSS Modules)
- Standardize icons (prefer `lucide-react`, already in the app)

**Checkpoint:** Each sandbox experiment renders, is registered in the sandbox index, and is visually “close enough” to the prototype to begin parity validation.

---

## Phase 4 — Visual parity validation (prototype ↔ sandbox)

**Goal:** Make visual comparison repeatable so promotion decisions are based on evidence.

**Runbook:** `debug&cleanup/incompatibility/step-by-step/phase-4-visual-parity-validation.md`

**Minimum baseline process (manual allowed):**
- Use the same viewport each time: `1440x900`
- Capture for each experiment:
  - Prototype (original Vite idea)
  - Sandbox implementation
- Save under: `debug&cleanup/incompatibility/visual-validation/` (baselines + reports)

**Automated diffing is optional** (and may require installing packages; network access may be restricted).

**Checkpoint:** For each candidate experiment, you have side-by-side images and a short checklist that says what differs (if anything) and whether it’s acceptable.

---

## Phase 5 — Promotion to production (sandbox → real routes)

**Goal:** Move validated experiments into production routes safely.

**Runbook:** `debug&cleanup/incompatibility/step-by-step/phase-5-production-promotion.md`

**Promotion rules:**
- “Promoted” code must:
  - use app tokens + fonts
  - avoid sandbox-only overrides
  - preserve storage semantics
  - preserve accessibility and keyboard behavior
- Changes must be validated against Phase 0 baselines (or re-captured baselines if you intentionally changed UI).

**Checkpoint:** Promotion PR is reviewable, scoped, and has explicit visual/behavior validation notes.

---

## Appendix: If you *still* want a full Next.js → Vite migration later

This plan intentionally does **not** migrate the production app to Vite. If you want that later:

- Create a separate plan file (so you don’t mix strategies).
- Reuse Phase 0 tests + baselines from this repo as your ground truth.
- Expect to rebuild routing, server behaviors, and assets pipeline (Vite SPA ≠ Next SSR/App Router).
