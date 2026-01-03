# Design Idea Inventory: browser/current

## Overview
- **Location:** `design_ideas/browser/current/`
- **Type:** Vite app
- **Main component:** `App.tsx` (33k+ bytes)

## External Dependencies (must be replaced)
- [ ] Tailwind CDN — Replace with app's Tailwind v4 build
- [ ] FontAwesome CDN — Replace with `lucide-react`
- [ ] Inter font (Google Fonts) — Use app's Proxima Nova

## NPM Dependencies (may need installing)
- `lucide-react` — Already in app
- `styled-components` — Rewrite to Tailwind/CSS Modules
- `@google/genai` — **SERVER-SIDE ONLY** (do not install in client bundle)

## Local Assets
- None found

## API/Secret Dependencies
- [ ] `GEMINI_API_KEY` — Currently injected via `vite.config.ts`. Must use server-side Route Handler in Next.js.

## Porting Complexity: High
- Reason: Requires rewriting `styled-components` to Tailwind, replacing FontAwesome with Lucide, and moving Gemini logic to a server Route Handler.

## Porting Strategy
1. Create sandbox route at `/sandbox/browser/current`
2. Rewrite `styled-components` to Tailwind utilities
3. Replace FontAwesome with `lucide-react`
4. Use Proxima Nova (already global)
5. Implement `/api/gemini` Route Handler for AI features
