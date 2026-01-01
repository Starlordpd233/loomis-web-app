# Phase 2: Tailwind Global and Stable (Tailwind v4, Utilities-First) — Execution Plan (REWRITE)

> [!IMPORTANT]
> This file is a **rewrite** of the original Phase 2 plan to match the repo’s real state:
> - Tailwind is **v4** and currently used via **PostCSS** (`@tailwindcss/postcss`), not the Tailwind CLI.
> - Sandbox uses **v4 CSS-first syntax** (`@import "tailwindcss"`).
> - The main app uses **globals.css + CSS Modules**, so Tailwind **Preflight must be treated as a breaking change**.

> [!NOTE]
> **Code Snippets Disclaimer:** Snippets illustrate intent; implement production-quality changes as needed.

**Goal:** Make Tailwind CSS utilities available across the entire app with **zero visual regression**, while keeping sandbox experimentation reliable and avoiding token/reset collisions.

**Tech Stack:** Tailwind CSS v4, Next.js 15, CSS Modules, TypeScript

---

## Key decisions (make these explicit before coding)

1. **Preflight strategy (recommended: OFF globally)**
   - Tailwind Preflight duplicates/overlaps with `src/app/globals.css` resets and can change font defaults.
   - We will ship **utilities-first** Tailwind globally, **without** Preflight, unless you later decide otherwise.

2. **Token ownership (recommended: globals.css owns app tokens)**
   - `src/app/globals.css` already defines `--background`, `--foreground`, `--border`, etc.
   - Sandbox currently redefines some of these in `src/app/sandbox/sandbox.css`. This plan removes or scopes that so global tokens remain the source of truth.

3. **Dark mode selector (recommended: follow `data-theme`)**
   - The app toggles theme via `data-theme` (`src/app/ThemeToggle.tsx`), not a `.dark` class.

---

## Task 1: Create a single Tailwind v4 entry file (global utilities, no Preflight)

**Why:** One entry file avoids duplicated Tailwind generation and makes “global Tailwind” a single import.

**Files:**
- Create: `loomis-course-app/src/app/tailwind.css`

**Step 1: Create `src/app/tailwind.css`**

Recommended starting contents:

```css
/* Tailwind v4 entry (utilities-first; intentionally NO preflight) */
@plugin "tailwindcss-animate";

/* Align `dark:` with the app’s theme toggle (html/body `data-theme="dark"`) */
@custom-variant dark (&:is([data-theme="dark"] *));

@import "tailwindcss/theme";
@import "tailwindcss/utilities";

/* If you ever decide Preflight is worth it (high regression risk), add:
@import "tailwindcss/preflight";
and then immediately validate all baseline screenshots. */
```

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

From `loomis-course-app/`:

```bash
npm run build
```

Expected: build succeeds.

---

## Task 3: Update Tailwind content scanning (minimal → expand only when needed)

**Why:** Tailwind only generates utilities for classnames found in `content`. Expanding too aggressively can bloat CSS and pick up false positives from arbitrary strings.

**Files:**
- Modify: `loomis-course-app/tailwind.config.ts`

**Step 1 (recommended default): keep it sandbox-focused**

If you’re still only using Tailwind in `src/app/sandbox/**`, keep content limited:

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

**Step 3: Verify**

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

Pick ONE approach:

- **Option A (recommended now): delete the shadcn-like token blocks**
  - Remove the `@theme inline { ... }`, `:root { ... }`, `.dark { ... }`, and `@layer base { ... }` blocks from `sandbox.css` unless you have sandbox components that explicitly depend on `bg-background`, `text-foreground`, etc.
  - This makes sandbox styling “just Tailwind utilities + explicit CSS”, and prevents confusion when promoting experiments to production.

- **Option B (if you need those tokens): scope them to sandbox only**
  - Wrap sandbox routes in a container (e.g. `<div className="sandbox-scope">`) in `src/app/sandbox/layout.tsx`.
  - Change `:root { --background: ... }` → `.sandbox-scope { --background: ... }`
  - Change `.dark { ... }` → `[data-theme="dark"] .sandbox-scope { ... }`
  - This prevents sandbox tokens from overwriting app tokens at the root level.

**Step 3: Verify**

```bash
cd loomis-course-app
npm run build
```

---

## Task 5: Create a low-risk Tailwind “smoke test” route (optional but recommended)

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

---

## Verification checklist (Phase 2)

- [ ] `loomis-course-app/npm run build` succeeds
- [ ] Existing routes (`/browser`, `/planner`, `/onboarding`) look unchanged (fonts, spacing, form controls)
- [ ] `/sandbox` still renders correctly
- [ ] Tailwind utilities work outside sandbox (via `/test-tailwind`)
- [ ] No sandbox token collisions with `globals.css` (either removed or scoped)
