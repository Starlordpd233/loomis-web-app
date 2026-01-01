# Visual Baseline Screenshots

This directory contains baseline screenshots captured from the Next.js application for visual comparison during design idea porting.

## Purpose

These screenshots serve as the "ground truth" for how the existing app looks. During Phase 4 (Visual Parity Validation), we compare sandbox screenshots against these baselines to verify visual fidelity.

## Directory Structure

```
visual-baseline/next/
├── capture-script.js    # Automated capture script (optional)
├── README.md            # This file
├── clean/               # Screenshots with empty localStorage
│   ├── index-1440x900.png
│   ├── login-1440x900.png
│   ├── onboarding-1440x900.png
│   ├── browser-1440x900.png
│   ├── planner-1440x900.png
│   └── sandbox-1440x900.png
└── populated/           # Screenshots with sample user data
    ├── index-1440x900.png
    ├── login-1440x900.png
    ├── browser-1440x900.png
    ├── planner-1440x900.png
    └── sandbox-1440x900.png
```

## Storage States

Screenshots are captured in two states:

### Clean State (`clean/`)
- Fresh browser profile
- Empty localStorage
- No cookies set
- Shows default/onboarding experience

### Populated State (`populated/`)
- `plannerV2`: Contains sample courses in grid and shopping list
- `catalogPrefs`: Set to completed
- `onboardingIntroSeen` cookie: Present
- Shows returning user experience
- Note: `/onboarding` is skipped (redirects when prefs complete)

## Viewports

Desktop resolution only (project is desktop-focused):
- **Desktop**: 1440×900

## Manual Capture (Recommended)

For Phase 4 visual comparison, manual screenshot capture is preferred:

1. Start the Next.js dev server:
   ```bash
   cd loomis-course-app
   npm run dev
   # Runs on http://localhost:3001
   ```

2. Open each route in browser:
   - `http://localhost:3001/browser`
   - `http://localhost:3001/planner`
   - etc.

3. In browser DevTools (Cmd+Option+I):
   - Open Device Toolbar (Cmd+Shift+M)
   - Set dimensions to 1440×900
   - Capture screenshot: Cmd+Shift+P → "Capture screenshot"

4. Save to appropriate directory:
   - `clean/` for empty localStorage state
   - `populated/` for state with sample data

## Automated Capture (Optional)

If `capture-script.js` is available:

```bash
# Prerequisites: npm install -D puppeteer
cd debug\&cleanup/incompatibility/visual-baseline/next

# Capture both clean and populated states
node capture-script.js

# Only capture clean state
node capture-script.js --clean-only

# Use a custom base URL
BASE_URL=http://localhost:3002 node capture-script.js
```

## Naming Convention

Files are named: `{route}-{viewport}.png`

| Route | Filename |
|-------|----------|
| `/` | `index-1440x900.png` |
| `/login` | `login-1440x900.png` |
| `/onboarding` | `onboarding-1440x900.png` |
| `/browser` | `browser-1440x900.png` |
| `/planner` | `planner-1440x900.png` |
| `/sandbox` | `sandbox-1440x900.png` |

## Usage in Migration

During **Phase 4 (Visual Parity Validation)**, these baselines are compared against sandbox screenshots:

### Manual Comparison (Primary)
1. Open baseline and sandbox screenshots side-by-side
2. Use Preview, Figma, or any image comparison tool
3. Check layout, typography, colors, spacing, borders/shadows
4. Document findings in Phase 4 checklist

### Automated Comparison (Optional)
If network access is available, pixelmatch can be used for pixel-level comparison:
```bash
# Requires: npm install pixelmatch pngjs
node compare.mjs
```

## Troubleshooting

### "Cannot reach server" error
- Make sure the dev server is running: `npm run dev`
- Check the port matches (default: 3001)

### Screenshots are blank or too small
- The script validates file size (minimum 5KB)
- Increase `animationWaitMs` in the script if pages have slow animations

### Puppeteer installation issues
On macOS, you may need:
```bash
brew install chromium
```
