# 🔍 Code Space Inconsistencies Report

**Date:** December 26, 2025 (Updated & Verified)
**Repository:** web_dev_lc
**Purpose:** Comprehensive documentation of all inconsistencies, duplications, and organizational issues

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

## 🚨 CRITICAL ISSUES

### Issue #1: Port Conflicts - Two Apps Claiming Same Port

**Severity:** HIGH - Prevents simultaneous operation of landing_page and enhanced_course_browser

| Project | Config File | Port Claimed | Status |
|---------|-------------|--------------|--------|
| `landing_page/` | package.json:7 | 3002 | ✓ Correct for current flow |
| `enhanced_course_browser/` | package.json:6 | 3002 | ✗ **CONFLICTS with landing_page** |
| `web/` | package.json:6 | 3001 | ✓ Correct |
| `login_page/` | package.json (default) | 3000 | ✓ Correct |

**Evidence:**
- `landing_page/package.json`: `"dev:client": "vite --host --port 3002"`
- `enhanced_course_browser/package.json`: `"dev": "next dev -p 3002"`

**Impact:** Cannot run `landing_page/` and `enhanced_course_browser/` simultaneously. `start-all.sh` works around this by ignoring `enhanced_course_browser`.

**Fix Required:**
1. Delete `enhanced_course_browser/` entirely (it is redundant with `web/`).

---

### Issue #2: Broken Navigation Chain in start-all.sh

**Severity:** MEDIUM - Navigation flow works but relies on fragile redirects

**Expected Flow (per start-all.sh):**
```
Landing (3002) → Login (3000) → Course Browser (3001/onboarding)
```

**Actual Flow (Verified):**
```
Landing (3002) → click "Get Started" → /login route → redirect to :3000 → Login UI → click button → :3001/onboarding
```

**Evidence:**
- `landing_page/src/pages/Login.tsx`: `window.location.href = 'http://localhost:3000';`
- `login_page/src/app/login/page.tsx`: `window.location.href = COURSE_BROWSER_URL;` (where URL is :3001/onboarding)

**Impact:** User experiences multiple redirects before reaching the actual application.

**Fix Required:** Consolidate into one app so navigation is internal (client-side routing) rather than cross-port redirects.

---

## 🔄 DUPLICATE PAGES/ROUTES

### Issue #3: Two Different Login Pages

**Severity:** MEDIUM - Redirect stub adds unnecessary complexity

| Location | Type | Purpose | Status |
|----------|------|---------|--------|
| `landing_page/src/pages/Login.tsx` | React stub | Just redirects to :3000 | **DEAD CODE / STUB** |
| `login_page/src/app/login/page.tsx` | Next.js | Shows full login UI | **ACTUALLY USED** |

**Evidence:**
- `landing_page`'s login is just a spinner that redirects.
- `login_page` is the actual application.

**Fix Required:** Migrate `login_page/src/app/login/page.tsx` into `web/src/app/login/page.tsx` and delete the `login_page` app.

---

### Issue #4: Four Different Course Browsers

**Severity:** CRITICAL - Same functionality implemented 4 times with different bugs

| Location | Lines | Features | Status |
|----------|-------|----------|--------|
| `web/src/app/page.tsx` | 370 | Full browser, simple list plan | **FUNCTIONAL BUT HIDDEN** (at localhost:3001/) |
| `web/src/app/browser/page.tsx` | 550 | Drawer UI, canonical depts | **ACTUALLY USED** (at localhost:3001/browser) |
| `web/src/app/planner/page.tsx` | 490+ | **Browser + Planner Logic Mixed** | **USED** (at localhost:3001/planner) |
| `enhanced_course_browser/` | 480 | Redundant copy | **REDUNDANT** |
| `landing_page/src/pages/CourseBrowser.tsx` | 18 | Redirect stub | **DEAD CODE** |

**Evidence of Duplication:**
All 3 "real" browsers (`web/page.tsx`, `web/browser/page.tsx`, `web/planner/page.tsx`) contain identical copies of:
1. `fetchFirst<T>()`
2. `normalizeTerm()`
3. `deriveTags()`
4. `flattenDatabase()` (complex parsing logic ~100 lines)
5. `canonicalizeDepartment()`

**Impact:**
- Any change to parsing logic (e.g., handling a new field) must be made in 3 separate files.
- `planner/page.tsx` re-implements the *entire* course browser (search, filtering, listing) just to allow drag-and-drop, instead of importing a component.

**Fix Required:**
1. Extract shared logic to `web/src/lib/courseUtils.ts`.
2. Extract the Course Browser UI to a shared component `web/src/components/CourseBrowser.tsx`.
3. Make `planner` import the browser component instead of re-implementing it.

---

### Issue #5: Two Root Pages with Different Purposes

**Severity:** HIGH - Confusing architecture

| Location | Type | Purpose |
|----------|------|---------|
| `landing_page/src/pages/Home.tsx` | React/Vite | Marketing landing page ("A new way to see...") |
| `web/src/app/page.tsx` | Next.js | Full course browser application |

**Impact:**
- `localhost:3002` (Landing) shows the marketing page.
- `localhost:3001` (App) shows a course browser at the root, which duplicates `/browser`.

**Fix Required:**
- Move `landing_page/src/pages/Home.tsx` content to `web/src/app/page.tsx`.
- Move the current `web/src/app/page.tsx` logic to `web/src/components` (or delete if `browser/page.tsx` is superior).

---

## 🗃️ STATE MANAGEMENT INCONSISTENCIES

### Issue #9: Fragmented LocalStorage Keys

**Severity:** MEDIUM - Data not shared between components

| Component | Key | Data Structure |
|-----------|-----|----------------|
| `web/browser` & `web/page` | `plan` | `PlanItem[]` (Simple list) |
| `web/planner` | `plannerV1` | `Record<YearKey, PlannerSlot[]>` (Grid) |
| `web/planner` | `plan` | **Also loads this!** (Confusing hybrid state) |
| `enhanced_course_browser` | `academicPlan` | `Record<string, PlanItem[]>` (Term list) |

**Impact:**
- If a user adds a course in `/browser` (saved to `plan`), it might appear in `/planner` (because it loads `plan`), but changes in `/planner` (saved to `plannerV1`) will **NOT** reflect back to `/browser`.
- The `enhanced_course_browser` uses a totally different key (`academicPlan`), so nothing is shared with it.

**Fix Required:**
- Standardize on a single "Source of Truth" context or hook.
- If we keep both a "simple list" and a "grid", they should be synchronized or clearly distinct.
- Ideally, `web` should use a React Context (`PlanContext`) that syncs to one LocalStorage key.

---

## 📁 FOLDER STRUCTURE ISSUES

### Issue #11: Non-Descriptive Folder Names

**Severity:** MEDIUM

| Current Name | Actual Contents | Recommended Name |
|--------------|-----------------|------------------|
| `landing_page/` | Vite App (Marketing) | *Delete (migrate to web)* |
| `login_page/` | Next.js App (Login) | *Delete (migrate to web)* |
| `enhanced_course_browser/` | Next.js App (Duplicate) | *Delete* |
| `web/` | Main Next.js App | `loomis-course-app/` |
| `web app/` | Static HTML (Legacy) | *Delete* |
| `prep_data/` | Data & Assets | `course-data/` |

---

## 📋 RECOMMENDED CLEANUP PLAN

### Phase 1: Clean Trash (Immediate)
1. Delete `web app/` (Legacy HTML).
2. Delete `enhanced_course_browser/` (Redundant).
3. Delete `potential_idea_*` files.
4. Delete `landing_page/src/pages/CourseBrowser.tsx` (Dead redirect).
5. Delete `landing_page/src/pages/Login.tsx` (Dead redirect).

### Phase 2: Unify Codebase (The "Big Merge")
1. **Create `web/src/lib/courseUtils.ts`**: Move `fetchFirst`, `flattenDatabase`, `deriveTags`, `normalizeTerm` here.
2. **Migrate Landing Page**: Move `landing_page/src/pages/Home.tsx` -> `web/src/app/page.tsx`.
3. **Migrate Login Page**: Move `login_page/src/app/login/page.tsx` -> `web/src/app/login/page.tsx`.
4. **Refactor Browser**: Update `web/src/app/browser/page.tsx` to use `courseUtils`.
5. **Refactor Planner**: Update `web/src/app/planner/page.tsx` to use `courseUtils` and potentially share the course list UI component.

### Phase 3: Final Polish
1. Delete `landing_page/` and `login_page/` folders.
2. Rename `web/` to `loomis-course-app`.
3. Update `start-all.sh` to just run `npm run dev` in the single unified app.
4. Update `README.md`.

---

## ✅ Verification Status
**Last Verified:** December 26, 2025

- [x] Port conflicts verified (`landing` vs `enhanced`).
- [x] Redirect chain verified (`3002` -> `3000` -> `3001`).
- [x] Duplicate login pages verified (1 stub, 1 real).
- [x] Duplicate browser logic verified (identical code in 3+ files).
- [x] State management fragmentation verified (`plan` vs `plannerV1` vs `academicPlan`).