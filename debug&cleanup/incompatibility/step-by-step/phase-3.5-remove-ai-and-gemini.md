# Phase 3.5: Remove AI (Gemini) Everywhere — Code + Plans + Docs

> **Goal:** Remove all AI-related functionality and all Gemini-specific content from this migration so that:
> 1) the current codebase no longer contains AI/Gemini features already implemented during Phases 0–3, and  
> 2) none of the six phase plans can reintroduce AI/Gemini in future phases.

> [!IMPORTANT]
> This phase is a **scope correction**: the migration proceeds **UI-only** (no AI advisor, no Gemini integration, no external AI SDKs, no Gemini API route).

---

## Scope and Definitions

### In scope (must remove)
- Any Gemini integration or AI feature work (real or mock), including:
  - Any route like `/api/gemini`
  - Any “AI advisor” UI, even disabled placeholders
  - Any mention of Gemini as a feature dependency, requirement, or “future work” for this migration
  - Env vars like `GEMINI_API_KEY`, `MOCK_GEMINI`, `NEXT_PUBLIC_GEMINI_*`
  - Libraries like `@google/genai`
  - “AI Studio export” instructions when they imply Gemini keys/AI features are required for this task

### Out of scope (do NOT remove)
- Course catalog *content* that mentions “AI” as a subject (course titles/descriptions). That is not an app feature.
  - If you want a “no AI wording anywhere” policy, treat it as a separate content task.

---

## Shell Quoting Gotchas (zsh)

These paths must be quoted in commands:
- `debug&cleanup/...` contains `&`
- `loomis-course-app/src/app/(app)/...` contains parentheses

Examples:
```bash
rg -n "gemini" "debug&cleanup/incompatibility/step-by-step"
sed -n '1,80p' "loomis-course-app/src/app/(app)/browser/page.tsx"
```

---

## Current Gemini/AI Footprint (What Exists Right Now)

### Implemented AI/Gemini feature code (must remove)
- `loomis-course-app/src/app/api/gemini/route.ts` (mock “Gemini” endpoint)
- `loomis-course-app/src/features/browser/enhanced-explorer/EnhancedExplorer.tsx` (contains “AI Counselor / AI Course Advisor” UI section)
- `loomis-course-app/src/app/sandbox/browser/current/components/EnhancedExplorer.tsx` (placeholder file mentioning Gemini dependencies)
- `loomis-course-app/src/app/sandbox/experiments.ts` (experiment description/tags mention AI + Gemini)

### Plans/docs that mention Gemini/AI (must remove from plans; docs recommended)
- Phase plans:
  - `debug&cleanup/incompatibility/step-by-step/phase-1-inventory-and-standardization.md`
  - `debug&cleanup/incompatibility/step-by-step/phase-3-sandbox-integration-fidelity.md`
  - `debug&cleanup/incompatibility/step-by-step/phase-5-production-promotion.md`
- Supporting docs (recommended to update so they stop re-introducing Gemini):
  - `debug&cleanup/incompatibility/documentation/phase-1-completion-status.md`
  - `debug&cleanup/incompatibility/documentation/phase-3-completion-status.md`
  - `debug&cleanup/incompatibility/inventory-current.md`
  - `debug&cleanup/incompatibility/inventory-sandbox-landing-page.md`
  - `planning/expand_nextjs_with_vite.md`

---

## Definition of Done (Required)

After completing this phase:

1) **No AI/Gemini feature code remains in the Next.js app**
```bash
rg -n "(?i)(gemini|@google/genai|GEMINI_API_KEY|/api/gemini)" loomis-course-app/src
rg -n "AI Course Advisor|AI Counselor|Ask Advisor" loomis-course-app/src
```
Both commands should return **no matches** (course catalog content is excluded from this requirement; see scope).

2) **All six phase plans are AI/Gemini-free**
```bash
rg -n "(?i)(gemini|@google/genai|GEMINI_API_KEY|/api/gemini|ai studio)" "debug&cleanup/incompatibility/step-by-step"
```
Should return **no matches**.

3) **Build/test sanity**
```bash
cd loomis-course-app && npm run lint
cd loomis-course-app && npm run test:run
cd loomis-course-app && npm run build
```

---

# Task A — Remove Implemented AI/Gemini Features From the Codebase

## A1) Remove the Gemini API route

1) Delete:
- `loomis-course-app/src/app/api/gemini/route.ts`

2) If the `gemini/` folder becomes empty, remove:
- `loomis-course-app/src/app/api/gemini/`

Verification:
```bash
rg -n "(?i)(gemini|/api/gemini)" loomis-course-app/src/app/api || true
```

---

## A2) Remove AI Advisor UI from the ported Enhanced Explorer

Edit:
- `loomis-course-app/src/features/browser/enhanced-explorer/EnhancedExplorer.tsx`

Remove the “advisor” feature entirely:
- Remove the sidebar “AI Counselor” callout and “Ask Advisor” button
- Remove the `assistant` tab branch (the section gated by `activeTab === 'assistant'`)
- Remove any now-unused imports/icons/state

Verification:
```bash
rg -n "AI Counselor|Ask Advisor|AI Course Advisor|activeTab === 'assistant'" loomis-course-app/src/features/browser/enhanced-explorer/EnhancedExplorer.tsx || true
```

---

## A3) Remove the unused placeholder component that still mentions Gemini

Preferred: delete (since it’s not used by the page route and is Gemini-heavy text):
- `loomis-course-app/src/app/sandbox/browser/current/components/EnhancedExplorer.tsx`
- Remove the now-empty folder:
  - `loomis-course-app/src/app/sandbox/browser/current/components/`

Verification:
```bash
rg -n "(?i)(gemini|@google/genai|\\bai\\b)" loomis-course-app/src/app/sandbox/browser/current || true
```

---

## A4) Remove AI/Gemini wording from the sandbox experiment registry

Edit:
- `loomis-course-app/src/app/sandbox/experiments.ts`

For the “Enhanced Explorer” experiment entry:
- Change description from AI/Gemini wording to a UI-only description
- Remove tags `ai` and `gemini` (keep neutral tags like `catalog`, `explorer`)

Verification:
```bash
rg -n "(?i)(gemini|\\bai\\b)" loomis-course-app/src/app/sandbox/experiments.ts || true
```

---

## A5) Decide what to do with `loomis-course-app/src/data/catalog.json`

This file exists and is large. If it was introduced only to support the Gemini route:

Option A (recommended): delete it and remove the directory if empty:
- `loomis-course-app/src/data/catalog.json`
- `loomis-course-app/src/data/`

Option B: keep it only if it’s used for non-AI features (confirm usage first).

Usage check:
```bash
rg -n "src/data/catalog\\.json|@/data/catalog\\.json" loomis-course-app/src || true
```

---

# Task B — Scrub Gemini/AI From the Six Phase Plans (Step-by-Step Files)

> [!IMPORTANT]
> You must edit the existing phase plan files (not just “ignore” the Gemini sections), otherwise future execution will reintroduce AI.

## B0) One-pass audit command
Run repeatedly while editing:
```bash
rg -n "(?i)(gemini|@google/genai|GEMINI_API_KEY|/api/gemini|ai studio)" "debug&cleanup/incompatibility/step-by-step" || true
```

---

## B1) Phase 0 plan
File:
- `debug&cleanup/incompatibility/step-by-step/migration-phase-0-baselines-tests.md`

Expected: no Gemini/AI references. No changes needed.

---

## B2) Phase 1 plan (inventory/standardization) — remove Gemini-specific items
File:
- `debug&cleanup/incompatibility/step-by-step/phase-1-inventory-and-standardization.md`

Make these edits:
- In “Critical warnings”, replace Gemini examples with generic language:
  - “Client-side secrets (API keys/tokens)” instead of `GEMINI_API_KEY`
  - Keep the “do not port Vite env injection” rule, but remove Gemini framing
- In the inventory template for `browser/current`:
  - Remove `@google/genai` from “NPM Dependencies”
  - Remove `GEMINI_API_KEY` from “API/Secret Dependencies”
  - Remove “Mock Gemini API…” from “Porting Strategy”
- In the sandbox landing-page inventory template:
  - Replace “AI Studio export” wording with neutral “Vite export/prototype”
  - Remove the “If Gemini is needed…” line entirely
- Rename/remove the “Confirm no client-side Gemini SDK imports” step:
  - Either delete it, or convert it into a generic “Confirm no unsafe SDK imports / client-side secrets”

---

## B3) Phase 2 plan
File:
- `debug&cleanup/incompatibility/step-by-step/phase-2-tailwind-global-stable.md`

Expected: no Gemini/AI references. No changes needed.

---

## B4) Phase 3 plan (sandbox integration) — delete the Gemini architecture and AI tests
File:
- `debug&cleanup/incompatibility/step-by-step/phase-3-sandbox-integration-fidelity.md`

Make these edits:
- Remove the Gemini rule from “Critical porting rules” and replace with:
  - “No AI features and no AI API integrations in this migration.”
- Update “Recommended porting order” to remove “Gemini API integration” wording
- Delete the “Task 4, Step 2.5: Establish Gemini server boundary” section
- Delete the entire `## Gemini Integration Architecture` section (everything under it)
- Remove the fidelity checklist item about “AI response handling”
- Remove references to `MOCK_GEMINI`, `GEMINI_API_KEY`, `/api/gemini` from this plan

---

## B5) Phase 4 plan (visual parity)
File:
- `debug&cleanup/incompatibility/step-by-step/phase-4-visual-parity-validation.md`

Ensure parity scope does not assume an AI advisor exists. If the plan mentions “advisor/AI”, remove it and define parity as UI/UX parity for browsing/filtering/listing features only.

---

## B6) Phase 5 plan (production promotion) — remove Gemini env vars and server-boundary checks
File:
- `debug&cleanup/incompatibility/step-by-step/phase-5-production-promotion.md`

Make these edits:
- Remove any env var instructions that add `GEMINI_API_KEY`
- Remove “Gemini security invariant” block
- Remove the “Verify the server boundary” step (client → `/api/gemini`)
- Replace any “AI-enhanced” descriptions with UI-only descriptions
- Remove acceptance criteria about Gemini secret exposure

---

# Task C — Recommended Documentation Cleanup (Stops Gemini From Coming Back)

Even if Phase plans are cleaned, these docs will keep reintroducing Gemini unless updated:

- `debug&cleanup/incompatibility/documentation/phase-1-completion-status.md`
  - Remove references to `@google/genai`, Gemini migration, `/api/gemini`
- `debug&cleanup/incompatibility/documentation/phase-3-completion-status.md`
  - Remove claims about implementing `/api/gemini`
  - Remove “AI Advisor placeholder” narrative
  - Remove “Live Gemini integration” future work items
- `debug&cleanup/incompatibility/inventory-current.md`
  - Remove Gemini dependencies and `/api/gemini` porting strategy
- `debug&cleanup/incompatibility/inventory-sandbox-landing-page.md`
  - Remove “AI Studio export” wording and “If Gemini is needed…” line
- `planning/expand_nextjs_with_vite.md`
  - Remove Gemini examples (`@google/genai`, `GEMINI_API_KEY`)

---

# Task D — Guardrails (Prevents Future AI Reintroduction)

## D1) Add a repo policy note
Add a short note to a project doc (e.g., root `README.md` or a migration doc) stating:
- AI integrations are explicitly out of scope for this migration
- banned patterns: `@google/genai`, `GEMINI_API_KEY`, `/api/gemini`, `NEXT_PUBLIC_GEMINI_*`

## D2) Add a fail-fast “no gemini” check
Add a script and wire it into a local command or CI:
```bash
rg -n "(?i)(@google/genai|\\bgemini\\b|GEMINI_API_KEY|/api/gemini|ai studio)" . && exit 1 || exit 0
```
Tune scope if you intentionally keep `design_ideas/` as historical exports.

## D3) Optional: ESLint import bans
Add `no-restricted-imports` for `@google/genai` so it can’t be reintroduced.

---

# Final Verification

From repo root:
```bash
rg -n "(?i)(gemini|@google/genai|GEMINI_API_KEY|/api/gemini)" loomis-course-app/src
rg -n "(?i)(gemini|@google/genai|GEMINI_API_KEY|/api/gemini|ai studio)" "debug&cleanup/incompatibility/step-by-step"
cd loomis-course-app && npm run lint
cd loomis-course-app && npm run test:run
cd loomis-course-app && npm run build
```

If any grep checks still match, do not proceed to Phase 4/5 until all AI/Gemini references are removed.

