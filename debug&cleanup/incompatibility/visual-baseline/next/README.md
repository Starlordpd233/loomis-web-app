# Visual Baseline Screenshots

This directory contains baseline screenshots captured from the legacy Next.js application for visual regression testing during migration.

## Purpose

These screenshots serve as the "ground truth" for how the legacy app looks. During and after migration to the new Vite app, we can compare new screenshots against these baselines to detect unintended visual changes.

## Directory Structure

```
visual-baseline/next/
├── capture-script.js    # Automated capture script
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

Currently capturing at desktop resolution only:
- **Desktop**: 1440×900 (typical laptop)

> The project is desktop-only, so mobile/tablet viewports are not captured.

## Running the Capture Script

### Prerequisites

1. Install dependencies (in `loomis-course-app/`):
   ```bash
   npm install -D puppeteer
   ```

2. Start the dev server:
   ```bash
   npm run dev
   ```

### Basic Usage

From this directory (`planning/visual-baseline/next/`):

```bash
# Capture both clean and populated states
node capture-script.js

# Only capture clean state
node capture-script.js --clean-only

# Only capture populated state
node capture-script.js --populated-only

# Use a custom base URL
BASE_URL=http://localhost:3002 node capture-script.js
```

### Expected Output

```
╔════════════════════════════════════════════════════════════╗
║           Visual Baseline Capture Script                   ║
╚════════════════════════════════════════════════════════════╝

[12:00:00] 🚀 Base URL: http://localhost:3001
[12:00:00] 📐 Viewports: 1440x900
[12:00:00] 🗂️ Routes: 6 routes to capture

[12:00:01] 📸 Starting capture for CLEAN state...
[12:00:02] ✅ Captured: index-1440x900.png (clean)
[12:00:03] ✅ Captured: login-1440x900.png (clean)
...

╔════════════════════════════════════════════════════════════╗
║                        Summary                             ║
╚════════════════════════════════════════════════════════════╝

[12:00:15] ✅ Successful: 11
[12:00:15] ⏭️ Skipped: 1
[12:00:15] ❌ Failed: 0
[12:00:15] 🎉 All captures completed successfully!
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

During Phase 4 (Visual Parity Validation), these baselines will be compared against screenshots from the new Vite app using tools like:

- [pixelmatch](https://github.com/mapbox/pixelmatch) - pixel-level comparison
- [reg-cli](https://github.com/reg-viz/reg-cli) - visual regression reports
- Manual visual inspection

A difference threshold will be configured to allow minor variations (e.g., anti-aliasing differences) while catching significant layout changes.
