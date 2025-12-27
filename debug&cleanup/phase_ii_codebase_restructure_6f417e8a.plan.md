---
name: Phase II Codebase Restructure
overview: Consolidate the repo into a single Next.js app (`web/`) with a clean route structure and a standard user flow. Browser and Planner remain separate routes/features. Extract shared course logic/state, enforce strict typing, and organize data/assets/docs.
todos:
  - id: choose-canonical-pages
    content: Pick canonical implementations for Landing/Login/Browser from the duplicate list.
    status: completed
  - id: route-groups-layouts
    content: Refactor `web/src/app` into route groups (`(marketing)` vs `(app)`) with separate layouts to isolate styles and headers.
    status: completed
  - id: strict-typing
    content: Create `web/src/types/course.ts` with Zod/TS definitions to standardize data shapes before migration.
    status: completed
  - id: migrate-landing-login
    content: Port landing + login UIs into `web/`, merging Tailwind configs and namespacing assets (`public/landing/`) to avoid collisions.
    status: completed
  - id: static-assets-catalog
    content: Standardize `web/public/` with a single canonical `catalog.json` and organized image subfolders.
    status: completed
  - id: extract-course-utils
    content: Create `web/src/lib/courseUtils.ts` using the new strict types and refactor Browser/Planner to import shared logic.
    status: completed
  - id: decouple-browser-planner
    content: Remove duplicated Course Browser UI inside the Planner page; implement `picker` pattern (deep-link to Browser) for simpler code.
    status: completed
  - id: unify-plan-state
    content: Define one persisted data model (`plannerV2`) used by both pages and implement a migration strategy.
    status: completed
  - id: cleanup-and-verify
    content: Verify end-to-end flow, ensure no style bleeding, and remove redundant apps.
    status: completed
---

# Phase II: Unify + Restructure `web_dev_lc`

## Goals
- **One app, one URL base**: Eliminate cross-port redirects and duplicated page implementations.
- **Standard user journey**: `/` (Landing) → `/login` → `/onboarding` → `/browser` → `/planner`.
- **Browser/Planner Separation**: 
  - **Browser**: Search, filter, "Shopping List".
  - **Planner**: Grid view, arrange courses from list.
- **Single Source of Truth**: Unified state management and strict data typing.
- **Clean Repo Layout**: Separate app code, data, and docs.

## Canonical Pages ("Keepers")
- **Landing:** `landing_page/src/pages/Home.tsx` (Migrate to `web/src/app/(marketing)/page.tsx`)
- **Login:** `login_page/src/app/login/page.tsx` (Migrate to `web/src/app/(marketing)/login/page.tsx`)
- **Browser:** `web/src/app/browser/page.tsx` (Move to `web/src/app/(app)/browser/page.tsx`)
- **Planner:** `web/src/app/planner/page.tsx` (Refactor to `web/src/app/(app)/planner/page.tsx` - Planner Grid ONLY)

## Phase II Implementation Outline

### A) Restructure `web/` Layouts (Route Groups)
- **Goal:** Isolate Marketing UI (Landing/Login) from App UI (Browser/Planner) to prevent style bleeding and header conflicts.
- **Structure:**
  - `web/src/app/layout.tsx`: Base HTML/Body + `globals.css`.
  - `web/src/app/(marketing)/layout.tsx`: Landing-specific layout.
  - `web/src/app/(app)/layout.tsx`: App Shell (Header, Nav, ThemeToggle).
  - `web/src/app/(app)/browser/`: Browser page.
  - `web/src/app/(app)/planner/`: Planner page (Grid only).

### B) Enforce Strict Typing (Pre-requisite)
- **Action:** Create `web/src/types/course.ts`.
- **Content:** Define strict TypeScript interfaces (and optional Zod schemas) for `Course`, `PlanItem`, and `Catalog`.
- **Why:** Prevents "termLabel" vs "term" bugs during the migration of logic from 3 different sources.

### C) Migrate & Merge UI
- **Landing & Login:**
  - Port React/Vite components to Next.js App Router.
  - **Critical:** Merge `tailwind.config.js` carefully. If conflicts arise, use CSS Modules for the Landing page or prefix custom classes.
- **Assets:**
  - Create `web/public/landing/` and `web/public/login/`.
  - Move images into these namespaces to prevent filename collisions (e.g., generic `hero.jpg`).

### D) Extract Shared Logic (`courseUtils`)
- Create `web/src/lib/courseUtils.ts`.
- Centralize `fetchCatalog`, `flattenDatabase`, `deriveTags`, and `canonicalizeDepartment`.
- Update all pages to import from this single source.

### E) Decouple Planner from Browser
- **Refactor Planner:** Remove the embedded side-drawer Course Browser.
- **New Flow:**
  - User clicks a slot in Planner.
  - **Deep Link:** Navigates to `/browser?mode=picker&year=Freshman&slot=0&returnTo=/planner`.
  - **Browser:** Renders in "Picker Mode" (showing "Select" instead of "Add").
  - **Action:** Selection updates shared state and redirects back to `returnTo`.
- **Note:** This trade-off (navigation vs. modal) is intentional for Phase II to reduce code duplication. A modal can be reintroduced in Phase III using shared components.

### F) Unify State Management
- **New Key:** `plannerV2` (replaces `plan` and `plannerV1`).
- **Structure:** `{ selectedCourses: Course[], grid: PlannerGrid }`.
- **Migration:** On app load, check for legacy keys, convert to new structure, and save to `plannerV2`.

## Execution Strategy (Atomic Commits)
1.  **The Move:** Establish Route Groups and migrate files/assets first. Get pages rendering at new URLs (even if logic is mock/broken).
2.  **The Type:** Define `src/types/course.ts` to lock down the data shape.
3.  **The Refactor:** Implement `courseUtils` and State Manager. Wire pages to these shared utilities one by one.
4. Committ regularly during the execution. Do not wait for one huge commit at the end.

## Risks & Mitigations
- **CSS Conflicts:** `landing_page` styles might break `web` layout.
  - *Mitigation:* Use Route Groups layouts to scope styles.
- **UX Friction:** "Picker" flow is heavier than a sidebar.
  - *Mitigation:* Accept for Phase II to ensure architecture is clean. Upgrade to a shared "Mini-Browser" component later.
- **Asset Collisions:** Overwriting `public/logo.svg`.
  - *Mitigation:* Namespace all migrated assets into subfolders.