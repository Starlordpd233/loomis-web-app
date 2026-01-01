You are an agent updating documentation runbooks in an existing repo. Your only deliverable is UPDATED PLANS (Markdown) — do not implement code changes unless the plan explicitly needs a tiny fix to keep the plan truthful (prefer updating the plan to match reality).

## Objective
Audit and comprehensively rewrite the phase plans so they match the *actual* workflow and repo state, eliminate drift/incorrect assumptions, and make every phase plan executable, specific, and internally consistent.

## Canonical workflow / source of truth
Treat this file as the workflow contract and invariants:
- `planning/migrate-nextjs-to-vite-composable.md`

This project is NOT doing a Next.js → Vite production migration anymore. The intended workflow is:
- Keep `loomis-course-app/` (Next.js) as the host app.
- Integrate Vite-exported “design ideas” into Next.js `/sandbox` routes.
- Validate fidelity (visual + behavior) and then promote experiments into production routes.

## Files you MUST update (rewrite for accuracy + specificity)
Overview (source plan):
- `planning/migrate-nextjs-to-vite-composable.md` (verify and refine; keep it canonical)

Step-by-step runbooks (rewrite each):
- `debug&cleanup/incompatibility/step-by-step/migration-phase-0-baselines-tests.md`
- `debug&cleanup/incompatibility/step-by-step/phase-1-inventory-and-standardization.md`
- `debug&cleanup/incompatibility/step-by-step/phase-2-tailwind-global-stable.md`
- `debug&cleanup/incompatibility/step-by-step/phase-3-sandbox-integration-fidelity.md`
- `debug&cleanup/incompatibility/step-by-step/phase-4-visual-parity-validation.md`
- `debug&cleanup/incompatibility/step-by-step/phase-5-production-promotion.md`

Strongly recommended to also align (they are referenced/used by the plans):
- `debug&cleanup/incompatibility/phase-0-completion.md` (currently contains incorrect metrics if plans are corrected)
- `debug&cleanup/incompatibility/visual-baseline/next/README.md` (currently claims script features/paths that don’t match the actual script)
- (Optional) `debug&cleanup/incompatibility/visual-baseline/next/capture-script.js` SHOULD NOT be modified unless necessary; prefer updating docs to match what it actually does.

## Repo facts you must anchor to (do not guess)
Repo root:
- `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility`

Next.js app:
- `loomis-course-app/`
- Dev server runs on port `3001` (`loomis-course-app/package.json` script: `next dev -p 3001`)

Tailwind:
- Tailwind v4 is installed in `loomis-course-app` and wired via PostCSS:
  - `loomis-course-app/postcss.config.mjs` uses `@tailwindcss/postcss`
- Tailwind config exists:
  - `loomis-course-app/tailwind.config.ts` currently scans only `./src/app/sandbox/**`
- Tailwind CLI binary is NOT assumed to exist; don’t instruct `npx tailwindcss ...` unless you also add/install a CLI (which requires network approval).

Global styling + tokens:
- App tokens and reset live in `loomis-course-app/src/app/globals.css`
- App font is Proxima Nova (local `@font-face` in `globals.css`)
- Theme is controlled by `data-theme="light|dark"` on `html` and `body` (`loomis-course-app/src/app/ThemeToggle.tsx`); DO NOT assume a `.dark` class.

Sandbox styling today:
- Tailwind v4 syntax is used in `loomis-course-app/src/app/sandbox/sandbox.css` (`@import "tailwindcss";`)
- That same file currently defines `:root { --background ... }` etc which collides with global tokens in `globals.css`.

Design ideas present:
- Only these exist under `design_ideas/browser/`:
  - `design_ideas/browser/current`
  - `design_ideas/browser/my_list_sidebar`
- These prototypes use Tailwind CDN + external Inter font in `index.html`:
  - `design_ideas/browser/current/index.html`
  - `design_ideas/browser/my_list_sidebar/index.html`
  Plans must explicitly call out that this must NOT be copied into Next (no CDN Tailwind, no Google Fonts fetch for sandbox/production).

Visual baselines already exist (Next app):
- `debug&cleanup/incompatibility/visual-baseline/next/clean/*-1440x900.png`
- `debug&cleanup/incompatibility/visual-baseline/next/populated/*-1440x900.png`
Reality check: baselines are DESKTOP ONLY right now (1440x900), not 3 viewports.

Network constraints:
- Assume network access is restricted; any plan step that requires `npm install` / Playwright browser installs / etc must be clearly labeled “requires network approval” and should include a no-network alternative if possible.

Shell quoting:
- Paths include spaces and `debug&cleanup` includes `&` (shell special). Use repo-relative paths and quote paths in commands.

## Known drifts you must explicitly fix (with pointers)
These are proven incorrect/inconsistent and must be removed or corrected everywhere:

1) Wrong workflow: “Next.js → Vite production migration”
- Any mention of creating `apps/web`, `pnpm create vite`, React Router scaffolding, etc is drift in THIS repo’s current workflow. Remove or isolate into an “optional future migration” appendix.

2) Tailwind v3 syntax and Tailwind CLI assumptions
- Phase 2 previously used `@tailwind base/components/utilities` and `npx tailwindcss`. This is invalid for Tailwind v4 + your current pipeline.
- Enforce Tailwind v4 CSS-first syntax and validation via `npm run build`.

3) Preflight risk not treated as breaking
- Any plan that enables Tailwind Preflight globally must:
  - call it high-risk
  - default to keeping it OFF
  - require baseline re-validation
  - document rollback

4) Ports and URLs inconsistent with repo
- `loomis-course-app` runs on `http://localhost:3001`
- Fix any `http://localhost:3000` references for Next (example drift in Phase 0 template code and Phase 4 config).

5) Wrong directories and nonexistent paths
- Phase 4 runbook currently creates/uses `debug&cleanup/incompatibility/step-by-step/visual-validation/...` (WRONG)
  - Must use `debug&cleanup/incompatibility/visual-validation/...` (this exists)
- Phase 4 references a non-existent design idea:
  - `design_ideas/browser/google-academic-catalog-browser` (does not exist; remove)

6) Incorrect baseline expectations
- Phase 0 runbook currently claims “3 viewports / 42 files” (incorrect vs existing baseline folder).
- Update Phase 0 plan to match the established baseline approach: desktop `1440x900` only, clean + populated states.

7) Commands using the wrong repo root
- Multiple runbooks use `cd /Users/.../clubs/web_dev_lc` (missing `-solve-incompatibility`).
- Replace with repo-relative commands (preferred) or correct absolute path.

8) Network-install steps that aren’t needed
- Example drift: `phase-3-sandbox-integration-fidelity.md` includes `npm install lucide-react` even though `loomis-course-app` already depends on `lucide-react`.
- Remove those installs or replace with “verify dependency already present”.

Concrete evidence (you can cite these exact locations while fixing):
- Phase 0 viewport/port drift in template code:
  - `debug&cleanup/incompatibility/step-by-step/migration-phase-0-baselines-tests.md:601` (mobile/tablet/desktop array)
  - `debug&cleanup/incompatibility/step-by-step/migration-phase-0-baselines-tests.md:624` (uses `http://localhost:3000`)
  - `debug&cleanup/incompatibility/step-by-step/migration-phase-0-baselines-tests.md:741` (claims 3 viewports)
- Phase 4 wrong dir + network installs + nonexistent design idea:
  - `debug&cleanup/incompatibility/step-by-step/phase-4-visual-parity-validation.md:27` (wrong visual-validation dir)
  - `debug&cleanup/incompatibility/step-by-step/phase-4-visual-parity-validation.md:58` (`npm install`)
  - `debug&cleanup/incompatibility/step-by-step/phase-4-visual-parity-validation.md:65` (`npx playwright install`)
  - `debug&cleanup/incompatibility/step-by-step/phase-4-visual-parity-validation.md:105` (nonexistent design idea path)
- Phase 3 unnecessary install:
  - `debug&cleanup/incompatibility/step-by-step/phase-3-sandbox-integration-fidelity.md:444` (`npm install lucide-react`)

## What “good” looks like (acceptance criteria)
For EACH phase runbook:
- Uses repo-relative paths by default (e.g., `cd loomis-course-app`) and quotes `debug&cleanup/...` paths when needed.
- Commands and URLs match reality (Next on 3001; only mention 3000/5173 for Vite prototypes with explicit instructions to start them).
- Tailwind guidance matches Tailwind v4 + PostCSS (no `@tailwind` directives; no Tailwind CLI steps unless made optional with prerequisites).
- Preflight is treated as a deliberate, risky toggle with rollback and baseline validation.
- Dark mode guidance matches `data-theme` (not `.dark`) and warns about Tailwind dark variant wiring.
- Visual validation plan does not require network by default; automated diffing is “optional with network approval.”
- No references to nonexistent folders/apps/design ideas.

Cross-file consistency:
- Phase numbers and naming match the overview plan.
- Each phase’s “next phase” references the correct subsequent runbook (no mention of `apps/web` unless moved to an appendix).
- Shared invariants (ports, tokens, theme, baseline directory) are consistent across all phases.

## Process you must follow
1) Read `planning/migrate-nextjs-to-vite-composable.md` first; treat it as canonical.
2) For each runbook, do an “assumption audit” section internally:
   - tooling assumptions (Tailwind version, CLI vs PostCSS, test runner, screenshot tooling)
   - path assumptions (repo root, directories)
   - network assumptions
3) Rewrite the runbook with:
   - clear prerequisites
   - explicit tasks with file paths
   - verification steps after each risky change (`npm run build`, route smoke checks)
   - rollback steps for risky changes (especially Preflight/token work)
4) After rewriting all runbooks, run a “drift scan” (search) and ensure the docs are clean of banned patterns:
   - `@tailwind base`
   - `npx tailwindcss`
   - `apps/web`
   - `pnpm create vite`
   - `http://localhost:3000` (except where explicitly describing Vite prototypes and how to launch them)
   - `step-by-step/visual-validation`
   - `google-academic-catalog-browser`
   - `cd /Users/.../web_dev_lc` (missing `-solve-incompatibility`)

## Output requirements
- Update the markdown files in place (same filenames/locations).
- Keep the plans very specific and detailed, but avoid fake/placeholder commands that don’t work in this repo.
- If a step requires network access, mark it explicitly “Requires network approval” and provide a fallback.

At the end, provide a short summary report listing:
- Which files were updated
- The top 10 drifts fixed (file + one-line description)
- Any remaining “optional” items requiring network approval
