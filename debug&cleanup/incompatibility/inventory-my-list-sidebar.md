# Design Idea Inventory: browser/my_list_sidebar

## Overview
- **Location:** `design_ideas/browser/my_list_sidebar/`
- **Type:** Vite app
- **Main component:** `App.tsx`

## External Dependencies (must be replaced)
- [ ] Tailwind CDN — Replace with app's Tailwind v4 build
- [ ] Inter font — Use app's Proxima Nova

## NPM Dependencies
- `lucide-react` — Already in app

## Local Assets
- None found

## API/Secret Dependencies
- None

## Porting Complexity: Low
- Reason: Tailwind-only, no styled-components, no secrets.

## Porting Strategy
1. Create sandbox route at `/sandbox/browser/my-list-sidebar`
2. Replace CDN Tailwind with app's Tailwind build
3. Convert icons to lucide-react (if not already)
4. Use Proxima Nova
