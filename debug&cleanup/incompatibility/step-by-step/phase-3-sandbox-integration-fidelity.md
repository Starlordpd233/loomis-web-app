# Phase 3: Sandbox Integration (Fidelity-First)

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

> [!NOTE]
> **Code Snippets Disclaimer:** Snippets illustrate intent; implement production-quality changes as needed.

**Goal:** Port each design idea into sandbox with visual fidelity preservation, using Tailwind for layout/spacing/typography and CSS Modules for complex selectors, keyframes, and non-utility styling.

**Architecture:** **Features-First.** Port design ideas into `src/features/` (production-ready code lives here). Create thin wrapper routes in `/sandbox/...` that simply import and render the feature components. This separation ensures Phase 5 promotion is trivial: production routes just import from `src/features/` the same way sandbox does, avoiding code duplication or file moves. Rewrite styled-components to Tailwind during porting.


**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS v4, CSS Modules, lucide-react

---

## Prerequisites

- Phase 2 complete (Tailwind global and stable)
- Working directory: **Repo Root**
- Dev server runs on port `3001` (`cd loomis-course-app && npm run dev`)
- Inventories exist for each design idea (from Phase 1)
- Design ideas to port:
  - `design_ideas/browser/current` → `src/features/browser/enhanced-explorer`
  - `design_ideas/browser/my_list_sidebar` → `src/features/browser/my-list-sidebar`
  - (Optional) `design_ideas/sandbox/sandbox-landing-page` → `/sandbox/landing` (sandbox UX only; no production promotion by default)

> [!NOTE]
> **Existing Sandbox Experiment:** There is already a placeholder sandbox experiment at `loomis-course-app/src/app/sandbox/browser/current/page.tsx`. This plan treats that as a starting point.

---

## Critical porting rules

> [!WARNING]
> When porting design ideas to sandbox:
>
> 1. **No external font fetches** — Use Proxima Nova (already global in `globals.css`)
> 2. **No Tailwind CDN** — Use the app's Tailwind v4 build (set up in Phase 2)
> 3. **Rewrite styled-components** — Convert to Tailwind utilities or CSS Modules. The escape hatch below exists, but it must be treated as an **absolute last resort**.
> 4. **Standardize icons** — Use `lucide-react` (already installed in app)
> 5. **No client-side secrets (Gemini is server-only)** — **DO NOT PORT** `design_ideas/browser/current/services/geminiService.ts` or any Vite env injection (`process.env.API_KEY`). Use a Next.js Route Handler (`/api/gemini`) or mock responses.
> 6. **Use absolute imports (`@/...`)** — All imports must use the `@/` path alias (e.g., `@/components/Button`). This ensures Phase 5 file moves don't break imports.
> 7. **Storage safety** — Sandbox experiments must not corrupt production localStorage. Default to isolated/prefixed keys for sandbox, and only touch production keys during explicit Phase 5 compatibility work.

---

## Storage Safety (Required Guardrail)

**Default policy:** sandbox experiments must not write to production keys like `plan`, `plannerV2`, `catalogPrefs`, or `onboardingIntroSeen`.

Recommended approaches (pick one and document it in the PR):
1. **Prefixed keys:** use a `sandbox:<experimentId>:...` prefix for any localStorage usage in sandbox-only code.
2. **Separate browser profile:** use a dedicated Chrome profile (or Incognito) for sandbox work so production data is never at risk.

Only touch production keys during **Phase 5 Storage Compatibility** verification.

---

## Fallback: Styled-Components Coexistence (Escape Hatch)

> [!WARNING]
> **ABSOLUTE LAST RESORT — avoid almost always.** Phase 3’s intended outcome is **Tailwind + CSS Modules**, with **zero styled-components**.
>
> Only use this escape hatch if it is **ABSOLUTELY necessary** to unblock the migration.
>
> **“Absolutely necessary” means:** after a time-boxed rewrite attempt, you cannot achieve acceptable fidelity/functionality using Tailwind + CSS Modules (and a reasonable approximation is not acceptable), and keeping styled-components is the only practical path forward.
>
> **Before you adopt this escape hatch, you MUST:**
> 1. **Attempt the rewrite first (time-boxed)**: spend ~2–4 hours trying Tailwind + CSS Modules.
> 2. **Try standard alternatives**:
>    - CSS Modules for complex selectors, keyframes, pseudo-elements
>    - Conditional `className` composition (`clsx`, `cva`, ternaries)
>    - `data-*` attributes + CSS Modules for state-driven styling
>    - Minimal inline styles only for truly dynamic values (e.g., computed widths)
> 3. **Document why this is unavoidable**: include reason + tracking ID + removal criteria (Step 0 template below).
>
> **Exit requirement:** if you use this escape hatch, plan and schedule its removal. Do not let styled-components become the default styling system for features.

> [!CAUTION]
> **Hydration/streaming risk (React 19 + Next.js App Router):** styled-components SSR integration is easy to get subtly wrong. If you use this escape hatch:
> - Validate in a production build (`npm run build` + `next start`), not just `npm run dev`
> - Scope the registry to the smallest route subtree possible
> - Treat any hydration mismatch warnings as a stop-the-line issue

If—and only if—you determine the escape hatch is absolutely necessary (criteria above), proceed with the steps below.

**Step 0: Document the exception (required)**

Add this comment block at the top of any file that uses styled-components:

```ts
// ESCAPE_HATCH(styled-components): ABSOLUTE_LAST_RESORT
// Reason: <why Tailwind/CSS Modules could not replicate this component quickly/safely>
// Tracking: <issue-id-or-task-id>
// Removal: <criteria/date/phase when this must be rewritten to Tailwind>
```

**Step 1: Install styled-components registry for Next.js App Router**

```bash
cd loomis-course-app
npm install styled-components
npm install -D @types/styled-components
```

**Step 2: Create the registry file**

```typescript
// loomis-course-app/src/lib/styled-components-registry.tsx
'use client';

import React, { useState } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { ServerStyleSheet, StyleSheetManager } from 'styled-components';

export default function StyledComponentsRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());

  useServerInsertedHTML(() => {
    const styles = styledComponentsStyleSheet.getStyleElement();
    styledComponentsStyleSheet.instance.clearTag();
    return <>{styles}</>;
  });

  if (typeof window !== 'undefined') return <>{children}</>;

  return (
    <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>
      {children}
    </StyleSheetManager>
  );
}
```

**Step 3: Scope the registry as narrowly as possible (recommended)**

```typescript
// Prefer wrapping only the experiment route tree that needs styled-components,
// rather than the entire /sandbox section.
//
// Example: loomis-course-app/src/app/sandbox/browser/current/layout.tsx
import StyledComponentsRegistry from '@/lib/styled-components-registry';

export default function CurrentSandboxLayout({ children }: { children: React.ReactNode }) {
  return (
    <StyledComponentsRegistry>
      <div className="sandbox-scope">{children}</div>
    </StyledComponentsRegistry>
  );
}
```

**Step 4: Mark component for later refactoring**

Add the explicit escape-hatch comment from **Step 0** at the top of any component using styled-components. A plain TODO is not sufficient—capture **why** it’s necessary and **how/when** it will be removed.

---

## Contingency: Scoped Reset for Preflight-Dependent Components

> [!NOTE]
> **Apply this only if ported components look visually broken** (e.g., buttons with double borders, headings with unexpected margins, box-sizing issues).

The Vite design ideas may have assumed Tailwind Preflight (CSS reset) was enabled. Since Preflight is disabled in the main app (Phase 2), some components may render incorrectly.

**Symptoms to watch for:**
- Borders appearing as `double` instead of `solid`
- Headings/paragraphs having browser-default margins
- Box-sizing causing layout overflow issues
- Form elements looking inconsistent

**If symptoms occur, apply a scoped reset:**

**Step 1: Create a sandbox reset class in `sandbox.css`**

```css
/* loomis-course-app/src/app/sandbox/sandbox.css */
.sandbox-reset {
  /* Mimic Tailwind Preflight for sandbox containers */
  *, *::before, *::after {
    box-sizing: border-box;
    border-width: 0;
    border-style: solid;
  }
  h1, h2, h3, h4, h5, h6, p {
    margin: 0;
  }
  button, input, select, textarea {
    font-family: inherit;
    font-size: 100%;
    line-height: inherit;
  }
}
```

**Step 2: Wrap sandbox components with the reset class**

```typescript
// In sandbox page.tsx
export default function SandboxExperimentPage() {
  return (
    <div className="sandbox-reset">
      <PortedComponent />
    </div>
  );
}
```

**Step 3: Verify visual improvement**

Compare before/after. If component now matches the original Vite prototype, the Preflight assumption was the issue.

**Alternative: PostCSS Prefix Selector (Advanced)**

For a more automated approach, use `postcss-prefix-selector` to scope Preflight:

```bash
npm install postcss-prefix-selector
```

Then configure in `postcss.config.mjs` to prefix Preflight rules with `.sandbox-scope`. This is more elegant but adds build complexity.

---

## Recommended porting order

Based on complexity (from Phase 1 inventories):

1. **`my_list_sidebar`** (simpler: mostly Tailwind + lucide icons)
2. **`current`** (harder: styled-components + Gemini API integration)
3. **`sandbox-landing-page`** (optional: sandbox UX only; do not promote unless intentionally replacing `/sandbox`)

---

## Task 1: Update Tailwind Content Config

**Goal:** Ensure Tailwind generates styles for the new `src/features` directory.

**Files:**
- Modify: `loomis-course-app/tailwind.config.ts`

**Step 1: Add features directory to content**

```typescript
content: [
  './src/app/sandbox/**/*.{js,ts,jsx,tsx,mdx}',
  './src/features/**/*.{js,ts,jsx,tsx,mdx}', // Add this line
],
```

**Step 2: Verify**

```bash
cd loomis-course-app
npm run build
```

---

## Task 2: Verify sandbox structure from Phase 1

**Goal:** Confirm the sandbox stubs created in Phase 1 still work.

**Step 1: Check existing stubs**

```bash
ls -la loomis-course-app/src/app/sandbox/browser/
```

Expected: `current/` and `my-list-sidebar/` directories with `page.tsx` stubs

**Step 2: Verify they render**

```bash
cd loomis-course-app
npm run dev
# Visit http://localhost:3001/sandbox/browser/current
# Visit http://localhost:3001/sandbox/browser/my-list-sidebar
# Visit http://localhost:3001/sandbox/landing (if created in Phase 1)
```

---

## Task 3: Port my_list_sidebar (simpler design idea)

**Goal:** Convert `design_ideas/browser/my_list_sidebar` to a production-ready feature component.

**Files:**
- Read: `design_ideas/browser/my_list_sidebar/index.html` (or App.tsx)
- Create: `loomis-course-app/src/features/browser/my-list-sidebar/`
- Modify: `loomis-course-app/src/app/sandbox/browser/my-list-sidebar/page.tsx`

**Step 1: Analyze the original design idea**

```bash
ls -la design_ideas/browser/my_list_sidebar/
cat design_ideas/browser/my_list_sidebar/index.html | head -100
```

**Step 2: Create feature directory**

```bash
mkdir -p loomis-course-app/src/features/browser/my-list-sidebar/components
```

**Step 3: Port the main component to `src/features`**

Create the feature component logic here immediately (do not build in sandbox folder).

```typescript
// loomis-course-app/src/features/browser/my-list-sidebar/MyListSidebar.tsx
'use client';

import { useState } from 'react';
// Import sub-components from ./components/

export function MyListSidebar(): JSX.Element {
  // Port state and logic
  // Rewrite styled-components to Tailwind
  // Use lucide-react icons

  return (
    <div className="min-h-screen">
      {/* Component JSX */}
    </div>
  );
}
```

Create index export:
```typescript
// loomis-course-app/src/features/browser/my-list-sidebar/index.ts
export { MyListSidebar } from './MyListSidebar';
```

**Step 4: Update sandbox wrapper**

Imports the feature component.

```typescript
// loomis-course-app/src/app/sandbox/browser/my-list-sidebar/page.tsx
import { MyListSidebar } from '@/features/browser/my-list-sidebar';

export default function MyListSidebarPage(): JSX.Element {
  return <MyListSidebar />;
}
```

**Step 5: Verify**

```bash
cd loomis-course-app
npm run dev
# Visit http://localhost:3001/sandbox/browser/my-list-sidebar
```

**Step 6: Commit**

```bash
git add loomis-course-app/src/features/browser/my-list-sidebar/
git add loomis-course-app/src/app/sandbox/browser/my-list-sidebar/
git commit -m "feat: port my_list_sidebar to src/features and wire to sandbox"
```

---

## Task 4: Port current (enhanced explorer)

**Goal:** Convert `design_ideas/browser/current` to a production-ready feature component.

**Files:**
- Read: `design_ideas/browser/current/`
- Create: `loomis-course-app/src/features/browser/enhanced-explorer/`
- Modify: `loomis-course-app/src/app/sandbox/browser/current/page.tsx`

**Step 1: Create feature directory**

```bash
mkdir -p loomis-course-app/src/features/browser/enhanced-explorer/components
```

**Step 2: Port and rewrite components to `src/features`**

Create components in `src/features/browser/enhanced-explorer/`.
- Rewrite styled-components to Tailwind.
- Use `lucide-react`.

**Step 2.5 (Required): Establish Gemini server boundary (or mock)**

Before wiring any “AI advice” UI:
- Do **not** port `design_ideas/browser/current/services/geminiService.ts`
- Implement `/api/gemini` as a server Route Handler (or run in `MOCK_GEMINI=true` mode during parity work)
- Ensure the client only calls `/api/gemini` (never reads `GEMINI_API_KEY` directly)

Example structure:
- `EnhancedExplorer.tsx` (Main export)
- `components/SearchBar.tsx`
- `components/CourseCard.tsx`

**Step 3: Create index export**

```typescript
// loomis-course-app/src/features/browser/enhanced-explorer/index.ts
export { EnhancedExplorer } from './EnhancedExplorer';
```

**Step 4: Update sandbox wrapper**

```typescript
// loomis-course-app/src/app/sandbox/browser/current/page.tsx
import { EnhancedExplorer } from '@/features/browser/enhanced-explorer';

export default function EnhancedExplorerPage(): JSX.Element {
  return <EnhancedExplorer />;
}
```

**Step 5: Test and Verify**

```bash
cd loomis-course-app
npm run dev
# Visit http://localhost:3001/sandbox/browser/current
```

**Step 6: Commit**

```bash
git add loomis-course-app/src/features/browser/enhanced-explorer/
git add loomis-course-app/src/app/sandbox/browser/current/
git commit -m "feat: port enhanced-explorer to src/features and wire to sandbox"
```

---

## Task 5: Update experiments registry (if exists)

**Goal:** Register ported experiments in the sandbox registry.

**Files:**
- Check: `loomis-course-app/src/app/sandbox/experiments.ts`

**Step 1: Check if registry exists**

```bash
ls -la loomis-course-app/src/app/sandbox/experiments.ts 2>/dev/null || echo "No registry"
```

**Step 2: If exists, update entries**

Update status from `'stub'` to `'wip'` or `'complete'`:

```typescript
{
  name: 'Enhanced Explorer',
  description: 'AI-enhanced course catalog explorer',
  path: '/sandbox/browser/current',
  status: 'wip', // or 'complete' if fully ported
  sourceRef: 'design_ideas/browser/current',
},
{
  name: 'My List Sidebar',
  description: 'Course list sidebar with drag-and-drop',
  path: '/sandbox/browser/my-list-sidebar',
  status: 'wip', // or 'complete' if fully ported
  sourceRef: 'design_ideas/browser/my_list_sidebar',
},
```

If you implemented `/sandbox/landing` (Task 6), register it here as a sandbox UX experiment (and keep it out of Phase 5 promotion by default).

**Step 3: Verify sandbox index**

```bash
cd loomis-course-app
npm run dev
# Visit http://localhost:3001/sandbox
```

Verify experiments appear correctly.

**Step 4: Commit if updated**

```bash
git add loomis-course-app/src/app/sandbox/experiments.ts
git commit -m "feat: update experiment registry after porting"
```

---

## Task 6 (Optional): Port sandbox/sandbox-landing-page

**Goal:** Port the sandbox landing-page prototype if you chose to include it in Phase 1 Task 3.

> [!IMPORTANT]
> This is sandbox UX only. It should not be part of Phase 5 “production promotion” unless you explicitly decide to replace the sandbox index UI.

**Option A (recommended default): keep it as a sandbox experiment route**
- Implement at: `loomis-course-app/src/app/sandbox/landing/page.tsx`
- Treat it like any other sandbox experiment (promotion rules do not apply)

**Option B: replace the sandbox index UI**
- Refactor: `loomis-course-app/src/app/sandbox/page.tsx` to match the design idea
- Keep the experiments registry behavior intact (categories + links)

> [!WARNING]
> If the prototype references Gemini:
> - Do not inline keys (no `process.env.API_KEY` on client)
> - Use the “Gemini Integration Architecture” pattern below or mock mode

---

## Gemini Integration Architecture

**Goal:** Securely integrate Gemini AI capabilities without exposing secrets on the client.

> [!CAUTION]
> **Never call Gemini from client components with real API keys.** Client-side code is visible to users and secrets will be exposed.
>
> **Explicit ban:** Do **not** port `design_ideas/browser/current/services/geminiService.ts` into Next.js client code. It assumes Vite-style env injection and will expose secrets.

**Recommended Pattern:**

1. **Create a Next.js Route Handler (server-side)**
   ```typescript
   // loomis-course-app/src/app/api/gemini/route.ts
   import { NextRequest, NextResponse } from 'next/server';
   
   export async function POST(request: NextRequest) {
     // Only this server-side code can access the real API key
     const apiKey = process.env.GEMINI_API_KEY;
     if (!apiKey) {
       return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
     }
     
     const body = await request.json();
     // Call Gemini API here...
     return NextResponse.json({ response: '...' });
   }
   ```

2. **Call the route handler from client components**
   ```typescript
   // In your component
   const response = await fetch('/api/gemini', {
     method: 'POST',
     body: JSON.stringify({ prompt: '...' }),
   });
   ```

3. **Standardize env var naming to `GEMINI_API_KEY`** (the prototype uses `API_KEY`)

4. **Mock mode for parity testing:** Add a `MOCK_GEMINI=true` env var to return static responses during visual testing

---

## Fidelity Checklist

For each ported experiment, verify:

### Visual Fidelity
- [ ] Layout matches original (grid, flex, positioning)
- [ ] Spacing matches original (margins, padding, gaps)
- [ ] Typography matches (use Proxima Nova instead of external fonts)
- [ ] Colors match original
- [ ] Borders and shadows match

### Icon Fidelity (Accepted Deviation)

> [!TIP]
> **Icons will look different. This is expected and acceptable.**

- [ ] All icons converted from FontAwesome to `lucide-react`
- [ ] Icon placement and sizing are correct
- [ ] **Accept visual differences:** Lucide icons are stroke-based (thinner lines) while FontAwesome solid icons are filled. Do not spend time trying to make Lucide match FontAwesome exactly.

| FontAwesome Style | Lucide Equivalent | Visual Difference |
|-------------------|-------------------|-------------------|
| `fas fa-star` (solid) | `<Star />` | Lighter, stroke-based |
| `fas fa-search` | `<Search />` | Thinner lines |
| `fas fa-times` | `<X />` | Different silhouette |

### Functional Fidelity
- [ ] Interactive states work (hover, focus, active)
- [ ] Animations/transitions match original
- [ ] Forms/inputs work correctly
- [ ] Click handlers work

### Technical Quality
- [ ] **Preferred:** No styled-components imports remain
  - [ ] **If escape hatch was used (absolute last resort):** usage is narrowly scoped, includes the `ESCAPE_HATCH(styled-components)` comment + tracking reference, and has an explicit removal plan (do not allow it to become permanent)
- [ ] All icons use lucide-react
- [ ] No external font fetches
- [ ] No Tailwind CDN usage
- [ ] All imports use `@/` absolute paths
- [ ] TypeScript compiles without errors
- [ ] Build passes

### Logic Verification (Required)

> [!IMPORTANT]
> **Visual validation alone is insufficient.** Write at least one smoke test to verify interactive logic works correctly.

For **my-list-sidebar** (drag-and-drop):
- [ ] Test: Items can be added to the list
- [ ] Test: Items can be removed from the list
- [ ] Test: List state persists (if applicable)

For **current** (enhanced explorer):
- [ ] Test: Search filtering returns correct results
- [ ] Test: Course cards render with expected data
- [ ] Test: AI response handling (mock the API)

**Example smoke test pattern:**

```typescript
// loomis-course-app/tests/sandbox/my-list-sidebar.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { MyListSidebar } from '@/features/browser/my-list-sidebar';

describe('MyListSidebar', () => {
  it('adds item to list when add button clicked', async () => {
    render(<MyListSidebar />);
    const user = userEvent.setup();
    const addButton = screen.getByRole('button', { name: /add/i });
    await user.click(addButton);
    await waitFor(() => {
      expect(screen.getByText(/item added/i)).toBeInTheDocument();
    });
  });
});
```

**Run tests:**

```bash
cd loomis-course-app
npm run test:run -- tests/sandbox/
```

---

## Verification Checklist for Phase 3

- [ ] `npm run build` succeeds in `loomis-course-app`
- [ ] `/sandbox/browser/my-list-sidebar` renders ported component
- [ ] `/sandbox/browser/current` renders ported component
- [ ] `/sandbox/landing` renders (if you chose to port sandbox-landing-page)
- [ ] No styled-components runtime errors
- [ ] No console errors on load
- [ ] TypeScript compilation passes: `cd loomis-course-app && npx tsc --noEmit`
- [ ] Tailwind classes work in all components

---

## 🛑 CHECKPOINT [Phase 3]: Sandbox Integration Complete

> **STOP:** Verify all design ideas are ported before proceeding to visual validation.

**Verification:**
- [ ] `my_list_sidebar` is ported and renders
- [ ] `current` is ported and renders
- [ ] `sandbox-landing-page` is ported (optional; only if chosen in Phase 1)
- [ ] **Preferred:** styled-components fully rewritten to Tailwind (escape hatch avoided)
  - [ ] **If escape hatch was used (absolute last resort):** scoped narrowly + tracked + scheduled for removal before Phase 5 promotion
- [ ] Build passes
- [ ] No console errors

**Next Phase:** Phase 4 — Visual Parity Validation (compare sandbox to prototypes)

---

## Rollback

If a port causes issues:

1. Revert to stub version:
   ```bash
   git checkout HEAD -- loomis-course-app/src/app/sandbox/browser/current/
   git checkout HEAD -- loomis-course-app/src/app/sandbox/browser/my-list-sidebar/
   ```

2. The original design ideas remain untouched in `design_ideas/browser/`.

3. If experiments registry was updated, revert:
   ```bash
   git checkout HEAD -- loomis-course-app/src/app/sandbox/experiments.ts
   ```
