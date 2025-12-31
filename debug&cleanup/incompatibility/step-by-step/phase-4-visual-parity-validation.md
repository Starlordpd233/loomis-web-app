# Phase 4: Visual Parity Validation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

> [!NOTE]
> **Code Snippets Disclaimer:** The code snippets and examples provided in this plan are **informational and basic**. They are intended to illustrate concepts and provide guidance, but should **not** serve as the final functional code. Implementers should write production-quality code that goes beyond these examples, incorporating proper error handling, edge cases, and best practices appropriate for the codebase.

**Goal:** Systematically verify visual fidelity between sandbox implementations and original design ideas using screenshot comparison and automated visual regression testing.

**Architecture:** Capture baseline screenshots from original Vite apps, capture comparison screenshots from sandbox routes, implement pixel-level comparison with configurable tolerance, generate diff reports, and establish pass/fail criteria for visual parity.

**Tech Stack:** Playwright for screenshot capture, pixelmatch for image comparison, TypeScript for automation scripts, GitHub Actions for CI integration

---

## Task 1: Set up screenshot capture infrastructure

**Files:**
- Create: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility/debug&cleanup/incompatibility/visual-validation/`
- Create: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility/debug&cleanup/incompatibility/visual-validation/capture-baselines.mjs`
- Create: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility/debug&cleanup/incompatibility/visual-validation/capture-sandbox.mjs`
- Create: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility/debug&cleanup/incompatibility/visual-validation/package.json`

**Step 1: Create directory structure**

```bash
mkdir -p /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc-solve-incompatibility/debug\&cleanup/incompatibility/step-by-step/visual-validation/{baselines/original,baselines/sandbox,diffs,reports}
```

**Step 2: Initialize npm package for visual validation**

```json
// /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility/debug&cleanup/incompatibility/visual-validation/package.json
{
  "name": "visual-parity-validation",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "capture:original": "node capture-baselines.mjs",
    "capture:sandbox": "node capture-sandbox.mjs",
    "compare": "node compare.mjs",
    "report": "node generate-report.mjs"
  },
  "dependencies": {
    "playwright": "^1.48.0",
    "pixelmatch": "^6.0.0",
    "pngjs": "^7.0.0",
    "fs-extra": "^11.2.0",
    "chalk": "^5.3.0"
  }
}
```

**Step 3: Install dependencies**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc-solve-incompatibility/debug\&cleanup/incompatibility/step-by-step/visual-validation
npm install
```

**Step 4: Install Playwright browsers**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc-solve-incompatibility/debug\&cleanup/incompatibility/step-by-step/visual-validation
npx playwright install chromium
```

**Step 5: Commit infrastructure setup**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc
git add debug\&cleanup/incompatibility/step-by-step/visual-validation/
git commit -m "feat: set up visual parity validation infrastructure"
```

---

## Task 2: Capture baselines from original design ideas

**Files:**
- Modify: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility/debug&cleanup/incompatibility/visual-validation/capture-baselines.mjs`
- Create: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility/debug&cleanup/incompatibility/visual-validation/config.mjs`

**Step 1: Create configuration file**

```javascript
// /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility/debug&cleanup/incompatibility/visual-validation/config.mjs
export const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 }
];

export const DESIGN_IDEAS = [
  {
    id: 'enhanced-explorer',
    name: 'Enhanced Explorer',
    originalPath: '/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility/design_ideas/browser/current',
    originalUrl: 'http://localhost:3000', // When Vite dev server is running
    sandboxPath: '/sandbox/browser/enhanced-explorer',
    sandboxUrl: 'http://localhost:3001/sandbox/browser/enhanced-explorer',
    testStates: ['initial', 'search-focused', 'filter-expanded', 'course-selected']
  },
  {
    id: 'catalog-browser',
    name: 'Catalog Browser',
    originalPath: '/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility/design_ideas/browser/google-academic-catalog-browser',
    originalUrl: 'http://localhost:3000',
    sandboxPath: '/sandbox/browser/catalog-browser',
    sandboxUrl: 'http://localhost:3001/sandbox/browser/catalog-browser',
    testStates: ['initial', 'search-active', 'filters-applied']
  },
  {
    id: 'my-list-sidebar',
    name: 'My List Sidebar',
    originalPath: '/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility/design_ideas/browser/my_list_sidebar',
    originalUrl: 'http://localhost:3000',
    sandboxPath: '/sandbox/browser/my-list-sidebar',
    sandboxUrl: 'http://localhost:3001/sandbox/browser/my-list-sidebar',
    testStates: ['initial', 'item-dragging', 'sidebar-collapsed']
  }
];
```

**Step 2: Create baseline capture script**

```javascript
// /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility/debug&cleanup/incompatibility/visual-validation/capture-baselines.mjs
import { chromium } from 'playwright';
import fs from 'fs-extra';
import { DESIGN_IDEAS, VIEWPORTS } from './config.mjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function captureBaselines() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  
  for (const idea of DESIGN_IDEAS) {
    console.log(`Capturing baselines for ${idea.name}...`);
    
    // Start Vite dev server for this design idea if not running
    // Note: This assumes each design idea runs on localhost:3000
    // In practice, you might need to start servers on different ports
    
    for (const viewport of VIEWPORTS) {
      const page = await context.newPage();
      await page.setViewportSize(viewport);
      
      // Navigate to original design idea
      await page.goto(idea.originalUrl);
      await page.waitForLoadState('networkidle');
      
      // Capture screenshot
      const screenshotPath = join(
        __dirname,
        'baselines',
        'original',
        `${idea.id}-${viewport.name}.png`
      );
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`  ✓ ${viewport.name}: ${screenshotPath}`);
      
      await page.close();
    }
  }
  
  await browser.close();
  console.log('Baseline capture complete!');
}

captureBaselines().catch(console.error);
```

**Step 3: Start Vite dev server for design ideas**

```bash
# In separate terminal for each design idea
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc-solve-incompatibility/design_ideas/browser/current
npm run dev &
# Runs on http://localhost:3000 (or check package.json for actual port)
```

**Step 4: Run baseline capture**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc-solve-incompatibility/debug\&cleanup/incompatibility/step-by-step/visual-validation
node capture-baselines.mjs
```

Expected: Creates PNG files in `baselines/original/` for each design idea × viewport

**Step 5: Commit baselines**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc
git add debug\&cleanup/incompatibility/step-by-step/visual-validation/baselines/original/
git commit -m "feat: capture baseline screenshots from original design ideas"
```

---

## Task 3: Capture sandbox implementation screenshots

**Files:**
- Create: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility/debug&cleanup/incompatibility/visual-validation/capture-sandbox.mjs`

**Step 1: Create sandbox capture script**

```javascript
// /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility/debug&cleanup/incompatibility/visual-validation/capture-sandbox.mjs
import { chromium } from 'playwright';
import fs from 'fs-extra';
import { DESIGN_IDEAS, VIEWPORTS } from './config.mjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function captureSandbox() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  
  for (const idea of DESIGN_IDEAS) {
    console.log(`Capturing sandbox for ${idea.name}...`);
    
    for (const viewport of VIEWPORTS) {
      const page = await context.newPage();
      await page.setViewportSize(viewport);
      
      // Navigate to sandbox route
      await page.goto(idea.sandboxUrl);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000); // Allow animations to settle
      
      // Capture screenshot
      const screenshotPath = join(
        __dirname,
        'baselines',
        'sandbox',
        `${idea.id}-${viewport.name}.png`
      );
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`  ✓ ${viewport.name}: ${screenshotPath}`);
      
      await page.close();
    }
  }
  
  await browser.close();
  console.log('Sandbox capture complete!');
}

captureSandbox().catch(console.error);
```

**Step 2: Ensure Next.js dev server is running**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc-solve-incompatibility/loomis-course-app
npm run dev &
# Runs on http://localhost:3001
```

**Step 3: Run sandbox capture**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc-solve-incompatibility/debug\&cleanup/incompatibility/step-by-step/visual-validation
node capture-sandbox.mjs
```

Expected: Creates PNG files in `baselines/sandbox/` for each sandbox route × viewport

**Step 4: Commit sandbox screenshots**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc
git add debug\&cleanup/incompatibility/step-by-step/visual-validation/baselines/sandbox/
git commit -m "feat: capture sandbox implementation screenshots"
```

---

## Task 4: Implement pixel-level comparison

**Files:**
- Create: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility/debug&cleanup/incompatibility/visual-validation/compare.mjs`
- Create: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility/debug&cleanup/incompatibility/visual-validation/thresholds.mjs`

**Step 1: Create comparison thresholds configuration**

```javascript
// /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility/debug&cleanup/incompatibility/visual-validation/thresholds.mjs
export const THRESHOLDS = {
  // Pixel difference tolerance (0-1)
  pixelDiff: 0.01, // 1% of pixels can differ
  
  // Color difference tolerance (0-255)
  colorDiff: 10,
  
  // Alpha channel tolerance
  alphaDiff: 0.1,
  
  // Per-design idea overrides
  overrides: {
    'enhanced-explorer': {
      pixelDiff: 0.02, // Slightly higher tolerance for animations
      notes: 'Contains subtle animations that may cause timing differences'
    },
    'catalog-browser': {
      pixelDiff: 0.005, // Very strict for static layouts
      notes: 'Static layout should match exactly'
    }
  }
};
```

**Step 2: Create comparison script**

```javascript
// /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility/debug&cleanup/incompatibility/visual-validation/compare.mjs
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import fs from 'fs-extra';
import { DESIGN_IDEAS, VIEWPORTS } from './config.mjs';
import { THRESHOLDS } from './thresholds.mjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import chalk from 'chalk';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function compareImages(originalPath, sandboxPath, diffPath, ideaId, viewportName) {
  const img1 = PNG.sync.read(fs.readFileSync(originalPath));
  const img2 = PNG.sync.read(fs.readFileSync(sandboxPath));
  
  const { width, height } = img1;
  const diff = new PNG({ width, height });
  
  const threshold = THRESHOLDS.overrides[ideaId]?.pixelDiff || THRESHOLDS.pixelDiff;
  const numDiffPixels = pixelmatch(
    img1.data,
    img2.data,
    diff.data,
    width,
    height,
    {
      threshold: threshold,
      includeAA: false
    }
  );
  
  const totalPixels = width * height;
  const diffPercentage = (numDiffPixels / totalPixels) * 100;
  
  // Save diff image
  if (numDiffPixels > 0) {
    fs.writeFileSync(diffPath, PNG.sync.write(diff));
  }
  
  return {
    numDiffPixels,
    totalPixels,
    diffPercentage,
    width,
    height,
    passed: diffPercentage <= (threshold * 100)
  };
}

async function runComparison() {
  const results = [];
  const report = {
    timestamp: new Date().toISOString(),
    totalComparisons: 0,
    passed: 0,
    failed: 0,
    details: []
  };
  
  for (const idea of DESIGN_IDEAS) {
    console.log(chalk.bold(`\nComparing ${idea.name}:`));
    
    for (const viewport of VIEWPORTS) {
      const originalPath = join(
        __dirname,
        'baselines',
        'original',
        `${idea.id}-${viewport.name}.png`
      );
      const sandboxPath = join(
        __dirname,
        'baselines',
        'sandbox',
        `${idea.id}-${viewport.name}.png`
      );
      const diffPath = join(
        __dirname,
        'diffs',
        `${idea.id}-${viewport.name}-diff.png`
      );
      
      if (!fs.existsSync(originalPath) || !fs.existsSync(sandboxPath)) {
        console.log(chalk.yellow(`  ⚠ ${viewport.name}: Missing images`));
        continue;
      }
      
      const comparison = await compareImages(
        originalPath,
        sandboxPath,
        diffPath,
        idea.id,
        viewport.name
      );
      
      report.totalComparisons++;
      if (comparison.passed) {
        report.passed++;
        console.log(chalk.green(`  ✓ ${viewport.name}: ${comparison.diffPercentage.toFixed(2)}% diff`));
      } else {
        report.failed++;
        console.log(chalk.red(`  ✗ ${viewport.name}: ${comparison.diffPercentage.toFixed(2)}% diff`));
        console.log(chalk.gray(`     Diff saved: ${diffPath}`));
      }
      
      report.details.push({
        idea: idea.name,
        viewport: viewport.name,
        ...comparison,
        diffPath: comparison.numDiffPixels > 0 ? diffPath : null
      });
    }
  }
  
  // Save report
  const reportPath = join(__dirname, 'reports', `comparison-${new Date().toISOString().split('T')[0]}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(chalk.bold('\n📊 Summary:'));
  console.log(`Total comparisons: ${report.totalComparisons}`);
  console.log(chalk.green(`Passed: ${report.passed}`));
  console.log(chalk.red(`Failed: ${report.failed}`));
  console.log(`Report saved: ${reportPath}`);
  
  return report;
}

runComparison().catch(console.error);
```

**Step 3: Run comparison**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc-solve-incompatibility/debug\&cleanup/incompatibility/step-by-step/visual-validation
node compare.mjs
```

Expected: Output showing pass/fail for each comparison, diff images for failures

**Step 4: Test with intentional failure**

Create a test to verify comparison works:

```bash
# Create a modified version of a screenshot
cp /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc-solve-incompatibility/debug\&cleanup/incompatibility/step-by-step/visual-validation/baselines/sandbox/enhanced-explorer-desktop.png \
   /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc-solve-incompatibility/debug\&cleanup/incompatibility/step-by-step/visual-validation/baselines/sandbox/enhanced-explorer-desktop-MODIFIED.png

# Run comparison with modified image
node -e "
const fs = require('fs');
const path = '/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility/debug&cleanup/incompatibility/visual-validation/baselines/sandbox/enhanced-explorer-desktop-MODIFIED.png';
const data = fs.readFileSync(path);
const modified = Buffer.from(data);
modified[1000] = 255; // Change a pixel
fs.writeFileSync(path, modified);
console.log('Modified pixel for testing');
"
```

**Step 5: Commit comparison infrastructure**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc
git add debug\&cleanup/incompatibility/step-by-step/visual-validation/{compare.mjs,thresholds.mjs}
git commit -m "feat: implement pixel-level comparison for visual parity"
```

---

## Task 5: Generate HTML report

**Files:**
- Create: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility/debug&cleanup/incompatibility/visual-validation/generate-report.mjs`
- Create: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility/debug&cleanup/incompatibility/visual-validation/templates/report-template.html`

**Step 1: Create HTML template**

```html
<!-- /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility/debug&cleanup/incompatibility/visual-validation/templates/report-template.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visual Parity Validation Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 2rem; }
        .header { background: #f8f9fa; padding: 2rem; border-radius: 8px; margin-bottom: 2rem; }
        .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; }
        .stat { background: white; padding: 1.5rem; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
        .stat.passed { border-left: 4px solid #10b981; }
        .stat.failed { border-left: 4px solid #ef4444; }
        .stat.total { border-left: 4px solid #3b82f6; }
        .comparison { background: white; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 1.5rem; padding: 1.5rem; }
        .comparison.passed { border-left: 4px solid #10b981; }
        .comparison.failed { border-left: 4px solid #ef4444; }
        .images { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1rem; }
        .image-container { text-align: center; }
        .image-container img { max-width: 100%; border: 1px solid #e5e7eb; border-radius: 4px; }
        .diff-badge { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.875rem; font-weight: 500; }
        .diff-badge.passed { background: #d1fae5; color: #065f46; }
        .diff-badge.failed { background: #fee2e2; color: #991b1b; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Visual Parity Validation Report</h1>
        <p>Generated on {{timestamp}}</p>
    </div>
    
    <div class="summary">
        <div class="stat total">
            <h3>Total Comparisons</h3>
            <p style="font-size: 2rem; font-weight: bold;">{{totalComparisons}}</p>
        </div>
        <div class="stat passed">
            <h3>Passed</h3>
            <p style="font-size: 2rem; font-weight: bold; color: #10b981;">{{passed}}</p>
        </div>
        <div class="stat failed">
            <h3>Failed</h3>
            <p style="font-size: 2rem; font-weight: bold; color: #ef4444;">{{failed}}</p>
        </div>
    </div>
    
    <h2>Comparison Details</h2>
    
    {{#each details}}
    <div class="comparison {{#if passed}}passed{{else}}failed{{/if}}">
        <h3>{{idea}} - {{viewport}}</h3>
        <p>
            <span class="diff-badge {{#if passed}}passed{{else}}failed{{/if}}">
                {{#if passed}}✓ PASSED{{else}}✗ FAILED{{/if}}
            </span>
            <span style="margin-left: 1rem;">
                {{diffPercentage}}% different ({{numDiffPixels}}/{{totalPixels}} pixels)
            </span>
        </p>
        
        <div class="images">
            <div class="image-container">
                <p><strong>Original</strong></p>
                <img src="data:image/png;base64,{{originalBase64}}" alt="Original design">
            </div>
            <div class="image-container">
                <p><strong>Sandbox</strong></p>
                <img src="data:image/png;base64,{{sandboxBase64}}" alt="Sandbox implementation">
            </div>
            <div class="image-container">
                <p><strong>Difference</strong></p>
                {{#if diffBase64}}
                <img src="data:image/png;base64,{{diffBase64}}" alt="Difference map">
                {{else}}
                <p style="color: #6b7280;">No differences detected</p>
                {{/if}}
            </div>
        </div>
    </div>
    {{/each}}
</body>
</html>
```

**Step 2: Create report generator**

```javascript
// /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility/debug&cleanup/incompatibility/visual-validation/generate-report.mjs
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function generateHTMLReport() {
  // Find latest comparison report
  const reportsDir = join(__dirname, 'reports');
  const reportFiles = fs.readdirSync(reportsDir)
    .filter(f => f.endsWith('.json'))
    .sort()
    .reverse();
  
  if (reportFiles.length === 0) {
    console.error('No comparison reports found');
    return;
  }
  
  const latestReport = reportFiles[0];
  const reportPath = join(reportsDir, latestReport);
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  
  // Read template
  const templatePath = join(__dirname, 'templates', 'report-template.html');
  let template = fs.readFileSync(templatePath, 'utf8');
  
  // Prepare template data
  const templateData = {
    timestamp: new Date(report.timestamp).toLocaleString(),
    totalComparisons: report.totalComparisons,
    passed: report.passed,
    failed: report.failed,
    details: []
  };
  
  // Process each comparison
  for (const detail of report.details) {
    const detailWithImages = { ...detail };
    
    // Convert images to base64 for embedding
    const originalPath = join(__dirname, 'baselines', 'original', `${detail.idea.toLowerCase().replace(/\s+/g, '-')}-${detail.viewport}.png`);
    const sandboxPath = join(__dirname, 'baselines', 'sandbox', `${detail.idea.toLowerCase().replace(/\s+/g, '-')}-${detail.viewport}.png`);
    
    if (fs.existsSync(originalPath)) {
      detailWithImages.originalBase64 = fs.readFileSync(originalPath, 'base64');
    }
    if (fs.existsSync(sandboxPath)) {
      detailWithImages.sandboxBase64 = fs.readFileSync(sandboxPath, 'base64');
    }
    if (detail.diffPath && fs.existsSync(detail.diffPath)) {
      detailWithImages.diffBase64 = fs.readFileSync(detail.diffPath, 'base64');
    }
    
    templateData.details.push(detailWithImages);
  }
  
  // Replace template variables (simple string replacement)
  template = template.replace('{{timestamp}}', templateData.timestamp);
  template = template.replace('{{totalComparisons}}', templateData.totalComparisons);
  template = template.replace('{{passed}}', templateData.passed);
  template = template.replace('{{failed}}', templateData.failed);
  
  // Replace details section (more complex)
  let detailsHTML = '';
  for (const detail of templateData.details) {
    let detailHTML = template.match(/{{#each details}}([\s\S]*?){{\/each}}/)[1];
    
    // Replace detail variables
    detailHTML = detailHTML.replace(/{{idea}}/g, detail.idea);
    detailHTML = detailHTML.replace(/{{viewport}}/g, detail.viewport);
    detailHTML = detailHTML.replace(/{{diffPercentage}}/g, detail.diffPercentage.toFixed(2));
    detailHTML = detailHTML.replace(/{{numDiffPixels}}/g, detail.numDiffPixels.toLocaleString());
    detailHTML = detailHTML.replace(/{{totalPixels}}/g, detail.totalPixels.toLocaleString());
    detailHTML = detailHTML.replace(/{{originalBase64}}/g, detail.originalBase64 || '');
    detailHTML = detailHTML.replace(/{{sandboxBase64}}/g, detail.sandboxBase64 || '');
    detailHTML = detailHTML.replace(/{{diffBase64}}/g, detail.diffBase64 || '');
    
    // Conditional classes
    detailHTML = detailHTML.replace(/{{#if passed}}/g, detail.passed ? '' : '<!--');
    detailHTML = detailHTML.replace(/{{else}}/g, detail.passed ? '-->' : '');
    detailHTML = detailHTML.replace(/{{\/if}}/g, detail.passed ? '' : '-->');
    
    detailsHTML += detailHTML;
  }
  
  template = template.replace(/{{#each details}}[\s\S]*?{{\/each}}/, detailsHTML);
  
  // Write HTML report
  const htmlReportPath = join(__dirname, 'reports', `visual-parity-report-${new Date().toISOString().split('T')[0]}.html`);
  fs.writeFileSync(htmlReportPath, template);
  
  console.log(`HTML report generated: ${htmlReportPath}`);
  console.log(`Open in browser: file://${htmlReportPath}`);
}

generateHTMLReport().catch(console.error);
```

**Step 3: Generate report**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc-solve-incompatibility/debug\&cleanup/incompatibility/step-by-step/visual-validation
node generate-report.mjs
```

Expected: HTML report file in reports/ directory with embedded images

**Step 4: View report in browser**

```bash
open /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc-solve-incompatibility/debug\&cleanup/incompatibility/step-by-step/visual-validation/reports/visual-parity-report-*.html
```

**Step 5: Commit reporting system**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc
git add debug\&cleanup/incompatibility/step-by-step/visual-validation/{generate-report.mjs,templates/}
git commit -m "feat: add HTML reporting for visual parity validation"
```

---

## Task 6: Integrate with CI/CD

**Files:**
- Create: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility/debug&cleanup/incompatibility/visual-validation/.github/workflows/visual-parity.yml`
- Create: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility/debug&cleanup/incompatibility/visual-validation/ci-run.mjs`

**Step 1: Create CI runner script**

```javascript
// /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility/debug&cleanup/incompatibility/visual-validation/ci-run.mjs
import { execSync } from 'child_process';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function runCICheck() {
  console.log('🚀 Starting visual parity CI check');
  
  try {
    // 1. Install dependencies
    console.log('📦 Installing dependencies...');
    execSync('npm install', { cwd: __dirname, stdio: 'inherit' });
    
    // 2. Install Playwright
    console.log('🌐 Installing Playwright browsers...');
    execSync('npx playwright install chromium', { cwd: __dirname, stdio: 'inherit' });
    
    // 3. Start servers (in background)
    console.log('🖥️ Starting development servers...');
    // Note: In CI, you'd need to start both Vite and Next.js dev servers
    // This is simplified - real CI would use docker-compose or similar
    
    // 4. Run comparisons
    console.log('🔍 Running visual comparisons...');
    execSync('node compare.mjs', { cwd: __dirname, stdio: 'inherit' });
    
    // 5. Check results
    const reportsDir = join(__dirname, 'reports');
    const reportFiles = fs.readdirSync(reportsDir)
      .filter(f => f.endsWith('.json'))
      .sort()
      .reverse();
    
    if (reportFiles.length === 0) {
      throw new Error('No comparison report generated');
    }
    
    const latestReport = JSON.parse(
      fs.readFileSync(join(reportsDir, reportFiles[0]), 'utf8')
    );
    
    console.log('\n📊 CI Results:');
    console.log(`Total comparisons: ${latestReport.totalComparisons}`);
    console.log(`Passed: ${latestReport.passed}`);
    console.log(`Failed: ${latestReport.failed}`);
    
    // Fail CI if any comparisons failed
    if (latestReport.failed > 0) {
      console.error('❌ Visual parity check failed!');
      process.exit(1);
    }
    
    console.log('✅ All visual parity checks passed!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ CI check failed:', error.message);
    process.exit(1);
  }
}

runCICheck();
```

**Step 2: Create GitHub Actions workflow**

```yaml
# /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility/debug&cleanup/incompatibility/visual-validation/.github/workflows/visual-parity.yml
name: Visual Parity Validation

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 0 * * *'  # Daily check

jobs:
  visual-parity:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: |
        cd debug&cleanup/incompatibility/visual-validation
        npm ci
    
    - name: Install Playwright browsers
      run: |
        cd debug&cleanup/incompatibility/visual-validation
        npx playwright install chromium
    
    - name: Start Next.js dev server
      run: |
        cd loomis-course-app
        npm run dev &
        sleep 10  # Wait for server to start
    
    - name: Start Vite dev servers
      run: |
        # Start each design idea's Vite server
        cd design_ideas/browser/current
        npm run dev &
        sleep 5
        
        cd ../google-academic-catalog-browser
        npm run dev &
        sleep 5
        
        cd ../my_list_sidebar
        npm run dev &
        sleep 5
    
    - name: Run visual parity check
      run: |
        cd debug&cleanup/incompatibility/visual-validation
        node ci-run.mjs
    
    - name: Upload report artifact
      if: always()
      uses: actions/upload-artifact@v4
      with:
        name: visual-parity-report
        path: debug&cleanup/incompatibility/visual-validation/reports/
        retention-days: 30
```

**Step 3: Test CI script locally**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc-solve-incompatibility/debug\&cleanup/incompatibility/step-by-step/visual-validation
node ci-run.mjs
```

**Step 4: Commit CI integration**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc
git add debug\&cleanup/incompatibility/step-by-step/visual-validation/{.github/,ci-run.mjs}
git commit -m "feat: add CI integration for visual parity validation"
```

---

## Visual Parity Acceptance Criteria

### For Each Design Idea

- [ ] **Desktop viewport (1440×900)**: ≤1% pixel difference from original
- [ ] **Interactive states**: Test key interactive states match (hover, focus, active)
- [ ] **Animation timing**: CSS transitions/animation durations match within 10%
- [ ] **Font rendering**: Same font family, weight, and size rendering
- [ ] **Color accuracy**: Colors match within perceptual difference threshold
- [ ] **Layout spacing**: Margin/padding differences ≤2px

### Overall Validation

- [ ] All three design ideas pass visual parity check
- [ ] CI pipeline passes with zero failures
- [ ] HTML report generated with embedded comparison images
- [ ] Diff images available for any failures
- [ ] Historical tracking of visual drift over time

---

## Next Phase Handoff

After completing Phase 4, proceed to **Phase 5: Production Promotion** which includes:
1. Promoting sandbox experiments to production routes
2. Updating navigation and feature flags
3. Performance optimization and bundle analysis
4. User acceptance testing workflow

**Verification Checklist for Phase 4:**
- [ ] `npm run dev` starts both Next.js and design idea Vite servers
- [ ] Baseline screenshots captured for all design ideas × viewports
- [ ] Sandbox screenshots captured for all routes × viewports  
- [ ] Pixel comparison runs without errors
- [ ] HTML report generates successfully
- [ ] CI script executes locally
- [ ] All visual parity acceptance criteria documented
