# Phase 5: Production Promotion

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

> [!NOTE]
> **Code Snippets Disclaimer:** Snippets illustrate intent; implement production-quality changes as needed.

**Goal:** Promote validated sandbox experiments to production routes.

**Architecture:** **Wiring Only.** Since components are already in `src/features/`, this phase simply wires them into the production browser page and updates the registry.


**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS v4

---

## Prerequisites

- Phase 4 complete (visual parity validated)
- Working directory: `loomis-course-app/` (unless otherwise specified)
- All sandbox routes render correctly:
  - `/sandbox/browser/current`
  - `/sandbox/browser/my-list-sidebar`
- Visual comparison passed for both design ideas
- Build passes: `npm run build`

---

## Task 1: Wire up components in production

**Goal:** Integrate the feature components (already living in `src/features`) into the production browser page.

**Files:**
- Modify: `loomis-course-app/src/app/(app)/browser/page.tsx`
- Modify: `loomis-course-app/.env.local` (create if needed)

**Step 0: Add environment variable for feature toggle**

> [!IMPORTANT]
> Using an environment variable instead of a code constant enables runtime toggling without rebuilds — essential for safe production rollouts.

Create or update `.env.local`:

```bash
# loomis-course-app/.env.local
NEXT_PUBLIC_ENABLE_NEW_BROWSER=true
```

For production deployment, set this variable in your hosting platform (Vercel, etc.) to control the rollout.

**Step 1: Add rollout toggle using environment variable**

```typescript
// loomis-course-app/src/app/(app)/browser/page.tsx
'use client';

import { EnhancedExplorer } from '@/features/browser/enhanced-explorer';
import { MyListSidebar } from '@/features/browser/my-list-sidebar';

// Runtime feature toggle - controlled via NEXT_PUBLIC_ENABLE_NEW_BROWSER env var
// Set to 'true' in .env.local or hosting platform to enable
const USE_NEW_EXPLORER = process.env.NEXT_PUBLIC_ENABLE_NEW_BROWSER === 'true';

export default function BrowserPage() {
  if (USE_NEW_EXPLORER) {
    return (
      <div className="flex min-h-screen">
         <MyListSidebar />
         <main className="flex-1">
           <EnhancedExplorer />
         </main>
      </div>
    );
  }

  // ... keep existing old UI code below as fallback ...
  return (
    <div>
      <h1>Old Browser Page</h1>
      {/* Existing code */}
    </div>
  );
}
```

**Rollout Strategy:**

| Stage | `NEXT_PUBLIC_ENABLE_NEW_BROWSER` | Purpose |
|-------|----------------------------------|---------|
| Local dev | `true` | Test new components |
| Staging | `true` | Validate before prod |
| Production (initial) | `false` | Safe default |
| Production (rollout) | `true` | Flip when validated |
| Production (rollback) | `false` | Instant revert if issues |

**Step 2: Verify production route**

```bash
cd loomis-course-app
npm run dev
# Visit http://localhost:3001/browser
```

**Step 3: Commit integration**

```bash
git add loomis-course-app/src/app/\(app\)/browser/
git commit -m "feat: wire up enhanced explorer and sidebar in production"
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
