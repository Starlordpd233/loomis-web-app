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
