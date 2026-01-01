# Phase 5: Production Promotion

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

> [!NOTE]
> **Code Snippets Disclaimer:** Snippets illustrate intent; implement production-quality changes as needed.

**Goal:** Promote validated sandbox experiments to production routes.

**Architecture:** Manual promotion process. Copy sandbox components to production feature directories, update navigation, verify build passes, and commit. No feature flags or rollout stages required for initial deployment.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS v4

---

## Prerequisites

- Phase 4 complete (visual parity validated)
- Working directory: `loomis-course-app/`
- All sandbox routes render correctly:
  - `/sandbox/browser/current`
  - `/sandbox/browser/my-list-sidebar`
- Visual comparison passed for both design ideas
- Build passes: `npm run build`

---

## Task 1: Create production feature directory

**Goal:** Set up the production directory structure for promoted components.

**Files:**
- Create: `loomis-course-app/src/features/browser/`

**Step 1: Create directory structure**

```bash
mkdir -p loomis-course-app/src/features/browser
```

**Step 2: Commit structure**

```bash
git add loomis-course-app/src/features/
git commit -m "feat: create production features directory"
```

---

## Task 1.5: Update Tailwind content paths (CRITICAL)

> [!CAUTION]
> **This step is mandatory.** Without it, all Tailwind utilities in `src/features/` will fail to generate CSS, causing invisible/broken styles.

**Goal:** Extend Tailwind's content scanning to include the production features directory.

**Files:**
- Modify: `loomis-course-app/tailwind.config.ts`

**Step 1: Update content array**

Add the `src/features/` path to the content configuration:

```typescript
// loomis-course-app/tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/sandbox/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}', // <-- REQUIRED for promoted components
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
```

**Step 2: Verify Tailwind still works**

```bash
cd loomis-course-app
npm run build
```

Expected: Build succeeds. No change to existing behavior since `src/features/` is empty.

**Step 3: Commit configuration change**

```bash
git add loomis-course-app/tailwind.config.ts
git commit -m "config: add src/features to Tailwind content paths"
```

---

## Task 2: Promote current (Enhanced Explorer) — Move-and-Import Strategy

**Goal:** Move the validated sandbox component to production, then update sandbox to import from production.

> [!IMPORTANT]
> **Do NOT copy files.** Move them, then create import wrappers. This prevents code duplication and ensures sandbox always reflects production code.

**Files:**
- Move: `loomis-course-app/src/app/sandbox/browser/current/*` → `loomis-course-app/src/features/browser/enhanced-explorer/`
- Modify: `loomis-course-app/src/app/sandbox/browser/current/page.tsx` (becomes import wrapper)

**Step 1: Move component files to production**

```bash
# Move all files except page.tsx first
mv loomis-course-app/src/app/sandbox/browser/current/components loomis-course-app/src/features/browser/enhanced-explorer/
mv loomis-course-app/src/app/sandbox/browser/current/*.module.css loomis-course-app/src/features/browser/enhanced-explorer/ 2>/dev/null || true
mv loomis-course-app/src/app/sandbox/browser/current/*.css loomis-course-app/src/features/browser/enhanced-explorer/ 2>/dev/null || true
```

**Step 2: Create the main component file in features**

Extract the component logic from the sandbox `page.tsx` into a standalone component:

```typescript
// loomis-course-app/src/features/browser/enhanced-explorer/EnhancedExplorer.tsx
'use client';

// Move all imports, state, and JSX from the original page.tsx here
// Update relative imports to reflect new location

export function EnhancedExplorer() {
  // ... component implementation
}

export default EnhancedExplorer;
```

**Step 3: Create index export**

```typescript
// loomis-course-app/src/features/browser/enhanced-explorer/index.ts
export { EnhancedExplorer, default } from './EnhancedExplorer';
```

**Step 4: Update sandbox page.tsx to be an import wrapper**

Replace the sandbox page with a thin wrapper that imports from production:

```typescript
// loomis-course-app/src/app/sandbox/browser/current/page.tsx
import EnhancedExplorer from '@/features/browser/enhanced-explorer';

export default function EnhancedExplorerPage() {
  return <EnhancedExplorer />;
}
```

**Step 5: Verify both routes work**

```bash
cd loomis-course-app
npm run dev
# Visit http://localhost:3001/sandbox/browser/current
# Confirm component renders correctly
```

**Step 6: Verify build passes**

```bash
cd loomis-course-app
npm run build
```

**Step 7: Commit promotion**

```bash
git add loomis-course-app/src/features/browser/enhanced-explorer/
git add loomis-course-app/src/app/sandbox/browser/current/
git commit -m "feat: promote enhanced explorer to production (move-and-import)"

---

## Task 3: Promote my-list-sidebar — Move-and-Import Strategy

**Goal:** Move the validated sidebar component to production, then update sandbox to import from production.

> [!IMPORTANT]
> **Do NOT copy files.** Move them, then create import wrappers.

**Files:**
- Move: `loomis-course-app/src/app/sandbox/browser/my-list-sidebar/*` → `loomis-course-app/src/features/browser/my-list-sidebar/`
- Modify: `loomis-course-app/src/app/sandbox/browser/my-list-sidebar/page.tsx` (becomes import wrapper)

**Step 1: Move component files to production**

```bash
# Move all files except page.tsx first
mv loomis-course-app/src/app/sandbox/browser/my-list-sidebar/components loomis-course-app/src/features/browser/my-list-sidebar/
mv loomis-course-app/src/app/sandbox/browser/my-list-sidebar/*.module.css loomis-course-app/src/features/browser/my-list-sidebar/ 2>/dev/null || true
mv loomis-course-app/src/app/sandbox/browser/my-list-sidebar/*.css loomis-course-app/src/features/browser/my-list-sidebar/ 2>/dev/null || true
```

**Step 2: Create the main component file in features**

Extract the component logic from the sandbox `page.tsx`:

```typescript
// loomis-course-app/src/features/browser/my-list-sidebar/MyListSidebar.tsx
'use client';

// Move all imports, state, and JSX from the original page.tsx here

export function MyListSidebar() {
  // ... component implementation
}

export default MyListSidebar;
```

**Step 3: Create index export**

```typescript
// loomis-course-app/src/features/browser/my-list-sidebar/index.ts
export { MyListSidebar, default } from './MyListSidebar';
```

**Step 4: Update sandbox page.tsx to be an import wrapper**

```typescript
// loomis-course-app/src/app/sandbox/browser/my-list-sidebar/page.tsx
import MyListSidebar from '@/features/browser/my-list-sidebar';

export default function MyListSidebarPage() {
  return <MyListSidebar />;
}
```

**Step 5: Verify both routes work**

```bash
cd loomis-course-app
npm run dev
# Visit http://localhost:3001/sandbox/browser/my-list-sidebar
# Confirm component renders correctly
```

**Step 6: Verify build passes**

```bash
cd loomis-course-app
npm run build
```

**Step 7: Commit promotion**

```bash
git add loomis-course-app/src/features/browser/my-list-sidebar/
git add loomis-course-app/src/app/sandbox/browser/my-list-sidebar/
git commit -m "feat: promote my-list-sidebar to production (move-and-import)"

---

## Task 4: Integrate into production browser page

**Goal:** Use the promoted components in the production browser route.

**Files:**
- Modify: `loomis-course-app/src/app/(app)/browser/page.tsx` (or equivalent production route)

**Step 1: Check current browser page structure**

```bash
ls -la loomis-course-app/src/app/\(app\)/browser/
cat loomis-course-app/src/app/\(app\)/browser/page.tsx | head -50
```

**Step 2: Import promoted components**

Add imports at the top of the browser page:

```typescript
import { EnhancedExplorer } from '@/features/browser/enhanced-explorer';
import { MyListSidebar } from '@/features/browser/my-list-sidebar';
```

**Step 3: Use components in the page**

Replace or augment existing browser UI with promoted components. Example:

```typescript
export default function BrowserPage() {
  return (
    <div className="min-h-screen">
      <EnhancedExplorer />
      {/* Or integrate MyListSidebar as needed */}
    </div>
  );
}
```

**Step 4: Verify page renders**

```bash
cd loomis-course-app
npm run dev
# Visit http://localhost:3001/browser
```

**Step 5: Verify build passes**

```bash
cd loomis-course-app
npm run build
```

**Step 6: Commit integration**

```bash
git add loomis-course-app/src/app/\(app\)/browser/
git commit -m "feat: integrate promoted components into browser page"
```

---

## Task 5: Update experiments registry

**Goal:** Mark experiments as promoted in the sandbox registry.

**Files:**
- Modify: `loomis-course-app/src/app/sandbox/experiments.ts`

**Step 1: Update status to 'promoted'**

```typescript
{
  name: 'Enhanced Explorer',
  description: 'AI-enhanced course catalog explorer',
  path: '/sandbox/browser/current',
  status: 'complete', // or 'promoted' if you add that status
  sourceRef: 'design_ideas/browser/current',
  promotedTo: '/browser', // Add reference to production route
},
{
  name: 'My List Sidebar',
  description: 'Course list sidebar with drag-and-drop',
  path: '/sandbox/browser/my-list-sidebar',
  status: 'complete',
  sourceRef: 'design_ideas/browser/my_list_sidebar',
  promotedTo: '/browser',
},
```

**Step 2: Verify sandbox index still works**

```bash
cd loomis-course-app
npm run dev
# Visit http://localhost:3001/sandbox
```

**Step 3: Commit registry update**

```bash
git add loomis-course-app/src/app/sandbox/experiments.ts
git commit -m "docs: mark experiments as promoted"
```

---

## Task 6: Final verification

**Goal:** Ensure everything works correctly after promotion.

**Step 1: Run full build**

```bash
cd loomis-course-app
npm run build
```

**Step 2: Test production routes**

```bash
cd loomis-course-app
npm run dev
# Visit http://localhost:3001/browser
# Verify promoted components render correctly
```

**Step 3: Compare with sandbox versions**

Open both routes and verify they look identical:
- Production: `http://localhost:3001/browser`
- Sandbox: `http://localhost:3001/sandbox/browser/current`

**Step 4: Check for console errors**

Open browser DevTools and verify no errors on:
- Production browser page
- Both sandbox routes

**Step 5: Commit verification**

If any fixes were needed during verification:

```bash
git add -A
git commit -m "fix: address issues found during promotion verification"
```

---

## Acceptance Criteria

- [ ] `tailwind.config.ts` includes `./src/features/**/*` in content array
- [ ] Production features directory exists with promoted components
- [ ] Enhanced Explorer moved to `src/features/` and sandbox imports from it
- [ ] My List Sidebar moved to `src/features/` and sandbox imports from it
- [ ] **No duplicate code** between sandbox and production (sandbox wraps production)
- [ ] Build passes without errors
- [ ] Production browser page renders correctly
- [ ] Sandbox routes still work (importing from features)
- [ ] Experiments registry updated

---

## Verification Checklist for Phase 5

- [ ] `npm run build` succeeds
- [ ] `/browser` renders promoted components
- [ ] `/sandbox/browser/current` still works
- [ ] `/sandbox/browser/my-list-sidebar` still works
- [ ] No console errors on any route
- [ ] Experiments registry reflects promoted status

---

## 🛑 CHECKPOINT [Phase 5]: Production Promotion Complete

> **STOP:** Verify promoted components work in production before considering migration complete.

**Verification:**
- [ ] Production browser page uses promoted components
- [ ] Components function the same as sandbox versions
- [ ] Build passes
- [ ] No console errors

**Migration Complete:** After Phase 5, the design ideas have been successfully ported from Vite prototypes to Next.js production components.

---

## Rollback

If promoted components cause issues in production:

1. Revert browser page changes:
   ```bash
   git checkout HEAD -- loomis-course-app/src/app/\(app\)/browser/
   ```

2. Keep promoted feature code in place (for debugging):
   ```bash
   # Don't delete loomis-course-app/src/features/browser/
   # This allows investigation without data loss
   ```

3. Sandbox versions remain available for comparison:
   - `/sandbox/browser/current`
   - `/sandbox/browser/my-list-sidebar`

4. Investigate and fix issues in sandbox before re-promoting.
