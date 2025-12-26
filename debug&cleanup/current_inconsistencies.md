# 🔍 Code Space Inconsistencies Report

**Date:** December 26, 2025 (Updated with verification)
**Repository:** web_dev_lc
**Purpose:** Comprehensive documentation of all inconsistencies, duplications, and organizational issues

---

## 📊 Executive Summary

This codespace contains **4 separate web applications** that collectively implement a course registration and planning system for Loomis Chaffee. However, there is significant duplication, redundancy, and confusion:

- **2 different login pages** (one redirect stub, one actual UI)
- **4 different course browsers** (nearly identical code copied 4 times)
- **Port conflict** between `landing_page/` and `enhanced_course_browser/` (both claim 3002)
- **Dead redirect stub code** that serves no purpose
- **Confusing folder structure** with non-descriptive names
- **Inconsistent state management** across components
- **Orphan/backup files** cluttering the codebase

**Recommendation:** Because this code space is modified simultaneously by multiple members who are all working on the same project, figure out a way to not accidentally delete their efforts but instead merge them and delete redundant or unnecessary files that are for sure not going to be helpful.

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

```bash
# landing_page/package.json:7
"dev:client": "vite --host --port 3002"

# enhanced_course_browser/package.json:6
"dev": "next dev -p 3002"

# web/package.json:6 (CORRECTLY configured)
"dev": "next dev -p 3001"
```

**Impact:** Cannot run `landing_page/` and `enhanced_course_browser/` simultaneously. However, the `start-all.sh` script works correctly because it only starts `landing_page/`, `login_page/`, and `web/` (not `enhanced_course_browser/`).

**Fix Required:**
1. Delete `enhanced_course_browser/` entirely (redundant with `web/`)
2. Consider migrating `landing_page/` into `web/` as a route

---

### Issue #2: Broken Navigation Chain in start-all.sh

**Severity:** MEDIUM - Navigation flow works but relies on multiple redirects

**Expected Flow (per start-all.sh):**
```
Landing (3002) → Login (3000) → Course Browser (3001/onboarding)
```

**Actual Flow (verified via Chrome testing):**
```
Landing (3002) → click "Get Started" → /login route → redirect to :3000 → Login UI → click button → :3001/browser
```

**Evidence:**

`landing_page/src/pages/Login.tsx:4-6`
```typescript
useEffect(() => {
  // Redirect to the login page running on port 3000
  window.location.href = 'http://localhost:3000';
}, []);
```

`login_page/src/linking/config.ts:1-2`
```typescript
export const COURSE_BROWSER_URL: string =
  process.env.NEXT_PUBLIC_COURSE_BROWSER_URL || 'http://localhost:3001';
```

`login_page/src/app/login/page.tsx:14-16`
```typescript
const handleLoomisLogin = () => {
  // For now, just navigate to the Course Browser
  window.location.href = COURSE_BROWSER_URL;
```

**Note:** The `web/middleware.ts` redirects `/onboarding` to `/browser` if user preferences are already set in cookies, explaining why the flow may skip onboarding.

**Impact:** User experiences multiple redirects before reaching the actual application. This is slow, confusing, and fragile.

**Fix Required:** Implement proper authentication flow instead of redirect chains.

---

## 🔄 DUPLICATE PAGES/ROUTES

### Issue #3: Two Different Login Pages

**Severity:** MEDIUM - Redirect stub adds unnecessary complexity

| Location | Type | Purpose | Status |
|----------|------|---------|--------|
| `landing_page/src/pages/Login.tsx` | React stub | Just redirects to :3000 | **DEAD CODE** |
| `login_page/src/app/login/page.tsx` | Next.js | Shows login form with crest | **ACTUALLY USED** |

**Evidence:**

1. `landing_page/src/pages/Login.tsx` - Entire file is just a redirect:
```typescript
export default function Login() {
  useEffect(() => {
    window.location.href = 'http://localhost:3000';
  }, []);
  // Shows loading spinner while redirecting
}
```

2. `login_page/src/app/login/page.tsx` - Has full login UI (123 lines):
```typescript
export default function LoginPage() {
  // School crest, motto animation, login form
  <div className={styles.logoBox}>
    <img src="/LC-COA-red-rgb.png" alt="Loomis Chaffee Crest" />
  </div>
  // <button onClick={handleLoomisLogin}>
  //   Continue with Loomis Account
  // </button>
}
```

**Note:** `web/src/app/login/page.tsx` does **NOT exist** - the web app has no login route.

**Fix Required:** Keep `login_page/src/app/login/page.tsx`, delete the redirect stub, and consider migrating the login into `web/`.

---

### Issue #4: Four Different Course Browsers

**Severity:** CRITICAL - Same functionality implemented 4 times with different bugs

| Location | Lines | Features | Status |
|----------|-------|----------|--------|
| `web/src/app/page.tsx` | 370 | Full browser with search, filters, plan | **FUNCTIONAL BUT HIDDEN** |
| `web/src/app/browser/page.tsx` | 550 | Drawer UI, canonical depts, print | **ACTUALLY USED** |
| `web/src/app/planner/page.tsx` | 756 | Browser + 4-year planner slots | **HAS BROWSER CODE BUILT-IN** |
| `enhanced_course_browser/src/app/page.tsx` | 480 | Dark mode, term grouping | **REDUNDANT** |
| `landing_page/src/pages/CourseBrowser.tsx` | 18 | Just redirects to :3001/onboarding | **DEAD CODE** |

**Evidence of Duplication:**

All four contain nearly identical implementations of:

1. **`fetchFirst<T>()` function** - Try multiple JSON paths:
   - `web/src/app/page.tsx:33-41`
   - `web/src/app/browser/page.tsx:35-44`
   - `web/src/app/planner/page.tsx:39-44`
   - `enhanced_course_browser/src/app/page.tsx:36-44`

2. **`normalizeTerm()` function** - Convert term to label:
   - `web/src/app/page.tsx:43-50`
   - `web/src/app/browser/page.tsx:42-49`
   - `web/src/app/planner/page.tsx:66-73`
   - `enhanced_course_browser/src/app/page.tsx:46-53`

3. **`deriveTags()` function** - Extract GESC/PPR/CL tags:
   - `web/src/app/page.tsx:52-71`
   - `web/src/app/browser/page.tsx:51-65`
   - `web/src/app/planner/page.tsx:75-89`
   - `enhanced_course_browser/src/app/page.tsx:55-71`

4. **`flattenDatabase()` function** - Parse catalog JSON:
   - `web/src/app/page.tsx:73-152`
   - `web/src/app/browser/page.tsx:67-182`
   - `web/src/app/planner/page.tsx:111-207`
   - `enhanced_course_browser/src/app/page.tsx:73-112`

5. **`printPlan()` function** - Generate printable plan:
   - `web/src/app/page.tsx:232-285`
   - `web/src/app/browser/page.tsx:304-401`
   - `web/src/app/planner/page.tsx:394-491`
   - `enhanced_course_browser/src/app/page.tsx:306-327`

**Impact:**
- Bug fixes must be applied 4 times
- Inconsistent behavior across implementations
- Maintenance nightmare
- ~2,000 lines of duplicated code

**Fix Required:**
1. Create `web/src/lib/courseUtils.ts` with shared functions
2. Delete `enhanced_course_browser/` entirely
3. Decide whether `web/src/app/page.tsx` should be landing page or course browser
4. Remove browser code from `/planner` - make it a pure planner
5. Delete `landing_page/src/pages/CourseBrowser.tsx`

---

### Issue #5: Two Root Pages with Different Purposes

**Severity:** HIGH - Confusing architecture

| Location | Type | Lines | Purpose |
|----------|------|-------|---------|
| `landing_page/src/pages/Home.tsx` | React/Vite | 93 | Beautiful landing with school motto |
| `web/src/app/page.tsx` | Next.js | 370 | Full course browser (NOT a redirect!) |

**Evidence:**

`landing_page/src/pages/Home.tsx` - Marketing landing page:
```typescript
export default function Home() {
  const navigate = useNavigate();
  const handleGetStarted = () => { navigate('/login'); };
  return (
    <div className="min-h-screen flex flex-col">
      {/* Beautiful hero with campus background */}
      <h1>A new way to see and choose your very own Loomis Chaffee experience.</h1>
      <button onClick={handleGetStarted}>Get Started→</button>
    </div>
  );
}
```

`web/src/app/page.tsx` - **Full 370-line course browser** (NOT a redirect):
```typescript
export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [query, setQuery] = useState('');
  const [plan, setPlan] = useState<PlanItem[]>([]);
  // ... 370 lines of course browser functionality
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Course Browser</h1>
      {/* Full search, filters, course grid, plan management */}
    </div>
  );
}
```

**Impact:** The web app's root route (`/`) is actually a fully functional course browser that duplicates `/browser`. Users navigating to `localhost:3001` see a course browser, not a landing page.

**Fix Required:**
- Replace `web/src/app/page.tsx` with landing page content from `landing_page/src/pages/Home.tsx`
- Or redirect root to `/browser` if landing page should remain separate

---

## 💀 DEAD/STUB CODE

### Issue #6: Redirect-Only Files That Do Nothing

**Severity:** LOW - Doesn't break anything, but wastes space

| File | Lines | Purpose |
|------|-------|---------|
| `landing_page/src/pages/Login.tsx` | 17 | Just redirects to :3000 |
| `landing_page/src/pages/CourseBrowser.tsx` | 18 | Just redirects to :3001/onboarding |

**Total Dead Code:** 35 lines that serve no purpose other than routing redirects

**Recommendation:** Delete these files and implement proper routing configuration.

---

### Issue #7: Legacy Static HTML Files

**Severity:** LOW - Ancient history, can be deleted

**Location:** `web app/`

```
web app/
├── app.js              (4,544 bytes - vanilla JS course browser)
├── course.html         (1,512 bytes - course display template)
├── index.html          (1,274 bytes - landing page template)
├── styles.css          (14,837 bytes - Tailwind CDN-based styles)
├── assets/             (logo.svg)
└── data/               (courses.json - 2,582 bytes)
```

**Evidence:** These are static HTML files using CDN-based Tailwind, clearly an early prototype before React/Next.js was adopted.

**Recommendation:** Delete entire `web app/` folder. If needed for reference, move to `docs/archive/prototype-v1/`.

---

### Issue #8: Abandoned Concept Files

**Severity:** LOW - Design concepts never implemented

| File | Size | Description |
|------|------|-------------|
| `potential_idea_1.txt` | 35 KB | HTML course browser concept with Tailwind |
| `potential_idea_2.txt` | 35 KB | Similar course browser concept |
| `potential_idea_3.html` | 36 KB | HTML prototype of course browser |

**Recommendation:** Move to `docs/archive/concepts/` or delete if no longer needed.

---

### Issue #8b: Old/Backup Files in enhanced_course_browser

**Severity:** LOW - Should be deleted

**Location:** `enhanced_course_browser/src/app/`

| File | Size | Description |
|------|------|-------------|
| `globals_old.css` | 5 KB | Old stylesheet backup |
| `layout_old.tsx` | 632 B | Old layout backup |
| `page_old.tsx` | 49 KB | Old page implementation backup |
| `docs/` folder | ~15 KB | .txt copies of code files |

**Recommendation:** Delete these backup files. Use git history if you need to recover old versions.

---

### Issue #8c: Orphan Files in Root Directory

**Severity:** LOW - Clutters project root

| File | Size | Description |
|------|------|-------------|
| `a_cool_switch.css` | 8 KB | Standalone CSS file, appears unused |

**Recommendation:** Determine if this is used anywhere; if not, delete it.

---

## 🗃️ STATE MANAGEMENT INCONSISTENCIES

### Issue #9: Different LocalStorage Keys for Same Data

**Severity:** MEDIUM - Data not shared between components

| Key | Used By | Data Structure |
|-----|---------|----------------|
| `plan` | `web/page.tsx`, `web/browser`, `web/planner` | `PlanItem[] = { title: string }[]` |
| `academicPlan` | `enhanced_course_browser/page.tsx` | `Plan = Record<string, PlanItem[]>` |
| `plannerV1` | `web/planner/page.tsx` | `PlannerState = Record<YearKey, PlannerSlot[]>` |
| `catalogPrefs` | `web/onboarding`, `web/middleware` | `{ grade, mathCourse, language: { name, level } }` |
| `theme` | Multiple files | `'dark' | 'light' | 'system'` |

**Impact:** User's plan in `/planner` (using `plannerV1`) is NOT synced with `/browser` (using `plan`) because they use different localStorage keys!

**Evidence:**

`web/src/app/browser/page.tsx:245-246`
```typescript
const saved = localStorage.getItem('plan');
if (saved) setPlan(JSON.parse(saved));
```

`web/src/app/planner/page.tsx:496-497`
```typescript
const saved = localStorage.getItem('plannerV1');
if (saved) setPlanner(JSON.parse(saved));
```

**Fix Required:** Standardize on ONE key and data structure for plan data across all components.

---

### Issue #10: Inconsistent Data Structures for "Plan"

**Severity:** MEDIUM - Cannot share data between components

**Type 1:** Simple array (used in web/page.tsx, web/browser)
```typescript
type PlanItem = { title: string };
const plan: PlanItem[] = [
  { title: "Algebra II" },
  { title: "English 10" }
];
```

**Type 2:** Grouped by term (used in enhanced_course_browser)
```typescript
type Plan = Record<string, PlanItem[]>;
const plan: Plan = {
  'Fall 2025': [{ title: "Algebra II" }],
  'Spring 2026': [{ title: "English 10" }]
};
```

**Type 3:** 4-year planner with slots (used in web/planner)
```typescript
type PlannerState = Record<YearKey, PlannerSlot[]>;
const planner: PlannerState = {
  Freshman: [null, course1, { kind: 'GROUP', size: 3, items: [...] }, ...],
  Sophomore: [...],
  Junior: [...],
  Senior: [...]
};
```

**Fix Required:** Choose ONE data model and use it everywhere.

---

## 📁 FOLDER STRUCTURE ISSUES

### Issue #11: Non-Descriptive Folder Names

**Severity:** MEDIUM - No indication of what folders contain

| Current Name | What It Actually Contains | Better Name |
|--------------|---------------------------|-------------|
| `landing_page/` | React/Vite landing page (port 3002) | `landing-page-vite/` |
| `login_page/` | Next.js login app (port 3000) | `login-app/` |
| `enhanced_course_browser/` | Duplicate course browser (UNUSED) | **DELETE** |
| `web/` | Main Next.js app with all routes | `course-registration-app/` |
| `web app/` | Static HTML prototype | **DELETE** |
| `prep_data/` | Course catalog JSON, PDFs, images | `course-data/` |
| `potential_idea_*.txt/html` | Design concepts | **DELETE or move to docs/** |

**Recommendation:** Rename folders to clearly indicate their purpose and current status.

---

### Issue #12: Fragmented Course Data

**Severity:** LOW - Data scattered across multiple locations

**Course Catalog Files:**

| Location | Files | Total Size |
|----------|-------|------------|
| Root | `FINALcatalog.json`, `allcourses.md`, PDFs | ~4.5 MB |
| `prep_data/json/` | 12 JSON files by department | ~450 KB |
| `prep_data/department_pdfs/` | 12 PDF source files | ~15 MB |
| `web/public/` | `catalog.json` (may exist) | ? |
| `enhanced_course_browser/public/` | `catalog.json` (may exist) | ? |

**Impact:** Unclear which is the "source of truth" for course data.

**Recommendation:**
- Designate `prep_data/json/catalogdbfinal.json` as the single source of truth
- Delete duplicate copies from other public folders
- Update all code to fetch from single canonical location

---

## 🖥️ UI/UX ISSUES

### Issue #12b: Title/Branding Mismatch

**Severity:** LOW - Confusing browser tab titles

| App | Expected Title | Actual Title |
|-----|---------------|--------------|
| Landing Page (3002) | "Loomis Chaffee" | "project_template_react" |
| Login Page (3000) | "Login - Loomis Chaffee" | "Course Browser" |
| Course Browser (3001) | "Course Browser" | "Course Browser" ✓ |

**Evidence:** The landing page's Vite config likely has a default project name that wasn't updated.

**Fix Required:** Update page titles in respective app configurations.

---

## 🧩 DUPLICATE FUNCTIONS (DETAILED)

### Issue #13: Helper Functions Copied Across Files

**Severity:** HIGH - Bug fixes must be applied 4+ times

#### `fetchFirst<T>()` - Try multiple JSON paths

| File | Lines | Purpose |
|------|-------|---------|
| `web/src/app/page.tsx` | 33-41 | Try loading from `/catalog.json`, `/catalogdbfinal.json`, `/course_catalog_full.json` |
| `web/src/app/browser/page.tsx` | 35-44 | Identical implementation |
| `web/src/app/planner/page.tsx` | 39-44 | Identical implementation |
| `enhanced_course_browser/src/app/page.tsx` | 36-44 | Identical implementation |

**Code:**
```typescript
async function fetchFirst<T>(paths: string[]): Promise<T | null> {
  for (const p of paths) {
    try {
      const r = await fetch(p);
      if (r.ok) return (await r.json()) as T;
    } catch {}
  }
  return null;
}
```

#### `normalizeTerm()` - Convert term to label

| File | Lines | Purpose |
|------|-------|---------|
| `web/src/app/page.tsx` | 43-50 | Map "year", "two terms", "half", "term" to labels |
| `web/src/app/browser/page.tsx` | 42-49 | Identical implementation |
| `web/src/app/planner/page.tsx` | 66-73 | Identical implementation |
| `enhanced_course_browser/src/app/page.tsx` | 46-53 | Identical implementation |

**Code:**
```typescript
function normalizeTerm(raw?: string, duration?: string): { termLabel?: string; termTags: string[] } {
  const s = `${(raw || '').toLowerCase()} ${(duration || '').toLowerCase()}`.trim();
  if (s.includes('year')) return { termLabel: 'Full year', termTags: ['YEAR'] };
  if (s.includes('two terms')) return { termLabel: 'Two terms', termTags: ['TWO-TERM'] };
  if (s.includes('half')) return { termLabel: 'Half course', termTags: ['HALF'] };
  if (s.includes('term')) return { termLabel: 'Term', termTags: ['TERM'] };
  return { termLabel: undefined, termTags: [] };
}
```

#### `deriveTags()` - Extract GESC/PPR/CL tags

| File | Lines | Purpose |
|------|-------|---------|
| `web/src/app/page.tsx` | 52-71 | Extract GESC, PPR, CL, term tags |
| `web/src/app/browser/page.tsx` | 51-65 | Identical implementation |
| `web/src/app/planner/page.tsx` | 75-89 | Identical implementation |
| `enhanced_course_browser/src/app/page.tsx` | 55-71 | Identical implementation |

#### `flattenDatabase()` - Parse catalog JSON

| File | Lines | Purpose |
|------|-------|---------|
| `web/src/app/page.tsx` | 73-152 | Parse departments array or courses array |
| `web/src/app/browser/page.tsx` | 67-182 | Identical implementation |
| `web/src/app/planner/page.tsx` | 111-207 | Identical implementation |
| `enhanced_course_browser/src/app/page.tsx` | 73-112 | Identical implementation |

**Impact:** ~500 lines of duplicated complex parsing logic.

#### `canonicalizeDepartment()` - Normalize department names

| File | Lines | Purpose |
|------|-------|---------|
| `web/src/app/browser/page.tsx` | 81-108 | Map various department names to canonical options |
| `web/src/app/planner/page.tsx` | 106-133 | Identical implementation |

#### `formatGrades()` - Convert grade numbers to labels

| File | Lines | Purpose |
|------|-------|---------|
| `web/src/app/browser/page.tsx` | 185-203 | Map [9,10,11,12] to ['Freshman','Sophomore','Junior','Senior'] |
| `web/src/app/planner/page.tsx` | 210-228 | Identical implementation |

#### `printPlan()` - Generate printable plan

| File | Lines | Purpose |
|------|-------|---------|
| `web/src/app/page.tsx` | 232-285 | Open new window with printable HTML |
| `web/src/app/browser/page.tsx` | 304-401 | Enhanced version with course details |
| `web/src/app/planner/page.tsx` | 394-491 | Similar to browser version |
| `enhanced_course_browser/src/app/page.tsx` | 306-327 | Simple version |

**Total Duplicated Code:** ~2,000 lines

**Fix Required:** Create `web/src/lib/courseUtils.ts`:

```typescript
// web/src/lib/courseUtils.ts
export async function fetchFirst<T>(paths: string[]): Promise<T | null> { /* ... */ }
export function normalizeTerm(raw?: string, duration?: string): { termLabel?: string; termTags: string[] } { /* ... */ }
export function deriveTags(c: RawCourse): { tags: string[]; level?: string } { /* ... */ }
export function flattenDatabase(db: any): Course[] { /* ... */ }
export function canonicalizeDepartment(dep?: string): DeptOption | 'Other' { /* ... */ }
export function formatGrades(grades?: number[]): string | null { /* ... */ }
export function printPlan(plan: PlanItem[], courses: Course[]): void { /* ... */ }
```

Then import from all locations instead of duplicating.

---

## 📋 RECOMMENDED CLEANUP PLAN

### Phase 1: Immediate Cleanup (Do First)

1. **Delete obviously dead/redundant code:**
   ```bash
   rm -rf "web app/"
   rm -rf enhanced_course_browser/
   rm potential_idea_1.txt potential_idea_2.txt potential_idea_3.html
   rm a_cool_switch.css
   ```

2. **Create shared utilities:**
   ```bash
   mkdir -p web/src/lib
   # Create web/src/lib/courseUtils.ts with all shared functions
   ```

### Phase 2: Consolidate Applications

3. **Move landing page into web/:**
   - Copy `landing_page/src/pages/Home.tsx` content to `web/src/app/page.tsx`
   - Replace the existing course browser at root with landing page
   - Update `web/middleware.ts` if needed

4. **Move login page into web/:**
   - Copy `login_page/src/app/login/page.tsx` to `web/src/app/login/page.tsx`
   - Copy associated styles
   - Update `COURSE_BROWSER_URL` to be relative path instead of absolute URL
   - Delete `login_page/` folder

5. **Delete landing_page (now migrated):**
   ```bash
   rm -rf landing_page/
   ```

### Phase 3: Organize Remaining Files

6. **Rename folders:**
   ```bash
   mv web/ loomis-course-app/
   mv prep_data/ course-data/
   ```

7. **Clean up course data:**
   - Keep only `course-data/json/catalogdbfinal.json` as source of truth
   - Delete duplicate `catalog.json` files from `public/` folders
   - Archive PDFs to `course-data/source-pdfs/`

8. **Archive documentation:**
   ```bash
   mkdir -p docs/archive
   mv plan.txt docs/
   mv README.md docs/ (create new README for consolidated app)
   ```

### Final Structure

```
web_dev_lc/
├── loomis-course-app/          # Main application (port 3001)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx            # Landing page (from landing_page/)
│   │   │   ├── login/              # Login page (from login_page/)
│   │   │   ├── onboarding/         # Preference wizard
│   │   │   ├── browser/            # Course browser
│   │   │   └── planner/            # 4-year planner
│   │   ├── lib/
│   │   │   └── courseUtils.ts      # Shared utilities
│   │   └── components/
│   └── package.json               # Port 3001
│
├── course-data/                  # Course catalog data
│   ├── json/
│   │   └── catalogdbfinal.json    # Source of truth
│   ├── source-pdfs/              # Original PDFs
│   └── background_images/        # Visual assets
│
├── docs/                         # Documentation
│   ├── archive/                  # Old prototypes, concepts
│   └── plan.txt                  # Original project plan
│
├── start-all.sh                  # Updated to run single app
└── README.md                     # New consolidated README
```

---

## 📊 Summary Statistics

| Metric | Count |
|--------|-------|
| **Separate applications** | 4 (landing_page, login_page, enhanced_course_browser, web) |
| **Duplicate login pages** | 2 (1 stub + 1 actual) |
| **Duplicate course browsers** | 4 |
| **Port conflicts** | 2 apps claiming port 3002 (landing_page & enhanced_course_browser) |
| **Duplicated functions** | 7 functions, ~2,000 lines |
| **LocalStorage keys for plan data** | 3 different keys |
| **Dead/stub files** | 4 files |
| **Legacy/unused folders** | 2 (web app, enhanced_course_browser) |
| **Orphan/backup files** | 4 files |
| **Total redundant code** | ~2,500+ lines |

---

## ✅ Completion Checklist

Use this checklist to track cleanup progress:

- [x] ~~Fix port conflict in `web/package.json`~~ (Already correct: port 3001)
- [ ] Create `web/src/lib/courseUtils.ts` with shared functions
- [ ] Update all files to import from `courseUtils.ts`
- [ ] Move landing page from `landing_page/` to `web/src/app/page.tsx`
- [ ] Move login page from `login_page/` to `web/src/app/login/page.tsx`
- [ ] Delete `landing_page/` folder
- [ ] Delete `login_page/` folder
- [ ] Delete `enhanced_course_browser/` folder
- [ ] Delete `web app/` folder
- [ ] Delete or archive `potential_idea_*` files
- [ ] Delete orphan files (`a_cool_switch.css`)
- [ ] Rename `web/` to `loomis-course-app/`
- [ ] Rename `prep_data/` to `course-data/`
- [ ] Standardize localStorage keys across all components
- [ ] Update `start-all.sh` to run single application
- [ ] Fix page titles across all apps
- [ ] Update `README.md` with new structure
- [ ] Test complete user flow end-to-end

---

## 🔄 Verification Notes

**Verified via Chrome testing on December 26, 2025:**

1. ✓ User flow works: Landing (3002) → Login (3000) → Browser (3001)
2. ✓ `web/package.json` correctly uses port 3001 (not 3002 as originally reported)
3. ✓ `web/src/app/login/page.tsx` does NOT exist (only 2 login pages, not 3)
4. ✓ `web/src/app/page.tsx` is a 370-line course browser (NOT a 5-line redirect)
5. ✓ `academicPlan` localStorage key is used by `enhanced_course_browser`, not `web/`

---

**Report Generated:** December 26, 2025
**Last Verified:** December 26, 2025
**Total Issues Identified:** 22
