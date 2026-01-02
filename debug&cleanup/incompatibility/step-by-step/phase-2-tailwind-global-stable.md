# Phase 2: Tailwind Global and Stable (Tailwind v4, Utilities-First)

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

> [!IMPORTANT]
> This plan is aligned with the repo's real state:
> - Tailwind is **v4** and used via **PostCSS** (`@tailwindcss/postcss`), not the Tailwind CLI.
> - Sandbox uses **v4 CSS-first syntax** (`@import "tailwindcss"`).
> - The main app uses **globals.css + CSS Modules**, so Tailwind **Preflight must be treated as a breaking change**.

> [!NOTE]
> **Code Snippets Disclaimer:** Snippets illustrate intent; implement production-quality changes as needed.

**Goal:** Make Tailwind CSS utilities available across the entire app with **zero visual regression**, while keeping sandbox experimentation reliable and avoiding token/reset collisions.

**Tech Stack:** Tailwind CSS v4, Next.js 15, CSS Modules, TypeScript

---

## Prerequisites

- Phase 1 complete (inventories + sandbox stubs created)
- Working directory: **Repo Root**
- Dev server runs on port `3001` (`cd loomis-course-app && npm run dev`)
- Tailwind is already in the app via PostCSS, currently used only in sandbox

---

## Key decisions (make these explicit before coding)

1. **Preflight strategy (recommended: OFF globally)**
   - Tailwind Preflight duplicates/overlaps with `src/app/globals.css` resets and can change font defaults.
   - We will ship **utilities-first** Tailwind globally, **without** Preflight, unless you later decide otherwise.

2. **Token ownership (recommended: globals.css owns app tokens)**
   - `src/app/globals.css` already defines `--background`, `--foreground`, `--border`, etc.
   - Sandbox currently redefines some of these in `src/app/sandbox/sandbox.css`. This plan removes or scopes that so global tokens remain the source of truth.

3. **Dark mode selector (recommended: follow `data-theme`)**
   - The app toggles theme via `data-theme` (`loomis-course-app/src/app/ThemeToggle.tsx`), not a `.dark` class.

> [!WARNING]
> **Current Repo State Conflict:** `loomis-course-app/src/app/sandbox/sandbox.css` currently defines:
> - `:root { --background: ... }` (same tokens as `globals.css`)
> - `@custom-variant dark (&:is(.dark *));` (uses `.dark` class, NOT `data-theme`)
>
> This conflicts with the app's `data-theme` approach in `ThemeToggle.tsx`. Phase 2 must resolve this before Tailwind is made global.

> [!IMPORTANT]
> **Chosen Policy: Tailwind `dark:` is Explicit-Only**
> - Tailwind dark utilities activate ONLY when `data-theme="dark"` is set explicitly
> - System preference mode (`prefers-color-scheme: dark`) will NOT trigger Tailwind `dark:` utilities
> - This prevents unexpected styling changes when users have system dark mode enabled

---

## Task 0 (BLOCKING): Fix sandbox.css token + dark-mode collisions

> [!IMPORTANT]
> **This must be fixed in the actual codebase before making Tailwind global.**
>
> Reason: in Next.js App Router, CSS loaded for one route segment can remain in the client during navigation. If `/sandbox` loads CSS that defines `:root` tokens or `.dark`, those globals can leak into production routes after you click “Back to Main App”.

**Files:**
- Modify: `loomis-course-app/src/app/sandbox/layout.tsx`
- Modify: `loomis-course-app/src/app/sandbox/sandbox.css`

**Step 1: Wrap all sandbox routes in a scoping container**

In `loomis-course-app/src/app/sandbox/layout.tsx`, wrap `{children}` in a container:

```tsx
<div className="sandbox-scope">{children}</div>
```

**Step 2: Make dark-mode selector match the real theme system**

In `loomis-course-app/src/app/sandbox/sandbox.css`, change:
- `@custom-variant dark (&:is(.dark *));`
to:
- `@custom-variant dark (&:is([data-theme="dark"] *));`

**Step 3: Scope token definitions (no more `:root` / `.dark`)**

In `loomis-course-app/src/app/sandbox/sandbox.css`, change:
- `:root { ... }` → `.sandbox-scope { ... }`
- `.dark { ... }` → `[data-theme="dark"] .sandbox-scope { ... }`

**Step 4: Scope any base-layer selectors**

If `sandbox.css` contains `@layer base` rules that target `body` or `*`, rewrite them so they only affect sandbox content:
- `* { ... }` → `.sandbox-scope * { ... }`
- `body { ... }` → `.sandbox-scope { ... }`

**Step 5: Verify the leak is gone**

1. Start dev server: `cd loomis-course-app && npm run dev`
2. Visit `/sandbox` and then click “Main App” (or navigate to `/browser`)
3. Verify production pages still use `globals.css` tokens (no unexpected background/text changes)

---

## Task 1: Create a single Tailwind v4 entry file (global utilities, no Preflight)

**Why:** One entry file avoids duplicated Tailwind generation and makes "global Tailwind" a single import.

**Files:**
- Create: `loomis-course-app/src/app/tailwind.css`

**Step 1: Create `src/app/tailwind.css`**

Recommended starting contents:

```css
/* Tailwind v4 entry (utilities-first; intentionally NO preflight) */
@plugin "tailwindcss-animate";

/* Align `dark:` with the app's theme toggle (html/body `data-theme="dark"`) */
@custom-variant dark (&:is([data-theme="dark"] *));

@import "tailwindcss/theme";
@import "tailwindcss/utilities";

/* If you ever decide Preflight is worth it (high regression risk), add:
@import "tailwindcss/preflight";
and then immediately validate all baseline screenshots. */
```

**Step 2: Verify file created**

```bash
ls -la loomis-course-app/src/app/tailwind.css
```

**Step 3: Verify dark variant hooks into `data-theme`**

> [!IMPORTANT]
> This verification ensures Tailwind's `dark:` utilities activate correctly with your theme system.

1. After Task 2 (global import), create a temporary test element in any page:
   ```tsx
   <div className="bg-white dark:bg-black text-black dark:text-white p-4">
     Dark mode test
   </div>
   ```

2. Toggle theme using the app's ThemeToggle component
3. Verify the element changes colors when `data-theme="dark"` is set on `<html>`

**Why this matters:** The `@custom-variant dark (&:is([data-theme="dark"] *));` syntax is the correct **Tailwind v4** approach (not the v3 config-based `darkMode` option). This step confirms it works before proceeding.

---


## Task 2: Import Tailwind globally (without overriding your existing globals)

**Files:**
- Modify: `loomis-course-app/src/app/layout.tsx`

**Step 1: Import Tailwind before `globals.css`**

Import order recommendation:

```ts
import "./tailwind.css";
import "./globals.css";
```

Rationale: If Preflight is ever enabled later, importing `globals.css` after Tailwind makes it easier for your existing font/tokens/resets to win.

**Step 2: Verify**

```bash
cd loomis-course-app
npm run build
```

Expected: build succeeds.

---

## Task 3: Update Tailwind content scanning (minimal → expand only when needed)

**Why:** Tailwind only generates utilities for classnames found in `content`. Expanding too aggressively can bloat CSS and pick up false positives from arbitrary strings.

**Files:**
- Modify: `loomis-course-app/tailwind.config.ts`

**Step 1 (recommended default): keep it sandbox-focused**

If you're still only using Tailwind in `src/app/sandbox/**`, keep content limited:

```ts
content: ["./src/app/sandbox/**/*.{js,ts,jsx,tsx,mdx}"],
```

**Step 2 (when you start using Tailwind outside sandbox): expand intentionally**

Expand only to where you actually add Tailwind classNames, for example:

```ts
content: [
  "./src/app/sandbox/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/app/(marketing)/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
],
```

**Step 3: Verify no cross-route leakage**

```bash
cd loomis-course-app
npm run build
```

---

## Task 4: De-conflict sandbox CSS (avoid duplicate Tailwind imports + token collisions)

**Why:** After Task 2, Tailwind is already global. Sandbox should not re-import Tailwind (and it should not redefine app-wide tokens at `:root`).

**Files:**
- Modify: `loomis-course-app/src/app/sandbox/sandbox.css`
- (Optional, if scoping tokens) Modify: `loomis-course-app/src/app/sandbox/layout.tsx`

**Step 1: Remove duplicate Tailwind imports from `sandbox.css`**

In `src/app/sandbox/sandbox.css`, remove these lines (or equivalent):
- `@plugin "tailwindcss-animate";`
- `@import "tailwindcss";`
- `@import "tw-animate-css";`
- `@custom-variant dark ...`

Keep sandbox-only CSS like `.sandbox-toolbar { ... }`.

**Step 2: Resolve sandbox token collisions**

> [!IMPORTANT]
> After Task 2, `sandbox.css` must be **safe to remain loaded** even if the user navigates away from `/sandbox`. That means: no app-wide token overrides and no global base rules.

**Option A (recommended default): delete sandbox token/theme/base blocks entirely**
  - Remove the `@theme inline { ... }`, `:root { ... }`, `.dark { ... }`, and `@layer base { ... }` blocks from `sandbox.css`.
  - Keep only sandbox-specific plain CSS (e.g. `.sandbox-toolbar { ... }`).
  - This is the lowest-risk approach because sandbox stops redefining any app-wide theme semantics.

**Option B (only if you truly need sandbox-only tokens): keep CSS variables but scope them**
  - Keep only the **plain CSS variable blocks**, but scope them:
    - `:root { ... }` → `.sandbox-scope { ... }`
    - `.dark { ... }` → `[data-theme="dark"] .sandbox-scope { ... }`
  - Do **not** keep Tailwind directives in `sandbox.css` after Step 1:
    - Remove `@theme inline { ... }` and `@layer base { ... }` (or move any needed theme wiring to `src/app/tailwind.css`).
  - Ensure sandbox layout wraps children: `<div className="sandbox-scope">{children}</div>`

**Step 4: Verify build**

1. Visit `/sandbox`, then navigate to `/browser`
2. Confirm there is **no** unexpected theme/token change on production routes
3. Toggle theme via `ThemeToggle` and confirm Tailwind `dark:` utilities respond to `data-theme="dark"`

**Step 3: Verify**

```bash
cd loomis-course-app
npm run build
```

---

## Regression Checkpoint (Required After Task 4)

> [!IMPORTANT]
> **Stop-the-line check:** Before proceeding to Phase 3, verify that Phase 2 changes have not regressed core production routes. This checkpoint prevents cascading issues in later phases.

**Step 1: Compare core routes against Phase 0 baselines**

Manual comparison is sufficient:

1. Start dev server: `cd loomis-course-app && npm run dev`
2. Visit each core route (`/`, `/login`, `/onboarding`, `/browser`, `/planner`)
3. Compare visually against Phase 0 screenshots in `debug&cleanup/incompatibility/visual-baseline/next/clean/`
4. Look for: font changes, color shifts, layout breaks, unexpected spacing

**Expected:** No visible differences from Phase 0 baselines.

**Step 2 (Optional but Recommended): Playwright navigation test**

If you want automated verification, add a simple Playwright test:

```typescript
// e2e/css-leak.spec.ts
import { test, expect } from '@playwright/test';

test('sandbox CSS does not leak to production routes', async ({ page }) => {
  // Visit sandbox first (loads sandbox.css)
  await page.goto('/sandbox');
  await page.waitForLoadState('networkidle');
  
  // Navigate to production route
  await page.goto('/browser');
  await page.waitForLoadState('networkidle');
  
  // Assert key tokens remain correct (adjust selectors and values for your app)
  const body = page.locator('body');
  const bgColor = await body.evaluate((el) => 
    getComputedStyle(el).getPropertyValue('--background')
  );
  
  // Should match globals.css value, not sandbox override
  expect(bgColor.trim()).not.toBe(''); // Has a value
  // Add more specific assertions as needed
});
```

Run with:
```bash
cd loomis-course-app
npx playwright test e2e/css-leak.spec.ts
```

**Step 3: Gate for Phase 3**

| Outcome | Action |
|---------|--------|
| ✅ No regressions | Proceed to Phase 3 |
| ❌ Regressions found | Stop, investigate, and fix before Phase 3 |

---

## Task 5: Create a low-risk Tailwind "smoke test" route (optional but recommended)

**Files:**
- Create: `loomis-course-app/src/app/test-tailwind/page.tsx`

**Step 1: Add the test page**

Use a simple page that renders obvious Tailwind styles (gradient background, cards, responsive grid).

**Step 2: Verify**

```bash
cd loomis-course-app
npm run dev
```

Visit: `http://localhost:3001/test-tailwind`

**Step 3: Clean up (optional)**

After verifying Tailwind works globally, you can delete the test route:

```bash
rm -rf loomis-course-app/src/app/test-tailwind
```

---

## Verification Checklist for Phase 2

- [ ] `npm run build` succeeds in `loomis-course-app`
- [ ] Existing routes (`/browser`, `/planner`, `/onboarding`) look unchanged (fonts, spacing, form controls)
- [ ] `/sandbox` still renders correctly
- [ ] Tailwind utilities work (via `/test-tailwind` or in sandbox)
- [ ] No sandbox token collisions with `globals.css` (either removed or scoped)
- [ ] Navigating `/sandbox` → `/browser` does not change theme/tokens
- [ ] No duplicate Tailwind imports in sandbox.css

---

## 🛑 CHECKPOINT [Phase 2]: Tailwind Global and Stable

> **STOP:** Verify Tailwind is working globally without breaking existing routes.

**Verification:**
- [ ] `npm run build` passes
- [ ] `/browser`, `/planner`, `/onboarding` look unchanged
- [ ] `/sandbox` works with Tailwind utilities
- [ ] No visual regressions on core routes (compare to Phase 0 baselines)

**Next Phase:** Phase 3 — Sandbox Integration (fidelity-first porting of design ideas)

---

## Rollback

If Phase 2 causes visual regressions:

1. Revert layout.tsx import changes:
   ```bash
   git checkout HEAD -- loomis-course-app/src/app/layout.tsx
   ```

2. Revert tailwind.css:
   ```bash
   rm loomis-course-app/src/app/tailwind.css
   ```

3. Revert sandbox.css changes:
   ```bash
   git checkout HEAD -- loomis-course-app/src/app/sandbox/sandbox.css
   ```

4. Revert sandbox layout wrapper (if changed):
   ```bash
   git checkout HEAD -- loomis-course-app/src/app/sandbox/layout.tsx
   ```

4. Revert tailwind.config.ts:
   ```bash
   git checkout HEAD -- loomis-course-app/tailwind.config.ts
   ```

**If you enabled Preflight and saw regressions:**
- Remove `@import "tailwindcss/preflight";` from tailwind.css
- Re-run visual comparison against Phase 0 baselines
