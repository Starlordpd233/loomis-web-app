# Phase 4: Visual Parity Validation

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

> [!NOTE]
> **Code Snippets Disclaimer:** Snippets illustrate intent; implement production-quality changes as needed.

**Goal:** Verify sandbox implementations visually match original design ideas before promoting to production. Also verify production routes have no regressions from Phase 0 baselines.

**Architecture:** Manual screenshot comparison is the primary workflow. Two types of comparisons:
1. **Parity:** Sandbox vs original prototypes (are new components faithful?)
2. **Regression:** Production routes vs Phase 0 baselines (did Tailwind changes break anything?)

Capture at desktop resolution (1440×900) in both clean and populated states. Automated Playwright/pixelmatch comparison is optional.

**Tech Stack:** Browser DevTools (screenshots), image viewer for manual comparison

---

## Prerequisites

- Phase 3 complete (sandbox components ported and rendering)
- Working directory: **Repo Root**
- Dev server runs on port `3001` (`cd loomis-course-app && npm run dev`)
- Sandbox routes accessible:
  - `/sandbox/browser/current`
  - `/sandbox/browser/my-list-sidebar`
- Original design ideas can be opened in browser:
  - `design_ideas/browser/current/index.html`
  - `design_ideas/browser/my_list_sidebar/index.html`

---

## Task 0 (Required): Regression check vs Phase 0 baselines

**Goal:** Confirm Phase 2/3 changes did not regress core production routes by comparing against Phase 0 baseline screenshots.

**Files:**
- Read: `debug&cleanup/incompatibility/visual-baseline/next/`
- Write: `debug&cleanup/incompatibility/visual-validation/production/` (new captures)

**Step 1: Confirm Phase 0 baselines exist**

```bash
ls -la "debug&cleanup/incompatibility/visual-baseline/next/clean/" | head
ls -la "debug&cleanup/incompatibility/visual-baseline/next/populated/" | head
```

**Step 2: Capture current production route screenshots**

If you haven't run Task 1 yet, create the output folders now:

```bash
mkdir -p debug\&cleanup/incompatibility/visual-validation/production/{clean,populated}
```

Using the same rules as Phase 0 (1440×900, clean + populated states), capture:
- `/`, `/login`, `/onboarding`, `/browser`, `/planner`

Save to:
- `debug&cleanup/incompatibility/visual-validation/production/clean/{route-name}-1440x900.png`
- `debug&cleanup/incompatibility/visual-validation/production/populated/{route-name}-1440x900.png`

**Step 3: Compare vs Phase 0 baselines**

Open each pair side-by-side (baseline vs current) and verify no unexpected diffs.

> [!IMPORTANT]
> If regressions exist, stop and fix them before spending time on sandbox parity work.

---

## Task 1: Set up visual validation directory

**Goal:** Create directory structure for storing comparison screenshots.

**Files:**
- Create: `debug&cleanup/incompatibility/visual-validation/`

**Step 1: Create directory structure**

```bash
mkdir -p debug\&cleanup/incompatibility/visual-validation/{original,sandbox,production,diffs}
mkdir -p debug\&cleanup/incompatibility/visual-validation/original/{current,my-list-sidebar}
mkdir -p debug\&cleanup/incompatibility/visual-validation/sandbox/{current,my-list-sidebar}
mkdir -p debug\&cleanup/incompatibility/visual-validation/production/{clean,populated}
```

**Step 2: Create validation README**

```bash
cat > "debug&cleanup/incompatibility/visual-validation/README.md" << 'EOF'
# Visual Parity Validation

This folder stores screenshots for comparing sandbox implementations against original design ideas.

## Directory Structure

```
visual-validation/
├── original/           # Screenshots from design_ideas/browser/*
│   ├── current/
│   └── my-list-sidebar/
├── sandbox/            # Screenshots from /sandbox/browser/*
│   ├── current/
│   └── my-list-sidebar/
├── production/         # Screenshots from production routes (regression vs Phase 0 baselines)
│   ├── clean/
│   └── populated/
└── diffs/              # Difference images (if using automated comparison)
```

## Manual Comparison Workflow

1. Capture screenshots at 1440×900 desktop resolution
2. Use clean state (initial load) and populated state (after interaction)
3. Compare side-by-side using Preview, Figma, or any image viewer
4. Document any differences in the comparison checklist below

## Regression Workflow (Required)

1. Compare `visual-baseline/next/*` (Phase 0) vs `visual-validation/production/*` (current)
2. If production regressions exist, fix before continuing with sandbox parity

## Comparison Checklist

### current (Enhanced Explorer)

| Aspect | Match? | Notes |
|--------|--------|-------|
| Layout/structure | ☐ | |
| Typography (font, size, weight) | ☐ | |
| Colors (backgrounds, text, accents) | ☐ | |
| Spacing (margins, padding, gaps) | ☐ | |
| Borders and shadows | ☐ | |
| Interactive states (hover, focus) | ☐ | |
| Animations/transitions | ☐ | |

### my-list-sidebar (My List Sidebar)

| Aspect | Match? | Notes |
|--------|--------|-------|
| Layout/structure | ☐ | |
| Typography (font, size, weight) | ☐ | |
| Colors (backgrounds, text, accents) | ☐ | |
| Spacing (margins, padding, gaps) | ☐ | |
| Borders and shadows | ☐ | |
| Interactive states (hover, focus) | ☐ | |
| Animations/transitions | ☐ | |

## Font Note

Original design ideas may use Inter or other external fonts. Sandbox uses Proxima Nova (app's global font). Minor font rendering differences are expected and acceptable if overall visual weight and spacing are comparable.
EOF
```

**Step 3: Commit structure**

```bash
git add debug\&cleanup/incompatibility/visual-validation/
git commit -m "feat: create visual validation directory structure"
```

---

## Task 2: Capture original design idea screenshots

**Goal:** Take baseline screenshots from the original Vite/HTML design ideas.

**Step 1: Open current design idea**

Open in browser:
```bash
# If it's a static HTML file:
open design_ideas/browser/current/index.html

# If it's a Vite app (check for package.json):
cd design_ideas/browser/current && npm run dev
# Then visit http://localhost:5173 (default Vite port)
```

**Step 2: Capture desktop screenshot (1440×900)**

In browser DevTools (Cmd+Option+I on Mac):
1. Open Device Toolbar (Cmd+Shift+M)
2. Set dimensions to 1440×900
3. Ensure "Fit to window" is selected if needed
4. Take screenshot:
   - Chrome: Cmd+Shift+P → "Capture screenshot"
   - Or right-click → "Capture node screenshot" on body

Save as: `debug&cleanup/incompatibility/visual-validation/original/current/desktop-clean.png`

**Step 3: Capture populated state**

If the design idea has interactive states (e.g., search results, expanded filters):
1. Trigger the state
2. Take another screenshot
3. Save as: `debug&cleanup/incompatibility/visual-validation/original/current/desktop-populated.png`

**Step 4: Repeat for my_list_sidebar**

```bash
open design_ideas/browser/my_list_sidebar/index.html
# Or: cd design_ideas/browser/my_list_sidebar && npm run dev
```

Save as:
- `debug&cleanup/incompatibility/visual-validation/original/my-list-sidebar/desktop-clean.png`
- `debug&cleanup/incompatibility/visual-validation/original/my-list-sidebar/desktop-populated.png` (if applicable)

**Step 5: Commit original baselines**

```bash
git add debug\&cleanup/incompatibility/visual-validation/original/
git commit -m "feat: capture original design idea baselines"
```

---

## Task 3: Capture sandbox implementation screenshots

**Goal:** Take comparison screenshots from the ported sandbox routes.

**Step 1: Start Next.js dev server**

```bash
cd loomis-course-app
npm run dev
# Runs on http://localhost:3001
```

**Step 2: Capture sandbox current**

Visit: `http://localhost:3001/sandbox/browser/current`

In browser DevTools:
1. Set viewport to 1440×900
2. Take screenshot
3. Save as: `debug&cleanup/incompatibility/visual-validation/sandbox/current/desktop-clean.png`

If populated state:
1. Trigger the same state as original
2. Save as: `debug&cleanup/incompatibility/visual-validation/sandbox/current/desktop-populated.png`

**Step 3: Capture sandbox my-list-sidebar**

Visit: `http://localhost:3001/sandbox/browser/my-list-sidebar`

Save as:
- `debug&cleanup/incompatibility/visual-validation/sandbox/my-list-sidebar/desktop-clean.png`
- `debug&cleanup/incompatibility/visual-validation/sandbox/my-list-sidebar/desktop-populated.png` (if applicable)

**Step 4: Commit sandbox screenshots**

```bash
git add debug\&cleanup/incompatibility/visual-validation/sandbox/
git commit -m "feat: capture sandbox implementation screenshots"
```

---

## Task 4: Perform manual comparison

**Goal:** Compare original and sandbox screenshots side-by-side.

**Step 1: Open both images**

Using Preview, Figma, or any image comparison tool:

```bash
# Open original and sandbox side-by-side
open debug\&cleanup/incompatibility/visual-validation/original/current/desktop-clean.png
open debug\&cleanup/incompatibility/visual-validation/sandbox/current/desktop-clean.png
```

**Step 2: Compare each aspect**

For each design idea, check:

| Aspect | What to look for |
|--------|------------------|
| Layout/structure | Same grid, flex, positioning |
| Typography | Font appears similar weight, size, line-height |
| Colors | Backgrounds, text, buttons match |
| Spacing | Margins, padding, gaps are visually equivalent |
| Borders/shadows | Same border styles, shadow depth |
| Interactive states | Hover effects, focus rings behave similarly |

**Step 3: Document findings**

Update the checklist in `debug&cleanup/incompatibility/visual-validation/README.md` with findings.

**Step 4: If differences found**

For each significant difference:
1. Document in README with specific file/line references
2. Return to Phase 3 to fix the issue
3. Re-capture sandbox screenshot
4. Re-compare

**Step 5: Commit comparison results**

```bash
git add debug\&cleanup/incompatibility/visual-validation/README.md
git commit -m "docs: complete visual parity comparison"
```

---

## Task 5 (Optional): Automated comparison with Puppeteer

> [!NOTE]
> **Prefer existing workflow.** Use the Puppeteer baseline workflow from Phase 0 (`debug&cleanup/incompatibility/visual-baseline/next/capture-script.js`) to maintain consistency. Avoid introducing Playwright unless you intentionally standardize on it for the entire project.

> [!TIP]
> **Deterministic Capture Guidance:**
> - Disable CSS animations during capture (add `* { animation: none !important; transition: none !important; }` via page.addStyleTag)
> - Use consistent viewport (1440×900)
> - Wait for network idle and fonts to load
> - Consider adding `--deterministic` flag to capture script

**Goal:** Set up automated pixel-level comparison for ongoing visual regression testing.

**Files:**
- Create: `debug&cleanup/incompatibility/visual-validation/package.json`
- Create: `debug&cleanup/incompatibility/visual-validation/compare.mjs`

**Step 1: Initialize npm package**

```bash
cd debug\&cleanup/incompatibility/visual-validation

cat > package.json << 'EOF'
{
  "name": "visual-parity-validation",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "capture:original": "node capture-original.mjs",
    "capture:sandbox": "node capture-sandbox.mjs",
    "compare": "node compare.mjs"
  }
}
EOF
```

**Step 2: Install dependencies (REQUIRES NETWORK)**

```bash
npm install playwright pixelmatch pngjs
npx playwright install chromium
```

**Step 3: Create comparison script**

```javascript
// debug&cleanup/incompatibility/visual-validation/compare.mjs
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import fs from 'fs';
import path from 'path';

const DESIGN_IDEAS = ['current', 'my-list-sidebar'];
const THRESHOLD = 0.01; // 1% pixel difference tolerance

async function compare() {
  let allPassed = true;

  for (const idea of DESIGN_IDEAS) {
    const originalPath = `original/${idea}/desktop-clean.png`;
    const sandboxPath = `sandbox/${idea}/desktop-clean.png`;
    const diffPath = `diffs/${idea}-diff.png`;

    if (!fs.existsSync(originalPath) || !fs.existsSync(sandboxPath)) {
      console.log(`⚠ ${idea}: Missing screenshots`);
      continue;
    }

    const img1 = PNG.sync.read(fs.readFileSync(originalPath));
    const img2 = PNG.sync.read(fs.readFileSync(sandboxPath));

    const { width, height } = img1;
    const diff = new PNG({ width, height });

    const numDiffPixels = pixelmatch(
      img1.data, img2.data, diff.data,
      width, height,
      { threshold: 0.1 }
    );

    const diffPercent = (numDiffPixels / (width * height)) * 100;
    const passed = diffPercent <= (THRESHOLD * 100);

    if (passed) {
      console.log(`✓ ${idea}: ${diffPercent.toFixed(2)}% diff (PASS)`);
    } else {
      console.log(`✗ ${idea}: ${diffPercent.toFixed(2)}% diff (FAIL)`);
      fs.mkdirSync('diffs', { recursive: true });
      fs.writeFileSync(diffPath, PNG.sync.write(diff));
      console.log(`  Diff saved: ${diffPath}`);
      allPassed = false;
    }
  }

  if (!allPassed) {
    console.log('\n❌ Visual parity check failed');
    process.exit(1);
  }

  console.log('\n✅ All visual parity checks passed');
}

compare().catch(console.error);
```

**Step 4: Run comparison**

```bash
cd debug\&cleanup/incompatibility/visual-validation
node compare.mjs
```

**Step 5: Commit automation (if used)**

```bash
git add debug\&cleanup/incompatibility/visual-validation/{package.json,compare.mjs}
git commit -m "feat: add optional automated visual comparison"
```

---

## Acceptance Criteria

For each design idea (current, my-list-sidebar):

- [ ] Original screenshot captured at 1440×900
- [ ] Sandbox screenshot captured at 1440×900
- [ ] Manual comparison completed
- [ ] All checklist items pass (or documented acceptable differences)

### Expected Acceptable Differences

These differences are expected and acceptable:
- Font rendering (Inter → Proxima Nova)
- Minor anti-aliasing differences between browsers
- Timing of animations (if captured mid-animation)

### Unacceptable Differences

These require fixes in Phase 3:
- Layout structure mismatches
- Wrong colors
- Missing elements
- Broken interactivity
- Significant spacing differences (>4px)

---

## Verification Checklist for Phase 4

- [ ] Visual validation directory exists with screenshots
- [ ] Original baselines captured for both design ideas
- [ ] Sandbox screenshots captured for both design ideas
- [ ] Manual comparison completed for each design idea
- [ ] README checklist updated with findings
- [ ] No blocking visual differences (or documented as acceptable)
- [ ] **Regression check (Task 0):** Production screenshots captured to `visual-validation/production/` and match Phase 0 baselines (no regressions from Tailwind/styling changes)

---

## 🛑 CHECKPOINT [Phase 4]: Visual Parity Complete

> **STOP:** Verify all design ideas pass visual comparison before proceeding.

**Verification:**
- [ ] `current` passes visual comparison (or differences documented as acceptable)
- [ ] `my-list-sidebar` passes visual comparison (or differences documented as acceptable)
- [ ] README checklist completed
- [ ] Phase 0 baseline regression check passed (Task 0)
- [ ] No console errors on sandbox routes

**Next Phase:** Phase 5 — Production Promotion

---

## Rollback

If visual comparison reveals significant issues:

1. Return to Phase 3 to fix styling issues
2. Re-capture sandbox screenshots
3. Re-run comparison

Screenshots are non-destructive; simply overwrite with new captures after fixes.
