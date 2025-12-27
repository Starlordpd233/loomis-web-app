# Sandbox Workflow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete the sandbox workflow system by adding archive support, a CLI sync tool, and documentation.

**Architecture:** The sandbox system uses a centralized experiment registry (`experiments.ts`) with helper functions for filtering by status. Archive support adds a new route and updates navigation. The CLI sync tool bridges `design_ideas/` vault to sandbox routes.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Node.js ESM (for CLI)

---

## Current State Summary

**Completed:**
- `experiments.ts` - Type definitions and `CATEGORIES` array with helper functions
- `page.tsx` - Index page using `getActiveCategories` filter
- `layout.tsx` - Shared layout with dev toolbar
- `browser/idea1/page.tsx` - Sample experiment

**Remaining:**
- Archive route (`/sandbox/archive`)
- Archive link in index header
- Archive link in layout toolbar
- CLI sync script (`scripts/sandbox-sync.mjs`)
- Documentation (`design_ideas/README.md`)

---

## Task 1: Create Archive Page

**Files:**
- Create: `loomis-course-app/src/app/sandbox/archive/page.tsx`

**Step 1.1: Create the archive directory**

```bash
mkdir -p loomis-course-app/src/app/sandbox/archive
```

**Step 1.2: Write the archive page component**

Create `loomis-course-app/src/app/sandbox/archive/page.tsx`:

```tsx
'use client';

import Link from 'next/link';
import {
  CATEGORIES,
  getArchivedExperiments,
  ExperimentMeta
} from '../experiments';

/**
 * Sandbox Archive
 *
 * Shows all archived experiments for reference.
 * Archived experiments are kept but hidden from the main index.
 */

export default function SandboxArchive() {
  const archivedExperiments = getArchivedExperiments(CATEGORIES);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <span className="text-3xl">📦</span>
                Archived Experiments
              </h1>
              <p className="text-slate-400 mt-1">
                {archivedExperiments.length} archived experiment{archivedExperiments.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Link
              href="/sandbox"
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
            >
              ← Back to Index
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {archivedExperiments.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🗃️</div>
            <h2 className="text-xl font-semibold mb-2">No archived experiments</h2>
            <p className="text-slate-400">
              Experiments marked as archived will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {archivedExperiments.map((exp: ExperimentMeta) => (
              <Link
                key={exp.path}
                href={exp.path}
                className="group block p-5 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:bg-slate-700/50 hover:border-slate-600 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold group-hover:text-blue-400 transition-colors">
                    {exp.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    Archived
                  </span>
                </div>

                <p className="text-sm text-slate-400 mb-4">
                  {exp.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {exp.frameworks.map((fw) => (
                    <span
                      key={fw}
                      className="px-2 py-0.5 bg-slate-700/50 rounded text-xs text-slate-300"
                    >
                      {fw}
                    </span>
                  ))}
                </div>

                <div className="mt-4 text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  View archived experiment →
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Info Box */}
        <section className="mt-16 p-6 bg-slate-800/30 border border-slate-700/50 rounded-xl">
          <h2 className="text-lg font-semibold mb-4">💡 About Archived Experiments</h2>
          <ul className="space-y-2 text-slate-300 text-sm">
            <li className="flex gap-3">
              <span className="text-slate-500">•</span>
              <span>Archived experiments are kept for reference but hidden from the main index</span>
            </li>
            <li className="flex gap-3">
              <span className="text-slate-500">•</span>
              <span>To archive an experiment, set <code className="bg-slate-700 px-2 py-0.5 rounded">status: &apos;archived&apos;</code> in experiments.ts</span>
            </li>
            <li className="flex gap-3">
              <span className="text-slate-500">•</span>
              <span>To revive an experiment, change status back to <code className="bg-slate-700 px-2 py-0.5 rounded">&apos;wip&apos;</code></span>
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
```

**Step 1.3: Verify the archive page renders**

```bash
cd loomis-course-app && npm run dev
```

Open `http://localhost:3001/sandbox/archive` in browser.
Expected: Page renders with "No archived experiments" empty state.

**Step 1.4: Commit**

```bash
git add loomis-course-app/src/app/sandbox/archive/
git commit -m "sandbox: add archive page for archived experiments"
```

---

## Task 2: Add Archive Link to Index Header

**Files:**
- Modify: `loomis-course-app/src/app/sandbox/page.tsx:51-58`

**Step 2.1: Update the index page header**

In `loomis-course-app/src/app/sandbox/page.tsx`, modify the header section to add the archive count and link.

Find this block (~line 32-35):
```tsx
  const activeCount = countByStatus(CATEGORIES, 'wip') + countByStatus(CATEGORIES, 'ready');
  const totalCategories = activeCategories.length;
```

Add after it:
```tsx
  const archivedCount = countByStatus(CATEGORIES, 'archived');
```

Find the header buttons area (~line 51-58):
```tsx
            <Link
              href="/"
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
            >
              ← Back to Main App
            </Link>
```

Replace with:
```tsx
            <div className="flex items-center gap-3">
              {archivedCount > 0 && (
                <Link
                  href="/sandbox/archive"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm font-medium transition-colors text-slate-300"
                >
                  Archive ({archivedCount})
                </Link>
              )}
              <Link
                href="/"
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
              >
                ← Back to Main App
              </Link>
            </div>
```

**Step 2.2: Verify the archive link appears conditionally**

Test 1: With no archived experiments, link should NOT appear.

Test 2: Temporarily add an archived experiment to `experiments.ts`:
```typescript
{
  name: 'Test Archived',
  description: 'Test archived experiment',
  path: '/sandbox/browser/test-archived',
  status: 'archived',
  frameworks: ['Test'],
},
```

Refresh `http://localhost:3001/sandbox` - "Archive (1)" link should appear.

**Step 2.3: Remove test data and commit**

Remove the test archived experiment from `experiments.ts`.

```bash
git add loomis-course-app/src/app/sandbox/page.tsx
git commit -m "sandbox: add archive link to index header"
```

---

## Task 3: Update Layout Toolbar

**Files:**
- Modify: `loomis-course-app/src/app/sandbox/layout.tsx:28-34`

**Step 3.1: Add Archive link to toolbar**

In `loomis-course-app/src/app/sandbox/layout.tsx`, find the toolbar section (~line 28-34):

```tsx
      <div className="sandbox-toolbar">
        <span>🧪 Sandbox</span>
        <span>|</span>
        <Link href="/sandbox">Index</Link>
        <span>|</span>
        <Link href="/">Main App</Link>
      </div>
```

Replace with:
```tsx
      <div className="sandbox-toolbar">
        <span>🧪 Sandbox</span>
        <span>|</span>
        <Link href="/sandbox">Index</Link>
        <span>|</span>
        <Link href="/sandbox/archive">Archive</Link>
        <span>|</span>
        <Link href="/">Main App</Link>
      </div>
```

**Step 3.2: Verify toolbar navigation**

Navigate to:
1. `http://localhost:3001/sandbox` - Toolbar shows: Index | Archive | Main App
2. Click "Archive" - Goes to `/sandbox/archive`
3. Click "Index" - Goes back to `/sandbox`
4. Click "Main App" - Goes to `/`

**Step 3.3: Commit**

```bash
git add loomis-course-app/src/app/sandbox/layout.tsx
git commit -m "sandbox: add Archive link to layout toolbar"
```

---

## Task 4: Create CLI Sync Script

**Files:**
- Create: `loomis-course-app/scripts/sandbox-sync.mjs`
- Modify: `loomis-course-app/package.json`

**Step 4.1: Create scripts directory**

```bash
mkdir -p loomis-course-app/scripts
```

**Step 4.2: Write the CLI sync script**

Create `loomis-course-app/scripts/sandbox-sync.mjs`:

```javascript
#!/usr/bin/env node

/**
 * Sandbox Sync CLI
 *
 * Interactive tool to register design_ideas/ items into the sandbox.
 * Handles: TSX snippets, static HTML, images, and standalone apps.
 *
 * Usage: npm run sandbox:sync
 */

import fs from 'fs/promises';
import path from 'path';
import { createInterface } from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

const DESIGN_IDEAS_PATH = path.resolve(process.cwd(), '../design_ideas');
const SANDBOX_PATH = path.resolve(process.cwd(), 'src/app/sandbox');
const EXPERIMENTS_PATH = path.join(SANDBOX_PATH, 'experiments.ts');
const MANIFEST_PATH = path.resolve(process.cwd(), '.sandbox-sync-manifest.json');

const SOURCE_TYPES = {
  tsx: { extensions: ['.tsx', '.jsx'], label: 'TSX/JSX Component' },
  html: { marker: 'index.html', label: 'Static HTML' },
  image: { extensions: ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'], label: 'Image Asset' },
  standalone: { marker: 'package.json', label: 'Standalone App' },
};

/**
 * Detect the source type of a file or directory
 */
async function detectSourceType(itemPath, stat) {
  const name = path.basename(itemPath);
  const ext = path.extname(itemPath).toLowerCase();

  if (stat.isFile()) {
    // Check for TSX/JSX
    if (SOURCE_TYPES.tsx.extensions.includes(ext)) {
      return 'tsx';
    }
    // Check for images
    if (SOURCE_TYPES.image.extensions.includes(ext)) {
      return 'image';
    }
  }

  if (stat.isDirectory()) {
    // Check for static HTML
    try {
      await fs.access(path.join(itemPath, 'index.html'));
      return 'html';
    } catch {}

    // Check for standalone app
    try {
      await fs.access(path.join(itemPath, 'package.json'));
      return 'standalone';
    } catch {}
  }

  return null;
}

/**
 * Scan design_ideas/ for syncable items
 */
async function scanDesignIdeas() {
  const items = [];

  async function scanDir(dir, category = '') {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const stat = await fs.stat(fullPath);

        // Skip hidden files and node_modules
        if (entry.name.startsWith('.') || entry.name === 'node_modules') {
          continue;
        }

        const sourceType = await detectSourceType(fullPath, stat);

        if (sourceType) {
          items.push({
            name: entry.name,
            path: fullPath,
            relativePath: path.relative(DESIGN_IDEAS_PATH, fullPath),
            category: category || path.basename(path.dirname(fullPath)),
            sourceType,
            sourceTypeLabel: SOURCE_TYPES[sourceType]?.label || sourceType,
          });
        } else if (stat.isDirectory()) {
          // Recurse into category directories
          await scanDir(fullPath, entry.name);
        }
      }
    } catch (err) {
      console.error(`Error scanning ${dir}:`, err.message);
    }
  }

  await scanDir(DESIGN_IDEAS_PATH);
  return items;
}

/**
 * Load or create manifest
 */
async function loadManifest() {
  try {
    const content = await fs.readFile(MANIFEST_PATH, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {
      version: 1,
      lastSync: null,
      entries: [],
    };
  }
}

/**
 * Save manifest
 */
async function saveManifest(manifest) {
  manifest.lastSync = new Date().toISOString();
  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

/**
 * Generate a URL-safe slug from a name
 */
function slugify(name) {
  return name
    .toLowerCase()
    .replace(/\.[^.]+$/, '') // Remove extension
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Generate wrapper code based on source type
 */
function generateWrapper(item) {
  const slug = slugify(item.name);

  switch (item.sourceType) {
    case 'tsx':
      return {
        type: 'tsx',
        code: `'use client';

/**
 * ${item.name}
 * Source: design_ideas/${item.relativePath}
 *
 * TODO: Copy the component code from the source file and adapt as needed.
 */

export default function ${toPascalCase(slug)}() {
  return (
    <div className="min-h-screen bg-slate-900 p-8 text-white">
      <h1 className="text-2xl font-bold mb-4">${item.name}</h1>
      <p className="text-slate-400">
        Implement this experiment from: design_ideas/${item.relativePath}
      </p>
    </div>
  );
}
`,
      };

    case 'html':
      return {
        type: 'iframe',
        code: `/**
 * ${item.name} - Static HTML Viewer
 * Source: design_ideas/${item.relativePath}
 */

export default function ${toPascalCase(slug)}Viewer() {
  return (
    <div className="min-h-screen">
      <div className="p-4 bg-slate-800 text-white text-sm">
        <h1 className="font-bold">${item.name} - Static Prototype</h1>
        <p className="text-slate-400">Viewing static HTML from design_ideas/</p>
      </div>
      <iframe
        src="/sandbox-static/${slug}/index.html"
        className="w-full h-[calc(100vh-80px)] border-0"
        title="${item.name} Prototype"
      />
    </div>
  );
}
`,
      };

    case 'image':
      return {
        type: 'viewer',
        code: `/**
 * ${item.name} - Image Reference
 * Source: design_ideas/${item.relativePath}
 */

export default function ${toPascalCase(slug)}Viewer() {
  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <h1 className="text-2xl font-bold text-white mb-4">${item.name}</h1>
      <div className="bg-white p-4 rounded-lg">
        <img
          src="/sandbox-assets/${item.category}/${item.name}"
          alt="${item.name}"
          className="max-w-full"
        />
      </div>
    </div>
  );
}
`,
      };

    case 'standalone':
      return {
        type: 'reference',
        code: `/**
 * ${item.name} - Standalone App Reference
 * Source: design_ideas/${item.relativePath}
 */

export default function ${toPascalCase(slug)}Reference() {
  return (
    <div className="min-h-screen bg-slate-900 p-8 text-white">
      <h1 className="text-2xl font-bold mb-2">${item.name}</h1>
      <p className="text-slate-400 mb-6">
        Standalone app from design_ideas/${item.relativePath}
      </p>

      <div className="bg-slate-800 p-4 rounded-lg mb-6">
        <h2 className="font-bold mb-2">How to Run</h2>
        <pre className="bg-slate-900 p-3 rounded text-sm text-green-400">
{\`cd design_ideas/${item.relativePath}
npm install
npm run dev\`}
        </pre>
      </div>

      <div className="bg-slate-800 p-4 rounded-lg">
        <h2 className="font-bold mb-2">What to Extract</h2>
        <ul className="list-disc list-inside space-y-1 text-slate-300">
          <li>TODO: List key patterns to extract</li>
        </ul>
      </div>
    </div>
  );
}
`,
      };

    default:
      return null;
  }
}

function toPascalCase(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

/**
 * Main CLI
 */
async function main() {
  const rl = createInterface({ input, output });

  console.log('\n🧪 Sandbox Sync CLI\n');
  console.log('Scanning design_ideas/ for syncable items...\n');

  // Check if design_ideas exists
  try {
    await fs.access(DESIGN_IDEAS_PATH);
  } catch {
    console.log('❌ design_ideas/ directory not found at:', DESIGN_IDEAS_PATH);
    console.log('   Create it first and add some design experiments.\n');
    rl.close();
    return;
  }

  const items = await scanDesignIdeas();

  if (items.length === 0) {
    console.log('No syncable items found in design_ideas/\n');
    console.log('Supported types:');
    console.log('  • .tsx/.jsx files (TSX components)');
    console.log('  • Folders with index.html (static HTML)');
    console.log('  • Image files (.png, .jpg, .webp, etc.)');
    console.log('  • Folders with package.json (standalone apps)\n');
    rl.close();
    return;
  }

  console.log(`Found ${items.length} item(s):\n`);

  items.forEach((item, i) => {
    console.log(`  ${i + 1}. [${item.sourceTypeLabel}] ${item.relativePath}`);
  });

  console.log('\nEnter numbers to sync (comma-separated), or "all", or "q" to quit:');

  const answer = await rl.question('> ');

  if (answer.toLowerCase() === 'q') {
    console.log('\nCancelled.\n');
    rl.close();
    return;
  }

  let selectedIndices;
  if (answer.toLowerCase() === 'all') {
    selectedIndices = items.map((_, i) => i);
  } else {
    selectedIndices = answer
      .split(',')
      .map(s => parseInt(s.trim()) - 1)
      .filter(i => i >= 0 && i < items.length);
  }

  if (selectedIndices.length === 0) {
    console.log('\nNo valid selections.\n');
    rl.close();
    return;
  }

  const manifest = await loadManifest();

  console.log(`\nProcessing ${selectedIndices.length} item(s)...\n`);

  for (const idx of selectedIndices) {
    const item = items[idx];
    const slug = slugify(item.name);
    const routePath = `/sandbox/${item.category}/${slug}`;
    const pagePath = path.join(SANDBOX_PATH, item.category, slug, 'page.tsx');

    console.log(`📦 ${item.relativePath}`);
    console.log(`   Route: ${routePath}`);

    // Check if already exists
    try {
      await fs.access(pagePath);
      const overwrite = await rl.question(`   ⚠️  Already exists. Overwrite? (y/N) `);
      if (overwrite.toLowerCase() !== 'y') {
        console.log('   Skipped.\n');
        continue;
      }
    } catch {}

    const wrapper = generateWrapper(item);
    if (!wrapper) {
      console.log('   ❌ Unknown source type, skipped.\n');
      continue;
    }

    // Create directory and write file
    await fs.mkdir(path.dirname(pagePath), { recursive: true });
    await fs.writeFile(pagePath, wrapper.code);

    // Update manifest
    const existingIdx = manifest.entries.findIndex(e => e.id === `${item.category}-${slug}`);
    const entry = {
      id: `${item.category}-${slug}`,
      sourceType: item.sourceType,
      sourcePath: item.relativePath,
      sandboxRoute: routePath,
      generatedFiles: [path.relative(process.cwd(), pagePath)],
      syncedAt: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      manifest.entries[existingIdx] = entry;
    } else {
      manifest.entries.push(entry);
    }

    console.log('   ✅ Created wrapper page.\n');
  }

  await saveManifest(manifest);
  console.log(`📝 Updated manifest: .sandbox-sync-manifest.json`);

  console.log('\n💡 Next steps:');
  console.log('   1. Edit the generated page.tsx files to add your component code');
  console.log('   2. Add entries to experiments.ts to show in the index');
  console.log('   3. Run: npm run dev\n');

  rl.close();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
```

**Step 4.3: Make the script executable**

```bash
chmod +x loomis-course-app/scripts/sandbox-sync.mjs
```

**Step 4.4: Add npm script to package.json**

In `loomis-course-app/package.json`, add to "scripts":

```json
"sandbox:sync": "node scripts/sandbox-sync.mjs"
```

The scripts section should now be:
```json
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "sandbox:sync": "node scripts/sandbox-sync.mjs"
  },
```

**Step 4.5: Test the CLI**

```bash
cd loomis-course-app && npm run sandbox:sync
```

Expected: CLI runs, scans design_ideas/, and shows interactive menu.

**Step 4.6: Commit**

```bash
git add loomis-course-app/scripts/ loomis-course-app/package.json
git commit -m "sandbox: implement CLI sync tool for design_ideas"
```

---

## Task 5: Create Documentation

**Files:**
- Create: `design_ideas/README.md`

**Step 5.1: Write the README**

Create `design_ideas/README.md`:

```markdown
# Design Ideas Vault

This folder is the **raw input vault** for design experiments. Ideas collected here are
tested safely inside the Next.js app's `/sandbox` routes before being promoted to production.

## Quick Start

1. Drop your design file/folder here
2. Run `cd loomis-course-app && npm run sandbox:sync` to generate a sandbox wrapper
3. Edit the generated page to import/adapt your component
4. Add an entry to `experiments.ts` to show it in the sandbox index
5. View at `http://localhost:3001/sandbox/[category]/[slug]`

## Folder Structure

```
design_ideas/
├── README.md              # This file
├── browser/               # Course browser ideas
│   ├── idea1.tsx         # TSX snippet
│   ├── coze/             # Standalone Vite app
│   │   └── package.json
│   └── filter-panel/     # Static HTML prototype
│       └── index.html
├── planner/               # Planner grid ideas
├── marketing/             # Landing page ideas
└── components/            # Reusable component ideas
```

## Supported Source Types

| Type | Detection | Sandbox Handling |
|------|-----------|------------------|
| **TSX Snippet** | `.tsx` or `.jsx` file | Generates wrapper page, you copy component code |
| **Static HTML** | Folder with `index.html` | Copies to `public/sandbox-static/`, embeds via iframe |
| **Image** | `.png`, `.jpg`, `.webp`, etc. | Copies to `public/sandbox-assets/`, creates viewer page |
| **Standalone App** | Folder with `package.json` | Creates reference page with run instructions |

## Naming Conventions

- Use lowercase with hyphens: `department-cards-v2.tsx`
- Category folders match sandbox route: `browser/` → `/sandbox/browser/`
- Descriptive names over numbered: `filter-panel/` not `idea1/`

## Experiment Lifecycle

```
┌─────────┐     ┌─────┐     ┌───────┐     ┌──────────┐
│  vault  │ ──► │ wip │ ──► │ ready │ ──► │ promoted │
└─────────┘     └─────┘     └───────┘     └──────────┘
    │               │           │
    │               ▼           ▼
    │          ┌──────────┐
    └────────► │ archived │
               └──────────┘
```

| Status | Meaning | Location |
|--------|---------|----------|
| (vault) | Raw idea, not yet in sandbox | `design_ideas/` |
| `wip` | Work in progress, actively iterating | Sandbox Index |
| `ready` | Passes quality checks, ready for review | Sandbox Index |
| `archived` | Not pursuing, kept for reference | Sandbox Archive |

## Manual Registration

If you prefer not to use the CLI, manually:

1. Create the route folder:
   ```
   loomis-course-app/src/app/sandbox/[category]/[slug]/page.tsx
   ```

2. Add `'use client'` if using React hooks

3. Add entry to `experiments.ts`:
   ```typescript
   {
     name: 'My Experiment',
     description: 'What it demonstrates',
     path: '/sandbox/[category]/[slug]',
     status: 'wip',
     frameworks: ['Tailwind CSS'],
   }
   ```

## Related Documentation

- Full workflow plan: `planning/design_ideas_↔_sandbox_workflow_574ce4dc.plan.md`
- Sandbox source: `loomis-course-app/src/app/sandbox/`
- Experiment registry: `loomis-course-app/src/app/sandbox/experiments.ts`
```

**Step 5.2: Verify README renders**

```bash
cat design_ideas/README.md
```

Expected: Markdown content displays correctly.

**Step 5.3: Commit**

```bash
git add design_ideas/README.md
git commit -m "sandbox: add design_ideas README documentation"
```

---

## Task 6: Final Verification

**Step 6.1: Run build to check for type errors**

```bash
cd loomis-course-app && npm run build
```

Expected: Build completes with no errors.

**Step 6.2: Run lint**

```bash
cd loomis-course-app && npm run lint
```

Expected: Lint passes.

**Step 6.3: Manual verification checklist**

- [ ] `/sandbox` shows active experiments only
- [ ] `/sandbox/archive` shows archived experiments only (empty if none)
- [ ] Toolbar navigates: Index ↔ Archive ↔ Main App
- [ ] Archive link in index header shows count when > 0
- [ ] `npm run sandbox:sync` runs and shows interactive menu
- [ ] `design_ideas/README.md` exists and is readable

**Step 6.4: Final commit**

```bash
git add -A
git commit -m "sandbox: complete sandbox-workflow implementation"
git push origin sandbox-workflow
```

---

## Summary of Files Created/Modified

### Created
- `loomis-course-app/src/app/sandbox/archive/page.tsx`
- `loomis-course-app/scripts/sandbox-sync.mjs`
- `design_ideas/README.md`
- `docs/plans/2025-12-27-sandbox-workflow.md` (this file)

### Modified
- `loomis-course-app/src/app/sandbox/page.tsx` (added archive link)
- `loomis-course-app/src/app/sandbox/layout.tsx` (added archive to toolbar)
- `loomis-course-app/package.json` (added sandbox:sync script)

---

## Merge Instructions (After Completion)

```bash
# Ensure all work is committed
git status

# Switch to parent branch
git checkout cleanup/dec-26  # or main

# Merge the sandbox workflow work
git merge sandbox-workflow

# Push the merged branch
git push origin cleanup/dec-26

# Optionally delete the sub-branch
git branch -d sandbox-workflow
git push origin --delete sandbox-workflow
```
