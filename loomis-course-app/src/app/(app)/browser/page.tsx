"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

// Import shared types and utilities
import { Course, PlanItem, DeptOption, DEPT_OPTIONS } from "@/types/course";
import {
  fetchCatalog,
  flattenDatabase,
  canonicalizeDepartment,
  formatGrades,
  filterCourses,
} from "@/lib/courseUtils";

/**
 * Course Browser Page
 *
 * Displays a searchable, filterable list of courses with the ability
 * to add courses to a shopping list (plan).
 */
export default function BrowserPage() {
  const router = useRouter();

  // Course data state
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [query, setQuery] = useState("");
  const [includeDescriptions, setIncludeDescriptions] = useState(false);
  const [deptFilter, setDeptFilter] = useState<DeptOption>("All");
  const [tagGESC, setTagGESC] = useState(false);
  const [tagPPR, setTagPPR] = useState(false);
  const [tagCL, setTagCL] = useState(false);

  // Plan state
  const [plan, setPlan] = useState<PlanItem[]>([]);
  const hasLoadedPlanRef = useRef(false);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(true);

  // Load course data
  useEffect(() => {
    (async () => {
      const data = await fetchCatalog();
      if (!data) {
        setError("Could not load catalog from /public");
        return;
      }
      setCourses(flattenDatabase(data));
    })();
  }, []);

  // Load saved plan from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("plan");
      if (saved) setPlan(JSON.parse(saved));
    } catch {
      // Ignore localStorage errors
    }
    hasLoadedPlanRef.current = true;
  }, []);

  // Persist plan to localStorage when it changes
  useEffect(() => {
    if (!hasLoadedPlanRef.current) return;
    try {
      localStorage.setItem("plan", JSON.stringify(plan));
    } catch {
      // Ignore localStorage errors
    }
  }, [plan]);

  // Compute available tags for display
  const tagsAvailable = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => c.tags?.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [courses]);

  // Filter courses based on current filter state
  const filtered = useMemo(() => {
    return filterCourses(courses, {
      query,
      includeDescriptions,
      department: deptFilter,
      tags: { gesc: tagGESC, ppr: tagPPR, cl: tagCL },
    });
  }, [courses, query, includeDescriptions, deptFilter, tagGESC, tagPPR, tagCL]);

  // Plan management functions
  function addToPlan(c: Course) {
    setPlan((prev) => [...prev, { title: c.title }]);
  }

  function removeFromPlan(i: number) {
    setPlan((prev) => prev.filter((_, idx) => idx !== i));
  }

  function resetOnboarding() {
    try {
      localStorage.removeItem("catalogPrefs");
    } catch {}

    document.cookie = "catalogPrefs=; Path=/; Max-Age=0; SameSite=Lax";
    document.cookie = "prefsSet=; Path=/; Max-Age=0; SameSite=Lax";
    document.cookie = "onboardingIntroSeen=; Path=/; Max-Age=0; SameSite=Lax";

    router.push("/onboarding");
  }

  function printPlan(): void {
    if (typeof window === "undefined") return;

    const escapeHtml = (s = "") =>
      String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    const itemsHtml = plan
      .map((p) => {
        const course = courses.find((c) => c.title === p.title) || {
          title: p.title,
          description: "",
          department: "—",
          termLabel: "—",
          tags: [] as string[],
          level: undefined,
        };

        const title = escapeHtml(course.title);
        const subject = escapeHtml(course.department ?? "—");
        const term = escapeHtml(course.termLabel ?? "—");
        const level = escapeHtml(course.level ?? "");
        const tagsHtml = (course.tags || [])
          .map((t) => `<span class="tag">${escapeHtml(t)}</span>`)
          .join(" ");
        const descHtml = course.description
          ? `<div class="desc">${escapeHtml(course.description)}</div>`
          : "";

        return `<div class="card">
          <div class="card-header">
            <div class="card-title">${title}</div>
            ${level ? `<div class="card-level">${level}</div>` : ""}
          </div>
          <div class="card-meta"><span class="subject">${subject}</span> • <span class="term">${term}</span></div>
          <div class="card-tags">${tagsHtml}</div>
          ${descHtml}
        </div>`;
      })
      .join("\n");

    const html = `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>My Plan</title>
        <style>
          @page { size: auto; margin: 0.5in; }
          html,body{margin:0;padding:0;color:#111;font-family: Arial, Helvetica, sans-serif;background:#fff;}
          body{padding:18px; font-size:13px; line-height:1.5;}
          h1{font-size:18px;margin:0 0 12px 0;}
          .container{max-width:800px;margin:0 auto;}
          .card{display:block;border:1px solid #e6e6e6;border-radius:6px;padding:12px 14px;margin:0 0 12px 0;background:#fff;page-break-inside:avoid;}
          .card-header{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;}
          .card-title{font-weight:700;font-size:15px;margin-bottom:6px;}
          .card-level{font-size:12px;color:#666;font-weight:600;}
          .card-meta{font-size:12px;color:#555;margin-bottom:8px;}
          .card-tags{margin-bottom:8px;}
          .tag{display:inline-block;background:#f1f1f1;color:#333;border-radius:3px;padding:3px 6px;font-size:11px;margin-right:6px;}
          .desc{font-size:13px;color:#222;white-space:pre-wrap;margin-top:6px;}
        </style>
      </head>
      <body>
        <div class="container">
          <h1>My Plan</h1>
          ${itemsHtml}
        </div>
      </body>
    </html>`;

    const w = window.open("", "_blank");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => {
      try {
        w.print();
        w.close();
      } catch {
        // Ignore print errors
      }
    }, 250);
  }

  return (
    <div className={styles.browserWrapper}>
      {/* Drawer toggle button */}
      <button
        type="button"
        className={`${styles.drawerToggle} ${drawerOpen ? styles.drawerToggleOpen : ""}`}
        aria-expanded={drawerOpen}
        aria-controls="course-drawer"
        onClick={() => setDrawerOpen((o) => !o)}
        title={drawerOpen ? "Close course browser" : "Open course browser"}
      >
        <span aria-hidden="true">{drawerOpen ? "◀" : "▶"}</span>
      </button>

      {/* Left Drawer: Course Browser */}
      <aside
        id="course-drawer"
        className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ""}`}
        aria-hidden={!drawerOpen}
      >
        <div className={styles.drawerContent}>
          <h1 className={styles.heading}>Course Browser</h1>
          {error && <div className={styles.error}>{error}</div>}

          {/* Filters */}
          <div className={styles.filters}>
            <div className={styles.searchRow}>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title or department"
                className={styles.input}
              />
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={includeDescriptions}
                  onChange={(e) => setIncludeDescriptions(e.target.checked)}
                />
                Search descriptions
              </label>

              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value as DeptOption)}
                className={styles.select}
              >
                {DEPT_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Tag filters */}
            <div className={styles.tagRow}>
              <span>Tags:</span>
              <label>
                <input
                  type="checkbox"
                  checked={tagGESC}
                  onChange={(e) => setTagGESC(e.target.checked)}
                />{" "}
                GESC
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={tagPPR}
                  onChange={(e) => setTagPPR(e.target.checked)}
                />{" "}
                PPR
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={tagCL}
                  onChange={(e) => setTagCL(e.target.checked)}
                />{" "}
                CL
              </label>
              <span className={styles.tagInfo}>
                ({tagsAvailable.length} tag types found)
              </span>
            </div>
          </div>

          <div className={styles.resultInfo}>
            Showing {filtered.length} of {courses.length} courses
          </div>

          {/* Scrollable list */}
          <div className={styles.courseList}>
            <div className={styles.cardGrid}>
              {filtered.map((c, i) => (
                <div key={c.title + i} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <strong>{c.title}</strong>
                    <button
                      className={styles.addButton}
                      onClick={() => addToPlan(c)}
                    >
                      Add
                    </button>
                  </div>

                  <div className={styles.cardMeta}>
                    <span>
                      {(() => {
                        const canon = canonicalizeDepartment(c.department);
                        return canon !== "Other" ? canon : c.department || "—";
                      })()}
                    </span>
                    {formatGrades(c.grades) ? (
                      <>
                        {" "}
                        • <span>{formatGrades(c.grades)}</span>
                      </>
                    ) : null}
                  </div>

                  {c.tags?.length ? (
                    <div className={styles.tagContainer}>
                      {c.tags.map((tag) => (
                        <span key={tag} className={styles.tagChip}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  {c.description && (
                    <p className={styles.description}>{c.description}</p>
                  )}

                  {(c.prerequisiteText || c.permissionRequired) && (
                    <div className={styles.prereqBanner}>
                      {c.prerequisiteText ? (
                        <span>Prerequisite: {c.prerequisiteText}</span>
                      ) : null}
                      {c.permissionRequired ? (
                        <span>Departmental permission required</span>
                      ) : null}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main container — Plan on the page */}
      <div className={styles.container}>
        <div className={styles.planSection}>
          <div className={styles.planHeader}>
            <h2 className={styles.heading}>My Plan</h2>
            <button
              className={styles.resetOnboardingBtn}
              onClick={resetOnboarding}
              title="Reset your course placement information and restart the setup process"
            >
              Reset Your Info
            </button>
          </div>
          <div className={styles.planGrid}>
            {plan.map((p, i) => (
              <div key={`${p.title}-${i}`} className={styles.planItem}>
                <span>{p.title}</span>
                <button
                  className={styles.removeButton}
                  onClick={() => removeFromPlan(i)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button className={styles.printButton} onClick={printPlan}>
            Print / Save PDF
          </button>
        </div>
      </div>
    </div>
  );
}
