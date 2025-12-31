# Phase 2: Make Tailwind Global and Stable Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

> [!NOTE]
> **Code Snippets Disclaimer:** The code snippets and examples provided in this plan are **informational and basic**. They are intended to illustrate concepts and provide guidance, but should **not** serve as the final functional code. Implementers should write production-quality code that goes beyond these examples, incorporating proper error handling, edge cases, and best practices appropriate for the codebase.

**Goal:** Expand Tailwind CSS to be available throughout the entire application while maintaining compatibility with existing CSS Modules.

**Architecture:** Update Tailwind configuration to scan all source files, create global Tailwind entry point, import in root layout, and disable Preflight only if regressions appear.

**Tech Stack:** Tailwind CSS v4, Next.js 15, CSS Modules, TypeScript

---

## Task 1: Expand Tailwind content globs

**Files:**
- Modify: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/tailwind.config.ts:5-7`

**Step 1: Backup current configuration**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc/loomis-course-app
cp tailwind.config.ts tailwind.config.ts.backup
```

**Step 2: Update content array**

```typescript
// tailwind.config.ts
content: [
  './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
],
```

**Step 3: Verify configuration syntax**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc/loomis-course-app
npx tailwindcss --config tailwind.config.ts --help
```

Expected: No errors, shows Tailwind CLI help

**Step 4: Test Tailwind scanning**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc/loomis-course-app
npx tailwindcss --config tailwind.config.ts --content ./src/app/**/*.tsx --dry-run
```

**Step 5: Commit configuration change**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc
git add loomis-course-app/tailwind.config.ts
git commit -m "feat: expand Tailwind content globs to entire app"
```

---

## Task 2: Create global Tailwind entry file

**Files:**
- Create: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/app/global-tailwind.css`
- Modify: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/app/layout.tsx`

**Step 1: Create global Tailwind CSS file**

```css
/* /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/app/global-tailwind.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Optional: Add any global Tailwind customizations */
/* Keep this file minimal - primary purpose is to load Tailwind */
```

**Step 2: Import in layout.tsx**

First, examine current layout.tsx:

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc/loomis-course-app
head -50 src/app/layout.tsx
```

**Step 3: Add import statement**

Add after existing imports in `layout.tsx`:

```typescript
import './global-tailwind.css';
```

**Step 4: Verify import order**

Ensure `global-tailwind.css` is imported after `globals.css` to maintain CSS variable precedence:

```typescript
import './globals.css';
import './global-tailwind.css';
```

**Step 5: Test build with new CSS import**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc/loomis-course-app
npm run build
```

Expected: Build completes successfully

**Step 6: Commit global Tailwind setup**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc
git add loomis-course-app/src/app/global-tailwind.css
git add loomis-course-app/src/app/layout.tsx
git commit -m "feat: add global Tailwind CSS entry point"
```

---

## Task 3: Test Tailwind in non-sandbox routes

**Files:**
- Create: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/app/test-tailwind/page.tsx`
- Modify: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/app/test-tailwind/layout.tsx`

**Step 1: Create test route directory**

```bash
mkdir -p /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc/loomis-course-app/src/app/test-tailwind
```

**Step 2: Create test layout (optional - uses root layout)**

```typescript
// /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/app/test-tailwind/layout.tsx
export default function TestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
```

**Step 3: Create test page with Tailwind classes**

```typescript
// /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/app/test-tailwind/page.tsx
export default function TestTailwindPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Tailwind Global Test
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Utility Classes
          </h2>
          <p className="text-gray-600">
            If you see a white card with rounded corners and shadow, 
            Tailwind utilities are working.
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <h2 className="text-xl font-semibold mb-2">
            Gradient & Colors
          </h2>
          <p>
            If you see this blue-purple gradient, Tailwind colors 
            and gradients are working.
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Responsive Design
          </h2>
          <p className="text-gray-600">
            On large screens, these cards should be in a 3-column grid.
            Cards display in a 3-column grid layout.
          </p>
        </div>
      </div>
      
      <div className="bg-gray-100 rounded-lg p-4">
        <h3 className="font-medium text-gray-700 mb-2">Test Results:</h3>
        <ul className="list-disc pl-5 text-gray-600 space-y-1">
          <li>Background gradient: Should be blue to purple</li>
          <li>Card shadows: Should have subtle shadows</li>
          <li>Responsive grid: Should change at md breakpoint</li>
          <li>Border colors: Green accent border on last card</li>
        </ul>
      </div>
    </div>
  );
}
```

**Step 4: Test the route**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc/loomis-course-app
npm run dev &
# Visit http://localhost:3001/test-tailwind
```

**Step 5: Verify visual appearance**

Check for:
- Blue to purple background gradient
- White cards with shadows
- 3-column grid on desktop
- Green accent border

**Step 6: Commit test route**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc
git add loomis-course-app/src/app/test-tailwind/
git commit -m "test: add Tailwind global test route"
```

---

## Task 4: Check for Preflight conflicts with existing styles

**Files:**
- Read: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/app/globals.css`
- Test: Existing routes (`/browser`, `/planner`, `/onboarding`)

**Step 1: Understand Preflight impact**

Tailwind's Preflight resets default browser styles. Check if existing styles rely on browser defaults.

**Step 2: Test existing routes**

Navigate to each main route and check for visual regressions:

```bash
# Browser route
curl -s http://localhost:3001/browser | grep -o '<title>[^<]*</title>'

# Planner route  
curl -s http://localhost:3001/planner | grep -o '<title>[^<]*</title>'

# Onboarding route
curl -s http://localhost:3001/onboarding | grep -o '<title>[^<]*</title>'
```

**Step 3: Visual inspection checklist**

Manually visit each route and check:
- [ ] Font family still Proxima Nova
- [ ] Colors match CSS variables (--text, --background, etc.)
- [ ] Spacing and layout unchanged
- [ ] Interactive elements (buttons, inputs) styled correctly
- [ ] Scrollbars styled if custom scrollbar CSS exists

**Step 4: Disable Preflight if regressions found**

If issues appear, update `tailwind.config.ts`:

```typescript
const config: Config = {
  content: [/* ... */],
  corePlugins: {
    preflight: false, // Disable Preflight reset
  },
  // ... rest of config
};
```

**Step 5: Test with Preflight disabled**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc/loomis-course-app
npm run build
npm run dev &
# Re-test existing routes
```

**Step 6: Document decision**

Create note in project docs:

```markdown
## Tailwind Preflight Status
- **Date:** 2025-12-30
- **Decision:** Preflight [enabled/disabled]
- **Reason:** [Brief explanation of compatibility findings]
- **Impact:** [How this affects design ideas integration]
```

**Step 7: Commit Preflight decision**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc
git add loomis-course-app/tailwind.config.ts
git add "debug&cleanup/incompatibility/TAILWIND-PREFLIGHT.md"  # if created
git commit -m "config: [enable/disable] Tailwind Preflight based on compatibility testing"
```

---

## Task 5: Verify CSS Modules compatibility

**Files:**
- Check: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/app/**/*.module.css`
- Test: Any route using CSS Modules

**Step 1: Find CSS Module files**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc/loomis-course-app
find src/app -name "*.module.css" | head -10
```

**Step 2: Create compatibility test**

Create a test component that uses both CSS Modules and Tailwind:

```typescript
// /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/app/test-tailwind/compatibility/page.tsx
import styles from './compatibility.module.css';

export default function CompatibilityTest() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">CSS Modules + Tailwind Test</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">CSS Module Only</h2>
        <div className={styles.moduleBox}>
          This box uses only CSS Module styles (red background, white text)
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Tailwind Only</h2>
        <div className="bg-blue-500 text-white p-4 rounded-lg">
          This box uses only Tailwind classes (blue background, white text)
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Mixed Styles</h2>
        <div className={`${styles.moduleBox} border-4 border-green-500 p-6`}>
          This box combines CSS Module (red background) with Tailwind (green border, extra padding)
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Create CSS Module file**

```css
/* /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/app/test-tailwind/compatibility/compatibility.module.css */
.moduleBox {
  background-color: #ef4444; /* Tailwind red-500 */
  color: white;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}
```

**Step 4: Test compatibility**

Visit `http://localhost:3001/test-tailwind/compatibility` and verify:
- First box: Red background (CSS Module)
- Second box: Blue background (Tailwind)
- Third box: Red background with green border (mixed)

**Step 5: Check for style conflicts**

Inspect elements in browser DevTools to ensure:
- No style overrides between CSS Modules and Tailwind
- Specificity conflicts resolved correctly
- Both styling systems work independently and together

**Step 6: Document compatibility findings**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc
echo "CSS Modules and Tailwind compatibility test passed on $(date)" >> "debug&cleanup/incompatibility/TAILWIND-COMPATIBILITY.md"
```

**Step 7: Clean up test routes (optional)**

```bash
rm -rf /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc/loomis-course-app/src/app/test-tailwind
git add -u
git commit -m "test: remove Tailwind test routes after verification"
```

---

## Verification Checklist for Phase 2

- [ ] `npm run dev` starts without errors
- [ ] `npm run build` completes successfully
- [ ] `/test-tailwind` shows Tailwind working globally
- [ ] Existing routes (`/browser`, `/planner`, `/onboarding`) render unchanged
- [ ] CSS Modules still work alongside Tailwind
- [ ] Tailwind classes work in non-sandbox routes
- [ ] Preflight decision documented and tested
- [ ] No visual regressions in production routes