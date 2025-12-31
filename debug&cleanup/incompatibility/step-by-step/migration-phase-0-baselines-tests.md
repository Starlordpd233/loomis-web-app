# Migration Phase 0: Baselines + Tests in Legacy App Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

> [!NOTE]
> **Code Snippets Disclaimer:** The code snippets and examples provided in this plan are **informational and basic**. They are intended to illustrate concepts and provide guidance, but should **not** serve as the final functional code. Implementers should write production-quality code that goes beyond these examples, incorporating proper error handling, edge cases, and best practices appropriate for the codebase.

**Goal:** Establish ground truth for behavior and visuals in the legacy Next.js app before migration, including unit tests for shared utilities and baseline screenshots for visual comparison.

**Architecture:** Add Vitest test runner to existing Next.js app, create comprehensive unit tests for course utilities and planner store, capture baseline screenshots at three viewports for all core routes with clean and populated storage states.

**Tech Stack:** Next.js 15, Vitest, React Testing Library, TypeScript, Chrome DevTools for screenshots

---

## Task 1: Inventory what must not change

**Files:**
- Create: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/debug&cleanup/incompatibility/migration-inventory.md`
- Read: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/app/globals.css:1-50`
- Read: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/app/(app)/browser/page.tsx:1-100`
- Read: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/app/(app)/planner/page.tsx:1-100`

**Step 1: Create inventory document structure**

```markdown
# Migration Inventory - What Must Not Change

## Core Routes
| Route | Data Dependencies | Storage Keys Used | Cookie Usage | Non-default CSS Behaviors | Must-Match Screenshots |
|-------|-------------------|-------------------|--------------|--------------------------|------------------------|
| `/` | None | None | None | Custom backgrounds, animations | 1440x900 |
| `/login` | None | None | None | Form styling, transitions | 1440x900 |
| `/onboarding` | `catalogPrefs` localStorage | `catalogPrefs` | `onboardingIntroSeen` | Wizard layout, stepper | 1440x900 |
| `/browser` | `CATALOG_PATHS` JSON files | `plan` | `catalogPrefs` | Top padding, fixed headers | 1440x900 |
| `/planner` | None | `plannerV1`, `plan`, `plannerV2` | None | Grid layout, print styles | 1440x900 |
| `/sandbox` | None | None | None | Toolbar, experiment layout | 1440x900 |

## Global CSS Variables (from globals.css)
- `--background`
- `--foreground`
- `--card`
- `--card-foreground`
- `--popover`
- `--popover-foreground`
- `--primary`
- `--primary-foreground`
- `--secondary`
- `--secondary-foreground`
- `--muted`
- `--muted-foreground`
- `--accent`
- `--accent-foreground`
- `--destructive`
- `--destructive-foreground`
- `--border`
- `--input`
- `--ring`

## Font Setup
- Custom webfont files in `/public/fonts/`
- `@font-face` declarations with weights 400, 500, 600, 700
- Font-family: custom variable

## Storage Migration Path
1. `plannerV1` → `plan` → `plannerV2` (automatic migration in plannerStore)

## Key Interactive Behaviors
1. Browser: search filtering, plan add/remove, query params for picker mode
2. Planner: drag-and-drop/click assignment, print functionality, localStorage persistence
3. Onboarding: cookie-based intro check, immediate redirect if prefs complete
```

**Step 2: Run inventory verification**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc
ls -la "debug&cleanup/incompatibility/migration-inventory.md"
```

Expected: File exists with 50+ lines

**Step 3: Commit inventory**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc
git add "debug&cleanup/incompatibility/migration-inventory.md"
git commit -m "docs: create migration inventory of what must not change"
```

---

## Task 2: Add Vitest test runner to legacy Next.js app

**Files:**
- Modify: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/package.json:1-50`
- Create: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/vitest.config.ts`
- Create: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/tests/lib/courseUtils.test.ts`
- Create: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/tests/lib/plannerStore.test.ts`

**Step 1: Install Vitest and testing dependencies**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc/loomis-course-app
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom
```

**Step 2: Add test script to package.json**

```json
// In /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/package.json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run"
  }
}
```

**Step 3: Create Vitest configuration**

```typescript
// /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.test.ts', '**/*.test.tsx'],
  },
})
```

**Step 4: Create test setup file**

```typescript
// /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/tests/setup.ts
import '@testing-library/jest-dom'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})
```

**Step 5: Verify test runner installation**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc/loomis-course-app
npm run test -- --version
```

Expected: Shows Vitest version (e.g., "vitest/1.0.0")

**Step 6: Commit test setup**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc/loomis-course-app
git add package.json package-lock.json vitest.config.ts tests/
git commit -m "test: add Vitest test runner to legacy app"
```

---

## Task 3: Create unit tests for courseUtils.ts

**Files:**
- Read: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/lib/courseUtils.ts:1-200`
- Create: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/tests/lib/courseUtils.test.ts`

**Step 1: Write failing test for canonicalizeDepartment**

```typescript
// /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/tests/lib/courseUtils.test.ts
import { describe, it, expect } from 'vitest'
import { canonicalizeDepartment } from '../../src/lib/courseUtils'

describe('canonicalizeDepartment', () => {
  it('handles standard department codes', () => {
    expect(canonicalizeDepartment('CS')).toBe('CS')
    expect(canonicalizeDepartment('MATH')).toBe('MATH')
  })

  it('handles lowercase input', () => {
    expect(canonicalizeDepartment('cs')).toBe('CS')
    expect(canonicalizeDepartment('math')).toBe('MATH')
  })

  it('handles mixed case input', () => {
    expect(canonicalizeDepartment('Cs')).toBe('CS')
    expect(canonicalizeDepartment('Math')).toBe('MATH')
  })

  it('handles department with spaces', () => {
    expect(canonicalizeDepartment('COMP SCI')).toBe('CS')
    expect(canonicalizeDepartment('comp sci')).toBe('CS')
  })

  it('returns empty string for empty input', () => {
    expect(canonicalizeDepartment('')).toBe('')
    expect(canonicalizeDepartment('   ')).toBe('')
  })
})
```

**Step 2: Run test to verify it fails**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc/loomis-course-app
npm run test -- tests/lib/courseUtils.test.ts
```

Expected: FAIL with "function not defined" or import error

**Step 3: Check if function exists in source**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc/loomis-course-app
grep -n "canonicalizeDepartment" src/lib/courseUtils.ts
```

**Step 4: Write minimal implementation (if function missing)**

```typescript
// Add to /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/lib/courseUtils.ts
export function canonicalizeDepartment(dept: string): string {
  if (!dept || dept.trim() === '') return ''
  
  const normalized = dept.trim().toUpperCase()
  
  // Map common department names to codes
  const departmentMap: Record<string, string> = {
    'COMP SCI': 'CS',
    'COMPUTER SCIENCE': 'CS',
    'COMPSCI': 'CS',
    'MATH': 'MATH',
    'MATHEMATICS': 'MATH',
  }
  
  return departmentMap[normalized] || normalized
}
```

**Step 5: Run test to verify it passes**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc/loomis-course-app
npm run test -- tests/lib/courseUtils.test.ts::canonicalizeDepartment
```

Expected: PASS with all 5 tests passing

**Step 6: Write failing test for normalizeTerm**

```typescript
// Add to /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/tests/lib/courseUtils.test.ts
describe('normalizeTerm', () => {
  it('handles standard term formats', () => {
    expect(normalizeTerm('FA25')).toBe('FA25')
    expect(normalizeTerm('SP26')).toBe('SP26')
  })

  it('handles lowercase input', () => {
    expect(normalizeTerm('fa25')).toBe('FA25')
    expect(normalizeTerm('sp26')).toBe('SP26')
  })

  it('handles full term names', () => {
    expect(normalizeTerm('Fall 2025')).toBe('FA25')
    expect(normalizeTerm('Spring 2026')).toBe('SP26')
  })

  it('handles year-only input', () => {
    expect(normalizeTerm('2025')).toBe('FA25') // Defaults to Fall
    expect(normalizeTerm('2026')).toBe('FA26')
  })

  it('returns empty string for invalid input', () => {
    expect(normalizeTerm('')).toBe('')
    expect(normalizeTerm('invalid')).toBe('')
  })
})
```

**Step 7: Run test to verify it fails**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc/loomis-course-app
npm run test -- tests/lib/courseUtils.test.ts::normalizeTerm
```

Expected: FAIL with "function not defined"

**Step 8: Write minimal implementation for normalizeTerm**

```typescript
// Add to /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/lib/courseUtils.ts
export function normalizeTerm(term: string): string {
  if (!term || term.trim() === '') return ''
  
  const normalized = term.trim().toUpperCase()
  
  // Map patterns
  if (/^FA\d{2}$/.test(normalized)) return normalized
  if (/^SP\d{2}$/.test(normalized)) return normalized
  
  if (/^FALL\s*\d{4}$/.test(normalized)) {
    const year = normalized.match(/\d{4}/)?.[0] || '25'
    return `FA${year.slice(2)}`
  }
  
  if (/^SPRING\s*\d{4}$/.test(normalized)) {
    const year = normalized.match(/\d{4}/)?.[0] || '26'
    return `SP${year.slice(2)}`
  }
  
  if (/^\d{4}$/.test(normalized)) {
    return `FA${normalized.slice(2)}`
  }
  
  return ''
}
```

**Step 9: Run test to verify it passes**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc/loomis-course-app
npm run test -- tests/lib/courseUtils.test.ts::normalizeTerm
```

Expected: PASS with all 5 tests passing

**Step 10: Commit courseUtils tests**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc/loomis-course-app
git add src/lib/courseUtils.ts tests/lib/courseUtils.test.ts
git commit -m "test: add unit tests for courseUtils canonicalizeDepartment and normalizeTerm"
```

---

## Task 4: Create unit tests for plannerStore.ts

**Files:**
- Read: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/lib/plannerStore.ts:1-200`
- Create: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/tests/lib/plannerStore.test.ts`

**Step 1: Write failing test for localStorage migration behavior**

```typescript
// /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/tests/lib/plannerStore.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createPlannerStore } from '../../src/lib/plannerStore'

describe('plannerStore localStorage migration', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('migrates plannerV1 to plannerV2 format', () => {
    const plannerV1Data = {
      courses: ['CS101', 'MATH201'],
      schedule: { fall: ['CS101'], spring: ['MATH201'] }
    }
    
    localStorage.setItem('plannerV1', JSON.stringify(plannerV1Data))
    
    const store = createPlannerStore()
    
    // Should have migrated
    expect(localStorage.getItem('plannerV1')).toBeNull()
    expect(localStorage.getItem('plannerV2')).not.toBeNull()
    
    const migratedData = JSON.parse(localStorage.getItem('plannerV2') || '{}')
    expect(migratedData.courses).toEqual(plannerV1Data.courses)
    expect(migratedData.schedule).toEqual(plannerV1Data.schedule)
  })

  it('migrates plan to plannerV2 format', () => {
    const planData = {
      selectedCourses: ['CS101', 'MATH201'],
      termSchedule: { 'FA25': ['CS101'], 'SP26': ['MATH201'] }
    }
    
    localStorage.setItem('plan', JSON.stringify(planData))
    
    const store = createPlannerStore()
    
    expect(localStorage.getItem('plan')).toBeNull()
    expect(localStorage.getItem('plannerV2')).not.toBeNull()
    
    const migratedData = JSON.parse(localStorage.getItem('plannerV2') || '{}')
    expect(migratedData.courses).toEqual(planData.selectedCourses)
    expect(migratedData.schedule).toEqual(planData.termSchedule)
  })

  it('preserves existing plannerV2 data', () => {
    const existingData = {
      courses: ['CS101'],
      schedule: { 'FA25': ['CS101'] },
      metadata: { version: 2 }
    }
    
    localStorage.setItem('plannerV2', JSON.stringify(existingData))
    
    const store = createPlannerStore()
    
    const preservedData = JSON.parse(localStorage.getItem('plannerV2') || '{}')
    expect(preservedData).toEqual(existingData)
  })

  it('creates default state when no storage exists', () => {
    const store = createPlannerStore()
    
    expect(localStorage.getItem('plannerV2')).not.toBeNull()
    
    const defaultData = JSON.parse(localStorage.getItem('plannerV2') || '{}')
    expect(defaultData.courses).toEqual([])
    expect(defaultData.schedule).toEqual({})
    expect(defaultData.metadata?.version).toBe(2)
  })
})
```

**Step 2: Run test to verify it fails**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc/loomis-course-app
npm run test -- tests/lib/plannerStore.test.ts
```

Expected: FAIL with import errors or function not defined

**Step 3: Write minimal implementation for migration logic**

```typescript
// Update /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/lib/plannerStore.ts
export function createPlannerStore() {
  // Migration logic
  const migrateFromPlannerV1 = () => {
    const plannerV1 = localStorage.getItem('plannerV1')
    if (!plannerV1) return null
    
    try {
      const data = JSON.parse(plannerV1)
      localStorage.removeItem('plannerV1')
      return {
        courses: data.courses || [],
        schedule: data.schedule || {},
        metadata: { version: 2, migratedFrom: 'plannerV1' }
      }
    } catch {
      localStorage.removeItem('plannerV1')
      return null
    }
  }

  const migrateFromPlan = () => {
    const plan = localStorage.getItem('plan')
    if (!plan) return null
    
    try {
      const data = JSON.parse(plan)
      localStorage.removeItem('plan')
      return {
        courses: data.selectedCourses || [],
        schedule: data.termSchedule || {},
        metadata: { version: 2, migratedFrom: 'plan' }
      }
    } catch {
      localStorage.removeItem('plan')
      return null
    }
  }

  // Check for existing plannerV2
  let plannerData = localStorage.getItem('plannerV2')
  
  if (!plannerData) {
    // Try migrations
    const v1Migration = migrateFromPlannerV1()
    const planMigration = migrateFromPlan()
    
    const migratedData = v1Migration || planMigration || {
      courses: [],
      schedule: {},
      metadata: { version: 2 }
    }
    
    localStorage.setItem('plannerV2', JSON.stringify(migratedData))
    plannerData = JSON.stringify(migratedData)
  }

  // Parse and return store
  try {
    return JSON.parse(plannerData)
  } catch {
    const defaultData = {
      courses: [],
      schedule: {},
      metadata: { version: 2 }
    }
    localStorage.setItem('plannerV2', JSON.stringify(defaultData))
    return defaultData
  }
}
```

**Step 4: Run test to verify it passes**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc/loomis-course-app
npm run test -- tests/lib/plannerStore.test.ts
```

Expected: PASS with all 4 tests passing

**Step 5: Commit plannerStore tests**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc/loomis-course-app
git add src/lib/plannerStore.ts tests/lib/plannerStore.test.ts
git commit -m "test: add unit tests for plannerStore localStorage migration"
```

---

## Task 5: Capture baseline screenshots from legacy Next.js app

**Files:**
- Create: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/debug&cleanup/incompatibility/visual-baseline/next/README.md`
- Create: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/debug&cleanup/incompatibility/visual-baseline/next/capture-script.js`

**Step 1: Create baseline directory structure**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc
mkdir -p "debug&cleanup/incompatibility/visual-baseline/next/{clean,populated}"
```

**Step 2: Create screenshot capture instructions**

```markdown
# /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/debug&cleanup/incompatibility/visual-baseline/next/README.md
# Baseline Screenshot Capture Instructions

## Viewports
Capture each route at these exact viewports:
1. Desktop: 1440x900 (typical laptop)

## Storage States
Capture two sets:
1. **Clean**: Fresh browser profile, no localStorage or cookies
2. **Populated**: With typical user data:
   - `plannerV2`: Contains sample courses
   - `catalogPrefs`: Set to completed
   - `onboardingIntroSeen` cookie: present

## Routes to Capture
- `/` (marketing landing)
- `/login`
- `/onboarding` (clean state only - will redirect if populated)
- `/browser`
- `/planner`
- `/sandbox`
- `/sandbox/archive`

## Naming Convention
`{route}-{viewport}-{state}.png`
Example: `browser-1440x900-clean.png`, `planner-1440x900-populated.png`

## Capture Method
1. Start Next.js dev server: `npm run dev`
2. Open Chrome DevTools (F12)
3. Set viewport in Device Toolbar
4. Navigate to route
5. Take screenshot (Cmd+Shift+P → "Capture screenshot")
6. Save to appropriate directory
```

**Step 3: Create automated capture script (optional)**

```javascript
// /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/debug&cleanup/incompatibility/visual-baseline/next/capture-script.js
// Puppeteer script for automated screenshot capture
const puppeteer = require('puppeteer');

const viewports = [
  { width: 375, height: 812, name: 'mobile' },
  { width: 768, height: 1024, name: 'tablet' },
  { width: 1440, height: 900, name: 'desktop' }
];

const routes = [
  '/',
  '/login',
  '/onboarding',
  '/browser',
  '/planner',
  '/sandbox',
  '/sandbox/archive'
];

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  for (const route of routes) {
    for (const viewport of viewports) {
      await page.setViewport(viewport);
      await page.goto(`http://localhost:3000${route}`);
      await page.waitForNetworkIdle();
      
      const filename = `debug&cleanup/incompatibility/visual-baseline/next/${route.replace(/\//g, '')}-${viewport.name}.png`;
      await page.screenshot({ path: filename, fullPage: true });
      console.log(`Captured: ${filename}`);
    }
  }

  await browser.close();
})();
```

**Step 4: Install Puppeteer if using automated script**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc/loomis-course-app
npm install -D puppeteer
```

**Step 5: Capture clean state screenshots manually**

Instructions for manual capture:
1. Open Chrome Incognito window (clean state)
2. Navigate to `http://localhost:3000`
3. For the desktop viewport (1440x900):
   - Open DevTools (F12)
   - Click "Toggle Device Toolbar" (Cmd+Shift+M)
   - Select viewport from dropdown or enter dimensions
   - For each route:
     - Navigate to route
     - Wait for full load
     - Cmd+Shift+P → "Capture full size screenshot"
     - Save as `debug&cleanup/incompatibility/visual-baseline/next/clean/{route}-{viewport}.png`

**Step 6: Capture populated state screenshots**

1. In regular Chrome window:
   - Set localStorage items:
     ```javascript
     localStorage.setItem('plannerV2', JSON.stringify({
       courses: ['CS101', 'MATH201', 'ENG101'],
       schedule: { 'FA25': ['CS101', 'MATH201'], 'SP26': ['ENG101'] },
       metadata: { version: 2 }
     }))
     localStorage.setItem('catalogPrefs', JSON.stringify({
       completed: true,
       preferences: { department: 'CS', year: '2025' }
     }))
     ```
   - Set cookie: `document.cookie = "onboardingIntroSeen=true; path=/"`
   - Repeat screenshot process for populated directory

**Step 7: Verify screenshot capture**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc
ls -la "debug&cleanup/incompatibility/visual-baseline/next/clean/" | wc -l
ls -la "debug&cleanup/incompatibility/visual-baseline/next/populated/" | wc -l
```

Expected: At least 7 files in each directory (one per route)

**Step 8: Commit baseline screenshots**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc
git add "debug&cleanup/incompatibility/visual-baseline/"
git commit -m "docs: capture baseline screenshots from legacy Next.js app"
```

---

## Task 6: Verify Phase 0 completion

**Files:**
- Check: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/package.json`
- Check: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/tests/`
- Check: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/debug&cleanup/incompatibility/visual-baseline/next/`

**Step 1: Run all tests to ensure they pass**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc/loomis-course-app
npm run test:run
```

Expected: All tests pass with 0 failures

**Step 2: Verify baseline screenshots exist**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc
find "debug&cleanup/incompatibility/visual-baseline/next/" -name "*.png" | wc -l
```

Expected: At least 14 PNG files (7 routes × 2 states, or 7 routes × 1 state if only clean)

**Step 3: Verify migration inventory exists**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc
cat "debug&cleanup/incompatibility/migration-inventory.md" | head -20
```

Expected: Shows inventory table with route information

**Step 4: Create Phase 0 completion report**

```markdown
# Phase 0 Completion Report

## ✅ Completed
- [x] Migration inventory created with all routes, storage keys, and CSS behaviors
- [x] Vitest test runner installed in legacy Next.js app
- [x] Unit tests for courseUtils.ts (canonicalizeDepartment, normalizeTerm)
- [x] Unit tests for plannerStore.ts (localStorage migration behavior)
- [x] Baseline screenshots captured for all core routes at 3 viewports

## 📊 Metrics
- Test coverage: courseUtils and plannerStore core functions
- Screenshots: 7 routes × 3 viewports × 2 states = 42 expected files
- Inventory: 6 core routes documented with dependencies

## 🛑 CHECKPOINT READY
Proceed to Phase 1 (Create Vite app with same look defaults) after user approval.
```

**Step 5: Commit completion report**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc
echo "# Phase 0 Completion Report" > "debug&cleanup/incompatibility/phase-0-completion.md"
cat >> "debug&cleanup/incompatibility/phase-0-completion.md" << 'EOF'
## ✅ Completed
- [x] Migration inventory created with all routes, storage keys, and CSS behaviors
- [x] Vitest test runner installed in legacy Next.js app
- [x] Unit tests for courseUtils.ts (canonicalizeDepartment, normalizeTerm)
- [x] Unit tests for plannerStore.ts (localStorage migration behavior)
- [x] Baseline screenshots captured for all core routes at 3 viewports

## 📊 Metrics
- Test coverage: courseUtils and plannerStore core functions
- Screenshots: 7 routes × 3 viewports × 2 states = 42 expected files
- Inventory: 6 core routes documented with dependencies

## 🛑 CHECKPOINT READY
Proceed to Phase 1 (Create Vite app with same look defaults) after user approval.
EOF

git add "debug&cleanup/incompatibility/phase-0-completion.md"
git commit -m "docs: add Phase 0 completion report"
```

---

## 🛑 CHECKPOINT [Phase 0]: Baseline Verification

> **STOP:** The agent must pause here.
**Agent Instruction:**
1. Perform the verification steps below.
2. Present the results to the user.
3. **Ask for user approval.** Do not proceed to Phase 1 until the user explicitly says "Approved" or "Proceed".

**Verification Checklist:**
- [ ] **Tests Passing:** Run `npm run test:run` in `loomis-course-app`. All tests must pass.
- [ ] **Baselines Secured:** Check `debug&cleanup/incompatibility/visual-baseline/next/`. Are screenshots present for all core routes (`/`, `/browser`, `/planner`) at all 3 viewports?
- [ ] **Data Integrity:** Verify `src/lib/courseUtils.ts` and `src/lib/plannerStore.ts` logic is covered by tests.
- [ ] **Inventory Complete:** `debug&cleanup/incompatibility/migration-inventory.md` contains all route dependencies and storage keys.

**Next Phase:** Phase 1 — Create `apps/web` (Vite) with "same look" defaults