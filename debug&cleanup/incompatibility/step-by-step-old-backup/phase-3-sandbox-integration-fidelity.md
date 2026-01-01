# Phase 3: Sandbox Integration (Fidelity-First)

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

> [!NOTE]
> **Code Snippets Disclaimer:** Snippets illustrate intent; implement production-quality changes as needed.

**Goal:** Port each design idea into sandbox with visual fidelity preservation, using Tailwind for layout/spacing/typography and CSS Modules for complex selectors, keyframes, and non-utility styling.

**Architecture:** Each design idea gets its own sandbox route. Rewrite styled-components to Tailwind utilities, fix TypeScript types, standardize icons to lucide-react (already in the app), and register experiments in experiments.ts.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS v4, CSS Modules, lucide-react

---

## Prerequisites

- Phase 2 complete (Tailwind global and stable)
- Working directory: `loomis-course-app/`
- Dev server runs on port `3001` (`npm run dev`)
- Inventories exist for each design idea (from Phase 1)
- Design ideas to port:
  - `design_ideas/browser/current` → `/sandbox/browser/current`
  - `design_ideas/browser/my_list_sidebar` → `/sandbox/browser/my-list-sidebar`

---

## Critical porting rules

> [!WARNING]
> When porting design ideas to sandbox:
>
> 1. **No external font fetches** — Use Proxima Nova (already global in `globals.css`)
> 2. **No Tailwind CDN** — Use the app's Tailwind v4 build (set up in Phase 2)
> 3. **Rewrite styled-components** — Convert to Tailwind utilities or CSS Modules (see fallback below for complex cases)
> 4. **Standardize icons** — Use `lucide-react` (already installed in app)
> 5. **No real secrets** — Use environment variables or mock data for APIs
> 6. **Use absolute imports (`@/...`)** — All imports must use the `@/` path alias (e.g., `@/components/Button`). This ensures Phase 5 file moves don't break imports.

---

## Fallback: Styled-Components Coexistence (Escape Hatch)

> [!NOTE]
> **Use this only for genuinely complex components** where styled-components have dynamic props tightly coupled to styling logic. The primary goal remains rewriting to Tailwind.

If a styled-component is too complex to rewrite quickly (e.g., uses `${props => ...}` extensively for dynamic styling):

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

**Step 3: Wrap sandbox layout with the registry**

```typescript
// loomis-course-app/src/app/sandbox/layout.tsx
import StyledComponentsRegistry from '@/lib/styled-components-registry';

export default function SandboxLayout({ children }) {
  return (
    <StyledComponentsRegistry>
      {children}
    </StyledComponentsRegistry>
  );
}
```

**Step 4: Mark component for later refactoring**

Add a `// TODO: Refactor styled-components to Tailwind` comment at the top of any component using this fallback.

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

---

## Task 1: Verify sandbox structure from Phase 1

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
```

---

## Task 2: Port my_list_sidebar (simpler design idea)

**Goal:** Convert `design_ideas/browser/my_list_sidebar` to working sandbox component.

**Files:**
- Read: `design_ideas/browser/my_list_sidebar/index.html` (or App.tsx)
- Modify: `loomis-course-app/src/app/sandbox/browser/my-list-sidebar/page.tsx`
- Create: `loomis-course-app/src/app/sandbox/browser/my-list-sidebar/components/` (if needed)

**Step 1: Analyze the original design idea**

```bash
ls -la design_ideas/browser/my_list_sidebar/
cat design_ideas/browser/my_list_sidebar/index.html | head -100
```

Identify:
- Main component structure
- Tailwind classes used (will work directly)
- Any external dependencies

**Step 2: Create component structure**

If needed, create component subdirectory:

```bash
mkdir -p loomis-course-app/src/app/sandbox/browser/my-list-sidebar/components
```

**Step 3: Port the main component**

Replace the stub in `page.tsx` with the actual ported component:

```typescript
// loomis-course-app/src/app/sandbox/browser/my-list-sidebar/page.tsx
'use client';

import { useState } from 'react';
// Import components from ./components/ as needed

export default function MyListSidebarPage() {
  // Port state and logic from original
  // Replace styled-components with Tailwind classes
  // Use lucide-react icons instead of any other icon library

  return (
    <div className="min-h-screen">
      {/* Port the component structure here */}
    </div>
  );
}
```

**Step 4: Verify lucide-react is available**

```bash
cd loomis-course-app
grep "lucide-react" package.json
```

Expected: lucide-react is listed in dependencies (already installed)

**Step 5: Test the ported component**

```bash
cd loomis-course-app
npm run dev
# Visit http://localhost:3001/sandbox/browser/my-list-sidebar
```

Compare visually with the original prototype running at `design_ideas/browser/my_list_sidebar/index.html`.

**Step 6: Verify build passes**

```bash
cd loomis-course-app
npm run build
```

**Step 7: Commit the port**

```bash
git add loomis-course-app/src/app/sandbox/browser/my-list-sidebar/
git commit -m "feat: port my_list_sidebar design idea to sandbox"
```

---

## Task 3: Port current (enhanced explorer - more complex)

**Goal:** Convert `design_ideas/browser/current` to working sandbox component with styled-components rewritten to Tailwind.

**Files:**
- Read: `design_ideas/browser/current/` (examine structure)
- Modify: `loomis-course-app/src/app/sandbox/browser/current/page.tsx`
- Create: `loomis-course-app/src/app/sandbox/browser/current/components/`

**Step 1: Analyze the original design idea**

```bash
ls -la design_ideas/browser/current/
```

Check for styled-components usage:

```bash
grep -rn "styled\." design_ideas/browser/current/ --include="*.tsx" --include="*.jsx" | head -20
```

**Step 2: Create component structure**

```bash
mkdir -p loomis-course-app/src/app/sandbox/browser/current/components
```

**Step 3: Plan the styled-components rewrite**

For each styled-component found, plan the Tailwind equivalent. Example:

Original styled-component:
```javascript
const SearchWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 600px;
  transition: all 0.3s;

  &:focus-within {
    transform: scale(1.02);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }
`;
```

Tailwind equivalent:
```tsx
<div className="relative w-full max-w-[600px] transition-all duration-300
                focus-within:scale-[1.02] focus-within:shadow-xl">
```

**Step 4: Port and rewrite components**

Create each component in `components/` directory:
- Replace styled-components with Tailwind classes
- Replace icon imports with lucide-react
- Fix any TypeScript types (no `any` types)

**Step 5: Handle API dependencies**

If the design idea uses external APIs (e.g., Gemini):
- Gate behind environment variable check
- Provide mock data fallback for development

```typescript
const ENABLE_GEMINI = process.env.NEXT_PUBLIC_ENABLE_GEMINI === 'true';

const getAiAdvice = async (query: string) => {
  if (!ENABLE_GEMINI) {
    return mockAiResponse; // Return mock data
  }
  // Real API call
};
```

**Step 6: Create the main page**

```typescript
// loomis-course-app/src/app/sandbox/browser/current/page.tsx
'use client';

import { useState } from 'react';
// Import ported components

export default function EnhancedExplorerPage() {
  // State and logic ported from original

  return (
    <div className="min-h-screen">
      {/* Ported component structure */}
    </div>
  );
}
```

**Step 7: Test the ported component**

```bash
cd loomis-course-app
npm run dev
# Visit http://localhost:3001/sandbox/browser/current
```

Compare visually with the original prototype.

**Step 8: Verify no styled-components remain**

```bash
grep -rn "styled\." loomis-course-app/src/app/sandbox/browser/current/ --include="*.tsx"
```

Expected: No matches (all rewritten to Tailwind)

**Step 9: Verify build passes**

```bash
cd loomis-course-app
npm run build
```

**Step 10: Commit the port**

```bash
git add loomis-course-app/src/app/sandbox/browser/current/
git commit -m "feat: port enhanced explorer design idea to sandbox (styled-components rewritten to Tailwind)"
```

---

## Task 4: Update experiments registry (if exists)

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
- [ ] No styled-components imports remain (unless using fallback escape hatch)
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
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MyListSidebar from '@/features/browser/my-list-sidebar';

describe('MyListSidebar', () => {
  it('adds item to list when add button clicked', () => {
    render(<MyListSidebar />);
    const addButton = screen.getByRole('button', { name: /add/i });
    fireEvent.click(addButton);
    expect(screen.getByText(/item added/i)).toBeInTheDocument();
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
- [ ] No styled-components runtime errors
- [ ] No console errors on load
- [ ] TypeScript compilation passes
- [ ] Tailwind classes work in all components

---

## 🛑 CHECKPOINT [Phase 3]: Sandbox Integration Complete

> **STOP:** Verify all design ideas are ported before proceeding to visual validation.

**Verification:**
- [ ] `my_list_sidebar` is ported and renders
- [ ] `current` is ported and renders
- [ ] styled-components fully rewritten to Tailwind
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
