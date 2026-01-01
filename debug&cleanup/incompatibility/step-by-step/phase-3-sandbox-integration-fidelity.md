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
> 3. **Rewrite styled-components** — Convert to Tailwind utilities or CSS Modules
> 4. **Standardize icons** — Use `lucide-react` (already installed in app)
> 5. **No real secrets** — Use environment variables or mock data for APIs

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

### Functional Fidelity
- [ ] Interactive states work (hover, focus, active)
- [ ] Animations/transitions match original
- [ ] Forms/inputs work correctly
- [ ] Click handlers work

### Technical Quality
- [ ] No styled-components imports remain
- [ ] All icons use lucide-react
- [ ] No external font fetches
- [ ] No Tailwind CDN usage
- [ ] TypeScript compiles without errors
- [ ] Build passes

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
