# 🔍 Code Space Inconsistencies Report

**Date:** December 26, 2025 (Phase 1 Complete)
**Repository:** web_dev_lc
**Purpose:** Comprehensive documentation of all inconsistencies, duplications, and organizational issues
**Status:** Phase 1 (Trash Cleanup) COMPLETED. Ready for Phase 2 (Unify Codebase).

---

## 📊 Executive Summary

This codespace contains **4 separate web applications** that collectively implement a course registration and planning system for Loomis Chaffee. There is significant duplication, redundancy, and architectural confusion:

- **2 different login pages** (one redirect stub, one actual UI)
- **4 different course browsers** (nearly identical code copied 4 times)
- **Port conflict** between `landing_page/` and `enhanced_course_browser/` (both claim 3002)
- **Dead redirect stub code** that serves no purpose
- **Confusing folder structure** with non-descriptive names
- **Inconsistent state management** across components (`plan`, `plannerV1`, `academicPlan`)
- **Orphan/backup files** cluttering the codebase

**Recommendation:** Consolidate into a single, unified Next.js application (`web/`) by migrating unique features from other apps and deleting the redundant ones.

---

## 🔍 DETAILED PAGE VERSIONS AUDIT

Grouped by the core application pages, identifying all duplicate, outdated, or redundant versions found in the codebase.

### 1. Landing Page Versions (Marketing / Entry Point)
| File Path | Type | Status | Notes |
|-----------|------|--------|-------|
| `landing_page/src/pages/Home.tsx` | React/Vite | **Golden Copy** | The actual marketing page with Hero image & "Get Started". |
| `web_app/index.html` | Static HTML | **Legacy** | Old static site version. To be deleted. |
| `web/src/app/page.tsx` | Next.js Page | **Occupied by Wrong Component** | Currently renders an *Outdated Course Browser*. Should be replaced by the content of `landing_page/src/pages/Home.tsx`. |

### 2. Login Page Versions
| File Path | Type | Status | Notes |
|-----------|------|--------|-------|
| `login_page/src/app/login/page.tsx` | Next.js Page | **Golden Copy** | The full login UI (Crest, "Welcome Back", Forms). |
| `login_page/src/app/page.tsx` | Next.js Redirect | **Redirect** | Just redirects `/` to `/login`. |
| `landing_page/src/pages/Login.tsx` | React Stub | **Stub** | Fake page used to redirect users to port 3000. |

### 3. Course Browser Versions (Catalog & Selection)
| File Path | Type | Status | Notes |
|-----------|------|--------|-------|
| `web/src/app/browser/page.tsx` | Next.js Page | **Golden Copy** | The superior version with "Drawer UI", Filters, and Canonical Departments. |
| `web/src/app/page.tsx` | Next.js Page | **Outdated** | Older version of the browser sitting at the root URL. |
| `web/src/app/planner/page.tsx` | Next.js Page | **Hybrid / Mixed** | Re-implements browser logic (search/filter) inside the Planner view. |
| `landing_page/src/pages/CourseBrowser.tsx` | React Stub | **Stub** | Fake page used to redirect users to port 3001. |
| `web_app/course.html` | Static HTML | **Legacy** | Old static site version. |
| `enhanced_course_browser/` | Next.js App | **Deleted** | Redundant copy removed in Phase 1. |

---

## 🚨 CRITICAL ARCHITECTURE ISSUES

### Issue #2: Broken Navigation Chain & Project Pollution
**Severity:** MEDIUM

1.  **Fragile Redirects:** The current flow relies on hardcoded full-URL redirects between ports (e.g., `window.location.href = 'http://localhost:3000'`). This is slow and breaks if ports change.
2.  **Project Pollution:** The `landing_page` project contains "stub" pages (`Login.tsx`, `CourseBrowser.tsx`) whose only purpose is to redirect to *other* applications. This violates the Single Responsibility Principle and confuses the folder structure.

**Fix:** Eliminate the stubs. Build a single app where `/login` is a real route, not a redirect to a different server.

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
| `web_app/` | Static HTML | **Trash (Legacy)** |
| `prep_data/` | Data & Assets | **Keep (Rename to `course-data`)** |

---

## 📋 RECOMMENDED CLEANUP PLAN

### Phase 1: Clean Trash (COMPLETED Dec 26, 2025)
1. ~~Delete `enhanced_course_browser/`~~ - Already deleted via prior git commit.
2. ~~Delete `web_app/`~~ - Legacy static HTML deleted.
3. ~~Delete `landing_page/src/pages/CourseBrowser.tsx~~ - Stub removed.
4. ~~Delete `landing_page/src/pages/Login.tsx~~ - Stub removed.
5. ~~Delete files inside `design_ideas/`~~ - Mockup files removed.

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

---

## 🔄 Revision Process

**Strategy:**
We are transforming a distributed, multi-app system into a centralized Monolith to reduce complexity.

**Steps:**
1. **Audit:** Identify all redundant files and "stub" pages (Completed Dec 26).
2. **Purge:** Remove the "trash" (Phase 1) - **COMPLETED Dec 26**.
3. **Centralize Logic:** Create shared utility libraries before moving UI components.
4. **Migrate UI:** Move the "Golden Copy" of each page (Home, Login, Browser) to the unified `web` app.
5. **Wiring:** Update internal links (e.g., `<Link href="/login">` instead of `window.location.href="http://localhost:3000"`).
6. **Verify:** Test the full flow in the unified app.
7. **Cleanup:** Delete the empty shells of the old apps.

---

## ✅ VERIFICATION LOG (December 26, 2025)

All claims in this report have been verified against the current codebase state:

| Claim Category | Finding | Status |
|----------------|---------|--------|
| `enhanced_course_browser/` deletion | Confirmed via git commit `1b402847` | ✅ Accurate |
| 3 course browsers in `web/` | Found at `/`, `/browser`, `/planner` | ✅ Accurate |
| Stub page redirects | `Login.tsx`→`:3000`, `CourseBrowser.tsx`→`:3001/onboarding` | ✅ Accurate |
| Port configuration | `web/`=3001, `landing_page/`=3002, `login_page/`=3000 | ✅ Accurate |
| Fragmented localStorage | `'plan'` in page/browser, `'plan'`+`'plannerV1'` in planner | ✅ Accurate |
| Code duplication | Identical utility functions duplicated across files | ✅ Accurate |
| `web_app/` legacy static | Exists with index.html, course.html | ✅ Deleted (Dec 26) |
| `landing_page/` stub pages | CourseBrowser.tsx, Login.tsx stubs | ✅ Deleted (Dec 26) |
| `login_page/` | Exists with login UI | ⚠️ Phase 2 migration |
| `potential_idea_*` files | Staged for deletion in git | ✅ Deleted (Dec 26) |
