# 🔍 Code Space Inconsistencies Report

**Date:** December 26, 2025 (Phase 2 In Progress)
**Repository:** web_dev_lc
**Purpose:** Comprehensive documentation of all inconsistencies, duplications, and organizational issues
**Status:** Phase 2 (Unify Codebase) IN PROGRESS.

---

## 📊 Executive Summary

This codespace contains **3 separate web applications** that collectively implement a course registration and planning system for Loomis Chaffee. There is significant duplication, redundancy, and architectural confusion:

- **Separate Apps:** We are running 3 servers for what should be 1 app (`web`, `landing_page`, `login_page`).
- **Multiple course browsers** (logic duplicated across pages in `web`).
- **Port fragmentation** (`landing_page/` on 3002, `web/` on 3001, `login_page/` on 3000).
- **Confusing folder structure** with non-descriptive names.
- **Inconsistent state management** across components (`plan`, `plannerV1`, `academicPlan`).

**Recommendation:** Consolidate into a single, unified Next.js application (`web/`) by migrating unique features from other apps and deleting the redundant ones.

---

## 🔍 DETAILED PAGE VERSIONS AUDIT

Grouped by the core application pages, identifying all duplicate, outdated, or redundant versions found in the codebase.

### 1. Landing Page Versions (Marketing / Entry Point)
| File Path | Type | Status | Notes |
|-----------|------|--------|-------|
| `landing_page/src/pages/Home.tsx` | React/Vite | **Golden Copy** | The actual marketing page with Hero image & "Get Started". |
| `web/src/app/page.tsx` | Next.js Page | **Occupied by Wrong Component** | Currently renders an *Outdated Course Browser*. Should be replaced by the content of `landing_page/src/pages/Home.tsx`. |

### 2. Login Page Versions
| File Path | Type | Status | Notes |
|-----------|------|--------|-------|
| `login_page/src/app/login/page.tsx` | Next.js Page | **Golden Copy** | The full login UI (Crest, "Welcome Back", Forms). |
| `login_page/src/app/page.tsx` | Next.js Redirect | **Redirect** | Just redirects `/` to `/login`. |

### 3. Course Browser Versions (Catalog & Selection)
| File Path | Type | Status | Notes |
|-----------|------|--------|-------|
| `web/src/app/browser/page.tsx` | Next.js Page | **Golden Copy** | The superior version with "Drawer UI", Filters, and Canonical Departments. |
| `web/src/app/page.tsx` | Next.js Page | **Outdated** | Older version of the browser sitting at the root URL. |
| `web/src/app/planner/page.tsx` | Next.js Page | **Hybrid / Mixed** | Re-implements browser logic (search/filter) inside the Planner view. |

---

## 🚨 CRITICAL ARCHITECTURE ISSUES

### Issue #2: Broken Navigation Chain & Port Fragmentation
**Severity:** MEDIUM

1.  **Fragile Redirects:** The current flow relies on hardcoded full-URL redirects between ports (e.g., `window.location.href = 'http://localhost:3000'`). This is slow and breaks if ports change.
2.  **Separate Apps:** We are running 3 servers for what should be 1 app.

**Fix:** Build a single app where `/login` is a real route, not a redirect to a different server.

---

## 🗃️ STATE MANAGEMENT INCONSISTENCIES

### Issue #9: Fragmented LocalStorage Keys
**Severity:** MEDIUM

| Component | Key | Data Structure |
|-----------|-----|----------------|
| `web/browser` & `web/page` | `plan` | `PlanItem[]` (Simple list) |
| `web/planner` | `plannerV1` | `Record<YearKey, PlannerSlot[]>` (Grid) |
| `web/planner` | `plan` | **Also loads this!** (Confusing hybrid state) |

**Impact:** Data does not sync reliably between the "Browser" (list view) and "Planner" (grid view).

---

## 📁 FOLDER STRUCTURE ISSUES

### Issue #11: Non-Descriptive Folder Names
**Severity:** MEDIUM

| Current Name | Actual Contents | Status |
|--------------|-----------------|--------|
| `landing_page/` | Vite App (Marketing) | **Migrating to `web/`** |
| `login_page/` | Next.js App (Login) | **Migrating to `web/`** |
| `web/` | Main Next.js App | **The Target Monolith** |
| `prep_data/` | Data & Assets | **Keep (Rename to `course-data`)** |

---

## 📋 RECOMMENDED CLEANUP PLAN

### Phase 1: Clean Trash (COMPLETED)
- `enhanced_course_browser/` deleted.
- `web_app/` legacy static HTML deleted.
- Stub pages in `landing_page` deleted.
- `design_ideas/` deleted.

### Phase 2: Unify Codebase (The "Big Merge")
1. **Create `web/src/lib/courseUtils.ts`**: Move shared logic (`fetchFirst`, `flattenDatabase`, `deriveTags`, `normalizeTerm`) here.
2. **Migrate Landing Page**: Move content from `landing_page/src/pages/Home.tsx` to overwrite `web/src/app/page.tsx` (replacing the outdated browser).
3. **Migrate Login Page**: Move content from `login_page/src/app/login/page.tsx` to `web/src/app/login/page.tsx`.
4. **Refactor Browser**: Update `web/src/app/browser/page.tsx` to use `courseUtils`.
5. **Refactor Planner**: Update `web/src/app/planner/page.tsx` to use `courseUtils`.

### Phase 3: Final Polish
1. Delete `landing_page/` and `login_page/` folders.
2. Rename `web/` to `loomis-course-app`.
3. Update `start-all.sh`.

---

## 🧭 Target User Flow (Accurate Sequence)

**Goal:** Establish a single, linear, and intuitive user journey within the unified application.

**1. Landing Page (Root)**
- **URL:** `localhost:3001/`
- **Source:** Originally `landing_page/src/pages/Home.tsx`
- **Purpose:** Marketing, First Impressions, "Get Started" CTA.
- **Action:** User clicks "Get Started" -> Navigates to `/login`.

**2. Login Page**
- **URL:** `localhost:3001/login`
- **Source:** Originally `login_page/src/app/login/page.tsx`
- **Purpose:** Authentication (or mock auth for now), User Identity.
- **Action:** User logs in/signs up -> Navigates to `/browser` (or `/onboarding` if first time).

**3. Course Browser (Main App)**
- **URL:** `localhost:3001/browser`
- **Source:** `web/src/app/browser/page.tsx` (The "Superior" browser with Drawer/Filters).
- **Purpose:** Browsing catalog, filtering courses, adding to simple plan.
- **Action:** User selects courses -> Can switch to `/planner` for grid view.
