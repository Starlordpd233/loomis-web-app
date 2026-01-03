# Phase 2 Implementation Plan

## Current Status Assessment
After reviewing the codebase and comparing with the updated instructions, the following Phase 2 tasks have already been completed:

### ✅ Completed Tasks
- **Task 0**: Sandbox token/dark‑mode collisions fixed
  - `sandbox‑scope` wrapper already present in `sandbox/layout.tsx`
  - `sandbox.css` contains no `:root`, `.dark`, `@custom‑variant`, `@theme`, or `@layer base` blocks
  - No duplicate token definitions remain
- **Task 1**: Single Tailwind v4 entry file created
  - `src/app/tailwind.css` exists with correct `@custom‑variant dark (&:is([data‑theme="dark"] *));`
- **Task 2**: Tailwind imported globally before `globals.css`
  - `src/app/layout.tsx` imports `tailwind.css` → `globals.css`
- **Task 4**: Sandbox CSS de‑conflicted
  - `sandbox.css` contains only toolbar styling; no Tailwind imports or theme blocks

### ⚠️ Partially Complete / Verification Required
- **Task 3**: Tailwind content scanning
  - Current `tailwind.config.ts` includes `./src/app/sandbox/**` and `./src/features/**`
  - Tailwind is actively used in `src/features/browser/my‑list‑sidebar/**` (confirmed)
  - No Tailwind usage found in `src/app/(app)` or `src/app/(marketing)` (CSS‑modules only)
  - Configuration appears appropriate; no expansion needed at this time
- **Task 0/4 verification**: Navigation leak test & build validation not yet performed
- **Regression checkpoint**: Visual comparison with Phase‑0 baselines pending
- **Optional smoke‑test route**: Not yet created

## Pending Actions

### 1. Smoke‑Test Route (Optional but Recommended)
- **Create** `loomis‑course‑app/src/app/test‑tailwind/page.tsx`
  - Simple page demonstrating Tailwind utilities (gradient, cards, responsive grid)
  - Include a dark‑mode test element: `<div className="bg‑white dark:bg‑black text‑black dark:text‑white">`
  - Verify that `dark:` utilities respond to `data‑theme="dark"` (toggle via `ThemeToggle`)
- **After verification**, optionally delete the route (`rm -rf …`)

### 2. Build Verification
- Run `cd loomis‑course‑app && npm run build`
- Ensure the build succeeds with no Tail‑windrelated errors

### 3. Navigation Leak
 Test- Start dev server: `cd loomis‑course‑app && npm run dev`
- Visit `/sandbox`, then click “Main App” (or navigate directly to `/browser`)
- Confirm:
  - No unexpected background/text color changes
  - Theme tokens remain those defined in `globals.css`
  - Toggling theme via `ThemeToggle` works and Tailwind `dark:` utilities follow `data‑theme="dark"`

### 4. Visual Regression Check
- Compare core production routes (`/`, `/login`, `/onboarding`, `/browser`, `/planner`) against the Phase‑0 baselines stored in `debug&cleanup/incompatibility/visual‑baseline/next/clean/`
- Look for font changes, color shifts, layout breaks, unexpected spacing
- **Expected outcome**: No visible differences from Phase‑0 baselines

### 5. Automated Leak Test (Optional)
- If desired, create a Playwright test (`e2e/css‑leak.spec.ts`) that:
  1. Visits `/sandbox`
  2. Navigates to `/browser`
  3. Asserts that CSS custom properties (e.g., `--background`) match `globals.css` values
- Run with `npx playwright test e2e/css‑leak.spec.ts`

### 6. Documentation
- **Create** a comprehensive progress report in markdown format at:
  `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc‑solve‑incompatibility/debug&cleanup/incompatibility/documentation/phase‑2‑progress‑report.md`
- Include:
  - Summary of completed tasks
  - Implementation decisions (e.g., Preflight kept off, dark variant aligned with `data‑theme`)
  - Challenges encountered and solutions
  - Verification results (build, navigation leak, visual regression)
  - Before/after comparisons for significant changes
  - Checklist of remaining items for Phase 3

## Risk Mitigation
- **Rollback steps** are documented in the plan file; if regressions appear, revert using the provided `git checkout` commands.
- **Preflight is intentionally omitted** to avoid conflicts with `globals.css` resets.
- **Dark variant is explicitly tied to `data‑theme="dark"`**; system preference does not trigger `dark:` utilities.

## Success Criteria
- [ ] `npm run build` passes
- [ ] Core routes (`/browser`, `/planner`, `/onboarding`) look unchanged (fonts, spacing, form controls)
- [ ] `/sandbox` renders correctly with Tailwind utilities
- [ ] No sandbox token collisions with `globals.css`
- [ ] Navigating `/sandbox` → `/browser` does not change theme/tokens
- [ ] Tailwind `dark:` utilities respond correctly to `data‑theme="dark"`

## Next Phase
Once Phase 2 is verified stable, proceed to **Phase 3 – Sandbox Integration (fidelity‑first