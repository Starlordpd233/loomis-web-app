# Design Idea Inventory: sandbox/sandbox-landing-page

## Overview
- **Location:** `design_ideas/sandbox/sandbox-landing-page/`
- **Type:** Vite app (AI Studio export)
- **Intended destination in Next.js:** Option A: separate sandbox experiment route

## Security / Secrets (critical)
- [ ] **DO NOT PORT** any `vite.config.ts` replacements like `process.env.API_KEY` into client bundles.
- [ ] If Gemini is needed, use a server Route Handler (`/api/gemini`) or mock responses.

## Dependencies / Assets
- None found

## Porting Decision
- [x] Option A (recommended): implement at `/sandbox/landing` (dev-only experiment)
- [ ] Option B: refactor `src/app/sandbox/page.tsx` to match this design (intentional replacement)

## Notes
- This is a sandbox UX improvement only; it should **not** be part of Phase 5 production promotion unless you explicitly decide otherwise.
