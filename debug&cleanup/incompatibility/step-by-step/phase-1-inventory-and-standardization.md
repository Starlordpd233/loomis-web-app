# Phase 1: Inventory and Standardization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

> [!NOTE]
> **Code Snippets Disclaimer:** The code snippets and examples provided in this plan are **informational and basic**. They are intended to illustrate concepts and provide guidance, but should **not** serve as the final functional code. Implementers should write production-quality code that goes beyond these examples, incorporating proper error handling, edge cases, and best practices appropriate for the codebase.

**Goal:** Create a reliable intake path for design ideas by inventorying each design idea, standardizing external assets and fonts, and normalizing entry points.

**Architecture:** Systematic analysis of existing design_ideas to identify framework, assets, and dependencies. Copy local assets to app public directory, replace external URLs with local paths, and ensure each design idea has a single root React component for sandbox mounting.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, CSS Modules

---

## Task 1: Inventory design_ideas/browser/current

**Files:**
- Read: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/design_ideas/browser/current/package.json`
- Read: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/design_ideas/browser/current/App.tsx`
- Read: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/design_ideas/browser/current/README.md`
- Create: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/debug&cleanup/incompatibility/inventory-current.md`

**Step 1: Examine package.json for dependencies**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc/design_ideas/browser/current
cat package.json | grep -A 20 '"dependencies"'
```

**Step 2: Check for external assets in App.tsx**

```bash
grep -n "http\|https\|.png\|.jpg\|.svg\|.woff\|.ttf\|.otf" /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc/design_ideas/browser/current/App.tsx
```

**Step 3: Check for Vite-specific imports**

```bash
grep -n "import.meta\|vite\|@vite" /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc/design_ideas/browser/current/App.tsx
```

**Step 4: Document findings**

```markdown
# Design Idea: browser/current

## Framework
- React: 18.3.1
- Build tool: Vite
- Styling: Tailwind CSS
- Icons: lucide-react

## Dependencies
- @google/genai: 1.34.0
- react-hook-form: 7.69.0
- @radix-ui/react-* components
- styled-components: 6.1.8

## Assets
- Local: Check components directory
- External: TBD from grep results

## Entry Point
- Single App.tsx component (842 lines)
- Needs component extraction for sandbox mounting
```

**Step 5: Commit inventory**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc
git add debug&cleanup/incompatibility/inventory-current.md
git commit -m "docs: inventory design_ideas/browser/current"
```

---

## Task 2: Inventory design_ideas/browser/my_list_sidebar

**Files:**
- Read: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/design_ideas/browser/my_list_sidebar/package.json`
- Read: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/design_ideas/browser/my_list_sidebar/App.tsx`
- Create: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/debug&cleanup/incompatibility/inventory-my-list-sidebar.md`

**Step 1: Examine package.json**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc/design_ideas/browser/my_list_sidebar
cat package.json
```

**Step 2: Check for styled-components usage**

```bash
grep -n "styled\|StyledComponent" /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc/design_ideas/browser/my_list_sidebar/App.tsx
```

**Step 3: Check asset references**

```bash
find /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc/design_ideas/browser/my_list_sidebar -name "*.png" -o -name "*.jpg" -o -name "*.svg" -o -name "*.woff" -o -name "*.ttf"
```

**Step 4: Document findings**

```markdown
# Design Idea: browser/my_list_sidebar

## Framework
- React: (check package.json)
- Build tool: Vite
- Styling: Tailwind CSS + styled-components?

## Dependencies
- TBD from package.json

## Assets
- Local images/svgs: (from find results)
- External fonts: TBD

## Entry Point
- App.tsx component
- Check line count for extraction needs
```

**Step 5: Commit inventory**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc
git add debug&cleanup/incompatibility/inventory-my-list-sidebar.md
git commit -m "docs: inventory design_ideas/browser/my_list_sidebar"
```

---

## Task 3: Create asset standardization script

**Files:**
- Create: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/scripts/copy-design-assets.mjs`
- Modify: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/public/` (directory creation)

**Step 1: Create script skeleton**

```javascript
#!/usr/bin/env node
// scripts/copy-design-assets.mjs
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function copyDesignAssets() {
  const designIdeasRoot = path.join(__dirname, '..', 'design_ideas');
  const publicRoot = path.join(__dirname, '..', 'loomis-course-app', 'public', 'design-ideas');
  
  console.log('Starting asset standardization...');
  
  // Ensure public directory exists
  await fs.mkdir(publicRoot, { recursive: true });
  
  // TODO: Implement asset discovery and copying
}

copyDesignAssets().catch(console.error);
```

**Step 2: Run script to verify structure**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc
node scripts/copy-design-assets.mjs
```

Expected: Creates `loomis-course-app/public/design-ideas/` directory

**Step 3: Implement asset discovery for current design idea**

Add to script:
```javascript
async function copyAssetsForDesign(designName, sourcePath) {
  const targetPath = path.join(publicRoot, designName);
  await fs.mkdir(targetPath, { recursive: true });
  
  // Copy image assets
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.svg', '.gif', '.webp'];
  for (const ext of imageExtensions) {
    const imageFiles = await findFiles(sourcePath, `*${ext}`);
    for (const imageFile of imageFiles) {
      const relativePath = path.relative(sourcePath, imageFile);
      const targetFile = path.join(targetPath, relativePath);
      await fs.mkdir(path.dirname(targetFile), { recursive: true });
      await fs.copyFile(imageFile, targetFile);
      console.log(`Copied: ${relativePath}`);
    }
  }
  
  // Copy font assets
  const fontExtensions = ['.woff', '.woff2', '.ttf', '.otf', '.eot'];
  for (const ext of fontExtensions) {
    const fontFiles = await findFiles(sourcePath, `*${ext}`);
    for (const fontFile of fontFiles) {
      const relativePath = path.relative(sourcePath, fontFile);
      const targetFile = path.join(targetPath, relativePath);
      await fs.mkdir(path.dirname(targetFile), { recursive: true });
      await fs.copyFile(fontFile, targetFile);
      console.log(`Copied font: ${relativePath}`);
    }
  }
}
```

**Step 4: Test with current design idea**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc
node scripts/copy-design-assets.mjs --design current
```

**Step 5: Commit script**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc
git add scripts/copy-design-assets.mjs
git commit -m "feat: add asset standardization script"
```

---

## Task 4: Normalize entry point for browser/current

**Files:**
- Read: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/design_ideas/browser/current/App.tsx`
- Create: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/app/sandbox/browser/current/page.tsx`
- Create: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/app/sandbox/browser/current/components/`

**Step 1: Extract root component from App.tsx**

```typescript
// Read the App.tsx file and identify the main component
// Current App.tsx is 842 lines - needs extraction
```

**Step 2: Create sandbox page structure**

```bash
mkdir -p /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc/loomis-course-app/src/app/sandbox/browser/current/components
```

**Step 3: Create minimal page.tsx**

```typescript
// /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/app/sandbox/browser/current/page.tsx
'use client';

import EnhancedExplorer from './components/EnhancedExplorer';

export default function CurrentSandboxPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-4">Enhanced Explorer (Sandbox)</h1>
      <EnhancedExplorer />
    </div>
  );
}
```

**Step 4: Create placeholder EnhancedExplorer component**

```typescript
// /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/app/sandbox/browser/current/components/EnhancedExplorer.tsx
export default function EnhancedExplorer() {
  return (
    <div className="p-8 border border-gray-300 rounded-lg">
      <p className="text-gray-600">Enhanced Explorer component placeholder</p>
      <p className="text-sm text-gray-500">Original: design_ideas/browser/current/App.tsx (842 lines)</p>
    </div>
  );
}
```

**Step 5: Test sandbox route**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc/loomis-course-app
npm run dev &
# Visit http://localhost:3001/sandbox/browser/current
```

**Step 6: Commit entry point**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc
git add loomis-course-app/src/app/sandbox/browser/current/
git commit -m "feat: create sandbox entry point for browser/current"
```

---

## Task 5: Update experiments.ts registry

**Files:**
- Modify: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/app/sandbox/experiments.ts:15-30`

**Step 1: Add current experiment metadata**

```typescript
// In CATEGORIES array, browser experiments section
experiments: [
  {
    name: 'Enhanced Explorer',
    description: 'AI-enhanced course catalog explorer with Gemini integration',
    path: '/sandbox/browser/current',
    status: 'wip' as ExperimentStatus,
    frameworks: ['Tailwind CSS', 'styled-components', '@google/genai'],
    createdAt: new Date().toISOString(),
    author: 'Design Ideas Team',
    sourceRef: 'design_ideas/browser/current',
    tags: ['ai', 'catalog', 'explorer'],
  },
],
```

**Step 2: Verify TypeScript compilation**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc/loomis-course-app
npx tsc --noEmit
```

Expected: No type errors

**Step 3: Check sandbox index page**

```bash
# Restart dev server if needed
# Visit http://localhost:3001/sandbox
```

**Step 4: Commit registry update**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc
git add loomis-course-app/src/app/sandbox/experiments.ts
git commit -m "feat: register enhanced explorer in experiments"
```

---

## Verification Checklist for Phase 1

- [ ] `npm run dev` starts without errors
- [ ] `npm run build` completes successfully
- [ ] `/sandbox/browser/current` route renders placeholder
- [ ] `/sandbox` index shows Enhanced Explorer entry
- [ ] Asset script creates `public/design-ideas/current/` directory
- [ ] Inventory documents created for both design ideas
- [ ] No new runtime dependencies added to package.json