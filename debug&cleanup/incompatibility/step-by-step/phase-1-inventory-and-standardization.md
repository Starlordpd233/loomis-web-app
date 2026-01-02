# Phase 1: Inventory and Standardization of Design Ideas

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

> [!NOTE]
> **Code Snippets Disclaimer:** Snippets illustrate intent; implement production-quality changes as needed.

**Goal:** Turn exported design prototypes into a clean intake queue for sandbox porting by inventorying each design idea, identifying what needs localization, and documenting a porting strategy.

**Architecture:** Analyze each design idea in `design_ideas/browser/` to understand framework, assets, and dependencies. Document what needs to change for Next.js sandbox integration. Create asset standardization tooling if local assets need copying.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS v4

---

## Prerequisites

- Phase 0 complete (baselines + tests in place)
- Working directory: **Repo Root**
- Dev server can be started and is reachable at `http://localhost:3001` (needed for Task 4 stub verification):
  ```bash
  cd loomis-course-app && npm run dev
  ```
- Design ideas to inventory:
  - `design_ideas/browser/current`
  - `design_ideas/browser/my_list_sidebar`
  - `design_ideas/sandbox/sandbox-landing-page`

---

## Critical warnings for design ideas

> [!WARNING]
> The design ideas use patterns that are **NOT production-safe**:
>
> 1. **Tailwind CDN** (`<script src="https://cdn.tailwindcss.com">`) — Do NOT copy into Next.js
> 2. **External fonts** (e.g., Google Fonts for Inter) — Use app's Proxima Nova instead
> 3. **Importmaps** — Not supported in Next.js; convert to npm dependencies
> 4. **Client-side secrets** (e.g., `GEMINI_API_KEY`) — Do NOT commit real secrets

When porting to sandbox, these patterns must be replaced with production-safe alternatives.

---

## Task 1: Inventory design_ideas/browser/current

**Goal:** Document the `current` design idea's structure, dependencies, and porting complexity.

**Files:**
- Read: `design_ideas/browser/current/index.html`
- Read: `design_ideas/browser/current/App.tsx` (or main component)
- Check: `design_ideas/browser/current/package.json` (if exists)
- Create: `debug&cleanup/incompatibility/inventory-current.md`

**Step 1: Check if it's a Vite app or static HTML**

```bash
ls -la design_ideas/browser/current/
```

Look for: `package.json`, `vite.config.*`, or just `index.html` with inline scripts.

**Step 2: Examine index.html for external dependencies**

```bash
grep -n "cdn\|googleapis\|unpkg\|jsdelivr\|script src" design_ideas/browser/current/index.html
```

Document what external resources are used (Tailwind CDN, fonts, importmaps).

**Step 3: Check for styled-components usage**

```bash
grep -rn "styled\." design_ideas/browser/current/ --include="*.tsx" --include="*.jsx" | head -20
```

If styled-components are used, they must be rewritten to Tailwind utilities or CSS Modules.

**Step 4: Check for API keys or secrets**

```bash
grep -rn "API_KEY\|SECRET\|GEMINI" design_ideas/browser/current/ --include="*.tsx" --include="*.jsx" --include="*.ts" --include="*.js"
```

If found, ensure sandbox uses environment variables or mock data.

**Step 5: Identify local assets**

```bash
find design_ideas/browser/current/ -name "*.png" -o -name "*.jpg" -o -name "*.svg" -o -name "*.ico"
```

These may need to be copied to `loomis-course-app/public/`.

**Step 6: Create inventory document**

```bash
cat > "debug&cleanup/incompatibility/inventory-current.md" << 'EOF'
# Design Idea Inventory: browser/current

## Overview
- **Location:** `design_ideas/browser/current/`
- **Type:** [Vite app | Static HTML with importmaps]
- **Main component:** [e.g., App.tsx, 842 lines]

## External Dependencies (must be replaced)
- [ ] Tailwind CDN — Replace with app's Tailwind v4 build
- [ ] Inter font (Google Fonts) — Use app's Proxima Nova
- [ ] [Other CDN libraries if any]

## NPM Dependencies (may need installing)
- `lucide-react` — Already in app
- `styled-components` — Rewrite to Tailwind/CSS Modules
- `@google/genai` — [requires network approval to install; or mock for sandbox]
- `react-hook-form` — [check if already in app]
- [Other dependencies...]

## Local Assets
- [List any images/icons that need copying]

## API/Secret Dependencies
- [ ] `GEMINI_API_KEY` — Must use env var or mock data

## Porting Complexity: [Easy | Medium | Hard]
- Reason: [e.g., "Requires styled-components rewrite + API mocking"]

## Porting Strategy
1. Create sandbox route at `/sandbox/browser/current`
2. Rewrite styled-components to Tailwind utilities
3. Replace CDN scripts with app's Tailwind build
4. Use Proxima Nova (already global) instead of Inter
5. Mock Gemini API or gate behind env var
EOF
```

**Step 7: Commit inventory**

```bash
git add "debug&cleanup/incompatibility/inventory-current.md"
git commit -m "docs: inventory design_ideas/browser/current"
```

---

## Task 2: Inventory design_ideas/browser/my_list_sidebar

**Goal:** Document the `my_list_sidebar` design idea.

**Files:**
- Read: `design_ideas/browser/my_list_sidebar/index.html`
- Read: `design_ideas/browser/my_list_sidebar/` main component
- Create: `debug&cleanup/incompatibility/inventory-my-list-sidebar.md`

**Step 1: Check structure**

```bash
ls -la design_ideas/browser/my_list_sidebar/
```

**Step 2: Examine external dependencies**

```bash
grep -n "cdn\|googleapis\|unpkg\|script src" design_ideas/browser/my_list_sidebar/index.html
```

**Step 3: Check for styled-components**

```bash
grep -rn "styled\." design_ideas/browser/my_list_sidebar/ --include="*.tsx" --include="*.jsx" | head -10
```

**Step 4: Identify local assets**

```bash
find design_ideas/browser/my_list_sidebar/ -name "*.png" -o -name "*.jpg" -o -name "*.svg"
```

**Step 5: Create inventory document**

```bash
cat > "debug&cleanup/incompatibility/inventory-my-list-sidebar.md" << 'EOF'
# Design Idea Inventory: browser/my_list_sidebar

## Overview
- **Location:** `design_ideas/browser/my_list_sidebar/`
- **Type:** [Vite app | Static HTML with importmaps]
- **Main component:** [e.g., App.tsx]

## External Dependencies (must be replaced)
- [ ] Tailwind CDN — Replace with app's Tailwind v4 build
- [ ] [Fonts if any] — Use app's Proxima Nova

## NPM Dependencies
- `lucide-react` — Already in app
- [Other dependencies...]

## Local Assets
- [List any images/icons]

## API/Secret Dependencies
- [None | List any]

## Porting Complexity: [Easy | Medium | Hard]
- Reason: [e.g., "Simple Tailwind-only, minimal dependencies"]

## Porting Strategy
1. Create sandbox route at `/sandbox/browser/my-list-sidebar`
2. Replace CDN Tailwind with app's Tailwind build
3. Convert icons to lucide-react
4. Use Proxima Nova instead of external font
EOF
```

**Step 6: Commit inventory**

```bash
git add "debug&cleanup/incompatibility/inventory-my-list-sidebar.md"
git commit -m "docs: inventory design_ideas/browser/my_list_sidebar"
```

---

## Task 3: Use asset standardization script (if needed)

**Goal:** If design ideas have local assets (images, icons) that need to be copied to Next.js public folder, use the existing standardization script.

**Files:**
- Check: `scripts/copy-design-assets.mjs`

**Step 1: Check if script exists**

```bash
ls -la scripts/copy-design-assets.mjs
```

The script already exists and supports these CLI options:
- `--design <name>` — Only process specific design idea (e.g., `current`, `my_list_sidebar`)
- `--dry-run` — Preview without copying
- `--clean` — Remove existing assets first
- `--verbose, -v` — Show detailed output

**Step 2: Preview assets (dry run)**

```bash
node scripts/copy-design-assets.mjs --dry-run --verbose
```

**Step 3: Run script to copy assets**

```bash
node scripts/copy-design-assets.mjs
```

**Step 4: Verify assets copied**

```bash
ls -la loomis-course-app/public/design-ideas/
```

**Step 5: Commit assets (if any copied)**

```bash
git add loomis-course-app/public/design-ideas/
git commit -m "feat: copy design idea assets to public directory"
```

---

## Task 4: Create sandbox entry points (stubs)

**Goal:** Create placeholder sandbox routes so the porting process has a target location.

**Files:**
- Create: `loomis-course-app/src/app/sandbox/browser/current/page.tsx`
- Create: `loomis-course-app/src/app/sandbox/browser/my-list-sidebar/page.tsx`

**Step 1: Create directory structure**

```bash
mkdir -p loomis-course-app/src/app/sandbox/browser/current
mkdir -p loomis-course-app/src/app/sandbox/browser/my-list-sidebar
```

**Step 2: Create stub for current**

```typescript
// loomis-course-app/src/app/sandbox/browser/current/page.tsx
'use client';

export default function CurrentSandboxPage() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Enhanced Explorer (Sandbox Stub)</h1>
      <div className="p-4 border border-gray-300 rounded-lg">
        <p className="text-gray-600">Placeholder for design_ideas/browser/current</p>
        <p className="text-sm text-gray-500 mt-2">
          Porting status: Not started. See inventory-current.md for strategy.
        </p>
      </div>
    </div>
  );
}
```

**Step 3: Create stub for my-list-sidebar**

```typescript
// loomis-course-app/src/app/sandbox/browser/my-list-sidebar/page.tsx
'use client';

export default function MyListSidebarSandboxPage() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">My List Sidebar (Sandbox Stub)</h1>
      <div className="p-4 border border-gray-300 rounded-lg">
        <p className="text-gray-600">Placeholder for design_ideas/browser/my_list_sidebar</p>
        <p className="text-sm text-gray-500 mt-2">
          Porting status: Not started. See inventory-my-list-sidebar.md for strategy.
        </p>
      </div>
    </div>
  );
}
```

**Step 4: Verify routes work**

```bash
cd loomis-course-app
npm run dev
# Visit http://localhost:3001/sandbox/browser/current
# Visit http://localhost:3001/sandbox/browser/my-list-sidebar
```

**Step 5: Commit stubs**

```bash
git add loomis-course-app/src/app/sandbox/browser/
git commit -m "feat: create sandbox entry stubs for design ideas"
```

---

## Task 5: Update experiments registry

**Goal:** Register the new sandbox experiments in the registry.

> [!IMPORTANT]
> **This task is required** since the registry exists at `loomis-course-app/src/app/sandbox/experiments.ts`.

**Files:**
- Modify: `loomis-course-app/src/app/sandbox/experiments.ts`

**Step 1: Check registry structure**

```bash
head -50 loomis-course-app/src/app/sandbox/experiments.ts
```

**Step 2: Add entries for new experiments**

Add entries for:
- `Enhanced Explorer` at `/sandbox/browser/current` (already exists, verify)
- `My List Sidebar` at `/sandbox/browser/my-list-sidebar`
- `Sandbox Landing Page` at `/sandbox/landing` (if porting this prototype)

**Step 3: Verify build passes**

```bash
cd loomis-course-app && npm run build
```

**Step 4: Commit registry update**

```bash
git add loomis-course-app/src/app/sandbox/experiments.ts
git commit -m "feat: register design idea experiments in sandbox"
```

---

## Verification Checklist for Phase 1

- [ ] Inventory document exists for `browser/current`
- [ ] Inventory document exists for `browser/my_list_sidebar`
- [ ] Each inventory lists: external dependencies, npm dependencies, local assets, porting complexity
- [ ] Asset script exists (if local assets need copying)
- [ ] Sandbox stub routes render at `/sandbox/browser/current` and `/sandbox/browser/my-list-sidebar`
- [ ] `npm run build` passes in `loomis-course-app`

---

## 🛑 CHECKPOINT [Phase 1]: Inventory Complete

> **STOP:** Verify all design ideas have inventory documents before proceeding.

**Verification:**
- [ ] `debug&cleanup/incompatibility/inventory-current.md` exists with porting strategy
- [ ] `debug&cleanup/incompatibility/inventory-my-list-sidebar.md` exists with porting strategy
- [ ] Sandbox stubs render correctly
- [ ] Build passes

**Next Phase:** Phase 2 — Tailwind Global and Stable

---

## Rollback

If anything breaks during Phase 1:

1. Remove sandbox stubs:
   ```bash
   rm -rf loomis-course-app/src/app/sandbox/browser/current
   rm -rf loomis-course-app/src/app/sandbox/browser/my-list-sidebar
   ```

2. Inventory documents are safe to delete (they're just documentation).

Phase 1 is primarily additive, so rollback is low-risk.
