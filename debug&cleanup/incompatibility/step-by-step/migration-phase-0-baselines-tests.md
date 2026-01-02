# Phase 0: Baselines + Tests in Legacy App

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

> [!NOTE]
> **Code Snippets Disclaimer:** Snippets illustrate intent; implement production-quality changes as needed.

> [!TIP]
> **Path Convention (applies to all phases):**
> - **All phases** use **Repo Root** as working directory for consistency
> - Commands use `cd loomis-course-app && ...` for Next.js/npm operations
> - File paths are relative to repo root unless they start with `/`

**Goal:** Lock down behavior and visuals in the Next.js app before any styling framework changes, so regressions can be detected.

**Architecture:** Ensure Vitest is configured, add/verify unit tests for critical utilities and storage logic, capture baseline screenshots for visual comparison.

**Tech Stack:** Next.js 15, Vitest, React Testing Library, TypeScript

---

## Prerequisites

- Working directory: **Repo Root**
- Dev server runs on port `3001` (`cd loomis-course-app && npm run dev` → `next dev -p 3001`)
- Existing tests may already exist in `loomis-course-app/tests/`
- Existing baselines may exist in `debug&cleanup/incompatibility/visual-baseline/next/`

---

## Task 1: Verify or create migration inventory

**Goal:** Document what must not change during styling work.

**Files:**
- Check/update: `debug&cleanup/incompatibility/migration-inventory.md`

**Step 1: Check if inventory already exists**

```bash
ls -la "debug&cleanup/incompatibility/migration-inventory.md"
```

**Step 2: If missing, create it**

Document at minimum:
- Core routes: `/`, `/login`, `/onboarding`, `/browser`, `/planner`, `/sandbox`
- localStorage keys: `plannerV1`, `plan`, `plannerV2`, `catalogPrefs`
- Cookies: `catalogPrefs`, `onboardingIntroSeen`
- Theme system: `data-theme="light|dark"` on html/body
- Font: Proxima Nova (local `@font-face` in `globals.css`)
- Key tokens from `globals.css`: `--background`, `--foreground`, `--border`, `--text`, etc.

**Step 3: Commit if created**

```bash
git add "debug&cleanup/incompatibility/migration-inventory.md"
git commit -m "docs: create migration inventory of what must not change"
```

---

## Task 2: Verify Vitest test runner is installed

**Goal:** Confirm test runner is ready to use.

**Files:**
- Check: `loomis-course-app/package.json`
- Check: `loomis-course-app/vitest.config.ts`

**Step 1: Check for existing test scripts**

```bash
cd loomis-course-app
grep -E '"test":|"test:run":' package.json
```

Expected: Scripts like `"test": "vitest"` and `"test:run": "vitest run"`

**Step 2: Check for vitest config**

```bash
ls -la vitest.config.ts
```

**Step 2.5 (Recommended): Ensure coverage includes `src/features/`**

> [!NOTE]
> Coverage is optional (`--coverage`), but once Phase 3 adds `src/features/` code, you want coverage to include it.

In `loomis-course-app/vitest.config.ts`, ensure `test.coverage.include` includes:
- `src/lib/**/*.{ts,tsx}`
- `src/features/**/*.{ts,tsx}`

**Step 3: If missing, install Vitest (requires network approval)**

> **Requires network approval:** The following npm install requires network access.

```bash
cd loomis-course-app
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

Then create `vitest.config.ts` and add test scripts to `package.json`.

**Step 4: Verify test runner works**

```bash
cd loomis-course-app
npm run test:run
```

Expected: Tests run (may pass or fail, but runner works)

---

## Task 3: Verify or add tests for courseUtils

**Goal:** Ensure course utility functions are covered by tests.

**Files:**
- Read: `loomis-course-app/src/lib/courseUtils.ts`
- Check/create: `loomis-course-app/tests/lib/courseUtils.test.ts`

**Step 1: Check what functions exist in courseUtils.ts**

```bash
cd loomis-course-app
grep -n "export function\|export const" src/lib/courseUtils.ts
```

**Step 2: Check if tests already exist**

```bash
ls -la tests/lib/courseUtils.test.ts 2>/dev/null || echo "No test file yet"
```

**Step 3: If tests are missing or incomplete, add coverage**

For each exported function in `courseUtils.ts`, write tests that:
- Cover typical inputs
- Cover edge cases (empty, null, unusual formats)
- Document the expected behavior

Example test pattern (adapt to actual functions):

```typescript
import { describe, it, expect } from 'vitest'
import { someFunction } from '../../src/lib/courseUtils'

describe('someFunction', () => {
  it('handles standard input', () => {
    expect(someFunction('input')).toBe('expectedOutput')
  })

  it('handles empty input', () => {
    expect(someFunction('')).toBe('')
  })
})
```

**Step 4: Run tests to verify**

```bash
cd loomis-course-app
npm run test:run -- tests/lib/courseUtils.test.ts
```

Expected: All tests pass

**Step 5: Commit if changes made**

```bash
git add tests/lib/courseUtils.test.ts
git commit -m "test: add/update unit tests for courseUtils"
```

---

## Task 4: Verify or add tests for plannerStore

**Goal:** Ensure localStorage migration logic is covered by tests.

**Files:**
- Read: `loomis-course-app/src/lib/plannerStore.ts`
- Check/create: `loomis-course-app/tests/lib/plannerStore.test.ts`

**Step 1: Understand the migration path**

The planner store migrates between formats:
- `plannerV1` → `plan` → `plannerV2`

Read the source to understand:
- What triggers migration
- What data structure each version uses
- What happens with missing/corrupted data

**Step 2: Check if tests already exist**

```bash
ls -la loomis-course-app/tests/lib/plannerStore.test.ts 2>/dev/null || echo "No test file yet"
```

**Step 3: If tests are missing, add coverage**

Key scenarios to test:
1. Fresh state (no localStorage) → creates default plannerV2
2. Existing plannerV1 data → migrates to plannerV2
3. Existing `plan` data → migrates to plannerV2
4. Existing plannerV2 data → preserves it

**Step 3.5 (Required): Add corrupted/legacy storage cases**

> [!IMPORTANT]
> **Corrupted localStorage must never crash the UI.** These tests ensure graceful degradation when users have malformed data from bugs, old versions, or manual tampering.

Add test cases for:

```typescript
describe('plannerStore - corrupted/legacy data handling', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('handles invalid JSON in plannerV2 gracefully', () => {
    localStorage.setItem('plannerV2', 'not valid json {{{');
    // Should not throw, should fall back to defaults
    const store = initPlannerStore();
    expect(store).toBeDefined();
    expect(store.version).toBe(2);
  });

  it('handles invalid JSON in plan gracefully', () => {
    localStorage.setItem('plan', '[invalid array');
    const store = initPlannerStore();
    expect(store).toBeDefined();
  });

  it('handles wrong shape (missing required fields)', () => {
    localStorage.setItem('plannerV2', JSON.stringify({
      version: 2,
      // missing selectedCourses and grid
    }));
    const store = initPlannerStore();
    expect(store.selectedCourses).toEqual([]); // defaults to empty
    expect(store.grid).toBeDefined();
  });

  it('handles legacy version numbers', () => {
    localStorage.setItem('plannerV2', JSON.stringify({
      version: 1, // old version in v2 key
      courses: ['CS101'],
    }));
    const store = initPlannerStore();
    expect(store.version).toBe(2); // upgraded
  });

  it('handles null/undefined values in data', () => {
    localStorage.setItem('plannerV2', JSON.stringify({
      version: 2,
      selectedCourses: null,
      grid: undefined,
    }));
    const store = initPlannerStore();
    expect(Array.isArray(store.selectedCourses)).toBe(true);
  });
});
```

**Expected behavior:** **No crash**, recover to safe defaults or ignore bad data.

Use `beforeEach` to clear localStorage:

```typescript
beforeEach(() => {
  localStorage.clear()
})
```

**Step 4: Run tests to verify**

```bash
cd loomis-course-app
npm run test:run -- tests/lib/plannerStore.test.ts
```

**Step 5: Commit if changes made**

```bash
git add tests/lib/plannerStore.test.ts
git commit -m "test: add/update unit tests for plannerStore migration"
```

---

## Task 5: Add minimal E2E Smoke Tests (Optional)

**Goal:** Ensure critical user flows work (behavioral invariants), not just unit logic.

**Files:**
- Create: `loomis-course-app/e2e/smoke.spec.ts` (or similar)

**Step 1: Install Playwright (if not present)**

```bash
cd loomis-course-app
npm init playwright@latest
# Follow prompts (TypeScript, tests/e2e, etc.)
```

**Step 2: Add smoke tests for invariants**

Create a test file that checks:
1.  **Onboarding Logic:** Verify `/` redirects to `/onboarding` if no cookie/storage.
2.  **Browser Add:** Verify clicking "Add" in browser moves item to "My List".
3.  **Planner Persistence:** Verify refreshing `/planner` keeps the grid state.

**Step 3: Run smoke tests**

```bash
cd loomis-course-app
npx playwright test
```

---

## Task 6: Verify or capture baseline screenshots

**Goal:** Have visual baselines for core routes to compare against after styling changes.

**Files:**
- Check: `debug&cleanup/incompatibility/visual-baseline/next/`
- Read: `debug&cleanup/incompatibility/visual-baseline/next/README.md`
- Check: `debug&cleanup/incompatibility/visual-baseline/next/capture-script.js`

**Step 1: Check if baselines already exist**

```bash
ls -la "debug&cleanup/incompatibility/visual-baseline/next/clean/"
ls -la "debug&cleanup/incompatibility/visual-baseline/next/populated/"
```

**Step 2: Verify baseline approach matches reality**

Current baseline approach:
- **Viewport:** Desktop only (`1440x900`)
- **States:** `clean/` (no localStorage) and `populated/` (with user data)
- **Routes:** `/`, `/login`, `/onboarding`, `/browser`, `/planner`, `/sandbox`

If baselines already exist with this structure, proceed to verification.

**Step 3: If baselines are missing or incomplete, capture them**

**Manual capture method (no network required):**

> [!IMPORTANT]
> **Capture order matters (avoid polluted baselines):**
> - The `/sandbox` route currently imports `src/app/sandbox/sandbox.css`, which (today) contains global selectors like `:root` and `.dark`.
> - In Next.js App Router, CSS loaded for one route segment can remain in the client during navigation.
>
> To avoid accidentally capturing production routes with sandbox tokens applied:
> - Capture production routes (`/`, `/login`, `/onboarding`, `/browser`, `/planner`) **before** visiting `/sandbox`, or
> - Use a fresh Incognito window for production routes and a separate Incognito window for `/sandbox`, or
> - Capture `/sandbox` **last**.

1. Start Next.js dev server:
   ```bash
   cd loomis-course-app
   npm run dev
   ```
   Server runs at `http://localhost:3001`

2. Open Chrome, set viewport to 1440×900:
   - DevTools (F12) → Toggle Device Toolbar (Cmd+Shift+M)
   - Set Responsive → 1440 × 900

3. **Clean state captures:**
   - Open incognito window
   - For each route, capture screenshot (Cmd+Shift+P → "Capture screenshot")
   - Save to `debug&cleanup/incompatibility/visual-baseline/next/clean/{route-name}-1440x900.png`

4. **Populated state captures:**
   - In regular window, set localStorage (schema matches `loomis-course-app/src/types/course.ts` — see `PlannerV2State` and `PlanItem` types):
     ```javascript
     // Schema: PlannerV2State from src/types/course.ts
     // Note: PlanItem requires only { title: string } at minimum
     const SLOTS = [null, null, null, null, null, null];
     localStorage.setItem('plannerV2', JSON.stringify({
       version: 2,
       selectedCourses: [{ title: 'CS101' }, { title: 'MATH201' }],
       grid: {
         Freshman: SLOTS,
         Sophomore: SLOTS,
         Junior: SLOTS,
         Senior: SLOTS
       }
     }));
     // Also set 'plan' key (legacy format still read by /browser page)
     localStorage.setItem('plan', JSON.stringify([{ title: 'CS101' }, { title: 'MATH201' }]));
     localStorage.setItem('catalogPrefs', JSON.stringify({ completed: true }));
     ```
   - Set cookie: `document.cookie = "onboardingIntroSeen=true; path=/"`
   - Capture screenshots to `debug&cleanup/incompatibility/visual-baseline/next/populated/`

> [!NOTE]
> **Baseline Capture Script:** An automated capture script exists at `debug&cleanup/incompatibility/visual-baseline/next/capture-script.js`. Currently it captures **clean state only**. For populated state, either:
> - (Preferred) Enhance the script to support `--populated` flag with localStorage seeding, or
> - (Fallback) Use manual capture as described above until script is upgraded

**Step 4: Verify screenshot count**

```bash
find "debug&cleanup/incompatibility/visual-baseline/next/" -name "*.png" | wc -l
```

Expected: At least 7 files in `clean/` and `populated/` each (one per route)

**Step 5: Commit if new baselines captured**

```bash
git add "debug&cleanup/incompatibility/visual-baseline/"
git commit -m "docs: capture baseline screenshots from Next.js app"
```

---

## Behavioral Invariants Smoke Checklist

**Goal:** Even if E2E automation (Task 5) is skipped, manually verify these critical behaviors still work correctly.

| Invariant | How to Verify | Expected Behavior |
|-----------|---------------|-------------------|
| Onboarding redirect | Clear cookies/storage, visit `/` | Redirects to `/onboarding` |
| `plan` persistence | Add courses on `/browser`, refresh | "My List" preserves added courses |
| `plannerV2` load/migrate | Open `/planner` with seeded `plannerV2` data | Grid shows seeded courses |
| Theme toggle readability | Toggle theme (light/dark/system) | All text remains readable, no invisible elements |
| Print mode | Open `/planner`, print preview (Cmd+P) | Layout is print-friendly, no cut-off content |

> [!TIP]
> Run this checklist once before any Phase 2+ changes. If any fail, fix before proceeding.

---

## Task 7: Run full verification

**Goal:** Confirm Phase 0 is complete before proceeding.

**Step 1: Run all tests**

```bash
cd loomis-course-app
npm run test:run
```

Expected: All tests pass

**Step 2: Run build**

```bash
cd loomis-course-app
npm run build
```

Expected: Build succeeds

**Step 3: Verify baseline screenshots exist**

```bash
find "debug&cleanup/incompatibility/visual-baseline/next/" -name "*.png" -type f | head -10
```

Expected: PNG files for core routes

**Step 4: Verify inventory exists**

```bash
head -20 "debug&cleanup/incompatibility/migration-inventory.md"
```

Expected: Shows route/storage documentation

---

## 🛑 CHECKPOINT [Phase 0]: Baseline Verification

> **STOP:** Pause here and verify completion before proceeding.

**Verification Checklist:**
- [ ] `npm run test:run` passes in `loomis-course-app`
- [ ] `npm run build` succeeds in `loomis-course-app`
- [ ] Baseline screenshots exist in `debug&cleanup/incompatibility/visual-baseline/next/` (clean + populated states, 1440×900 viewport)
- [ ] `courseUtils.ts` and `plannerStore.ts` critical paths are covered by tests
- [ ] Migration inventory documents routes, storage keys, and theme system

**Next Phase:** Phase 1 — Inventory and Standardization of design ideas

---

## Rollback

If anything breaks during Phase 0:

1. Revert test changes:
   ```bash
   git checkout HEAD -- loomis-course-app/tests/
   ```

2. Revert any utility changes:
   ```bash
   git checkout HEAD -- loomis-course-app/src/lib/
   ```

Phase 0 is primarily additive (tests + baselines), so rollback is low-risk.
