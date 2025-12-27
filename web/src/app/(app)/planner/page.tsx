"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./page.module.css";

// Import shared types and utilities
import {
  Course,
  PlanItem,
  DeptOption,
  DEPT_OPTIONS,
  YearKey,
  YEARS,
  SLOTS_PER_YEAR,
  TermGroup,
  PlannerSlot,
  PlannerState,
  isTermGroup,
  isTermLikeCourse,
  getGroupSize,
} from "@/types/course";
import {
  fetchCatalog,
  flattenDatabase,
  canonicalizeDepartment,
  formatGrades,
  filterCourses,
} from "@/lib/courseUtils";

/**
 * Planner Page
 *
 * A 4-year course planner with a collapsible course browser drawer.
 * Allows users to drag courses into yearly slots, supporting term
 * and half-course groupings.
 */
export default function PlannerPage() {
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

  // Simple plan state (shopping list)
  const [plan, setPlan] = useState<PlanItem[]>([]);
  const hasLoadedPlanRef = useRef(false);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(true);

  // 4-year planner state
  const [planner, setPlanner] = useState<PlannerState>({
    Freshman: Array(SLOTS_PER_YEAR).fill(null),
    Sophomore: Array(SLOTS_PER_YEAR).fill(null),
    Junior: Array(SLOTS_PER_YEAR).fill(null),
    Senior: Array(SLOTS_PER_YEAR).fill(null),
  });
  const hasLoadedPlannerRef = useRef(false);

  // Which slot is selected for assignment
  const [selected, setSelected] = useState<{
    year: YearKey;
    idx: number;
  } | null>(null);

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

  // Load saved simple plan on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("plan");
      if (saved) setPlan(JSON.parse(saved));
    } catch {
      // Ignore localStorage errors
    }
    hasLoadedPlanRef.current = true;
  }, []);

  // Persist simple plan to localStorage
  useEffect(() => {
    if (!hasLoadedPlanRef.current) return;
    try {
      localStorage.setItem("plan", JSON.stringify(plan));
    } catch {
      // Ignore localStorage errors
    }
  }, [plan]);

  // Load saved 4-year planner on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("plannerV1");
      if (saved) setPlanner(JSON.parse(saved));
    } catch {
      // Ignore localStorage errors
    }
    hasLoadedPlannerRef.current = true;
  }, []);

  // Persist 4-year planner to localStorage
  useEffect(() => {
    if (!hasLoadedPlannerRef.current) return;
    try {
      localStorage.setItem("plannerV1", JSON.stringify(planner));
    } catch {
      // Ignore localStorage errors
    }
  }, [planner]);

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

  // Simple plan functions
  function addToPlan(c: Course) {
    setPlan((prev) => [...prev, { title: c.title }]);
  }

  function removeFromPlan(i: number) {
    setPlan((prev) => prev.filter((_, idx) => idx !== i));
  }

  // If a slot is selected, fill it; otherwise fall back to Add-to-list behavior
  function assignToSelectedOrList(c: Course) {
    if (!selected) {
      addToPlan(c);
      return;
    }

    setPlanner((prev) => {
      const copy: PlannerState = JSON.parse(JSON.stringify(prev));
      const y = selected.year;
      const i = selected.idx;
      const current = copy[y][i] as PlannerSlot;

      // TERM / HALF → grouped sub-cells
      if (isTermLikeCourse(c)) {
        const needed = getGroupSize(c); // 3 for term, 2 for half

        // Create group if none exists
        if (!current || !isTermGroup(current)) {
          copy[y][i] = {
            kind: "GROUP",
            size: needed,
            items: Array(needed).fill(null),
          } as TermGroup;
        }

        const g = copy[y][i] as TermGroup;

        // Resize group if needed (switching between half/term)
        if (g.size !== needed) {
          g.size = needed;
          g.items = g.items.slice(0, needed);
          while (g.items.length < needed) g.items.push(null);
        }

        // Put the course into the first empty sub-slot (or replace the last if full)
        const spot = g.items.findIndex((x) => x === null);
        if (spot === -1) g.items[g.items.length - 1] = c;
        else g.items[spot] = c;

        return copy;
      }

      // Non-term (full-year/two-terms/etc) → replace entire slot
      copy[y][i] = c;
      return copy;
    });
  }

  function clearSlot(y: YearKey, i: number) {
    setPlanner((prev) => {
      const copy: PlannerState = JSON.parse(JSON.stringify(prev));
      copy[y][i] = null;
      return copy;
    });
    if (selected && selected.year === y && selected.idx === i) setSelected(null);
  }

  function clearAllSlots() {
    if (!confirm("Clear all four years?")) return;
    setPlanner({
      Freshman: Array(SLOTS_PER_YEAR).fill(null),
      Sophomore: Array(SLOTS_PER_YEAR).fill(null),
      Junior: Array(SLOTS_PER_YEAR).fill(null),
      Senior: Array(SLOTS_PER_YEAR).fill(null),
    });
    setSelected(null);
  }

  function clearSub(year: YearKey, idx: number, sub: number) {
    setPlanner((prev) => {
      const copy: PlannerState = JSON.parse(JSON.stringify(prev));
      const g = copy[year][idx] as TermGroup;
      if (!g || !isTermGroup(g)) return copy;
      g.items[sub] = null;

      // If the whole group is empty, collapse to empty slot
      if (g.items.every((x) => x === null)) copy[year][idx] = null;
      return copy;
    });
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
    <>
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
                      onClick={() => assignToSelectedOrList(c)}
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

      {/* 4-Year Planner Grid */}
      <section className={styles.plannerShell}>
        <div className={styles.plannerHeaderRow}>
          <div className={styles.smallNote}>
            Here&apos;s your current four year plan.
          </div>
          <div className={styles.tools}>
            <button className={styles.toolBtn} onClick={clearAllSlots}>
              Clear all
            </button>
            <button className={styles.toolBtn} onClick={() => window.print()}>
              Print / Save PDF
            </button>
          </div>
        </div>

        <div className={styles.grid}>
          {YEARS.map((year) => (
            <div key={year} className={styles.col}>
              <div className={styles.colTitle}>{year}</div>
              <div className={styles.colSlots}>
                {planner[year].map((slot, idx) => {
                  const isSel =
                    selected && selected.year === year && selected.idx === idx;

                  // Grouped TERM/HALF slot
                  if (isTermGroup(slot)) {
                    return (
                      <div
                        key={`${year}-${idx}`}
                        className={`${styles.slot} ${styles.slotGroup} ${
                          slot.size === 3 ? styles.group3 : styles.group2
                        } ${isSel ? styles.slotSelected : ""}`}
                        onClick={() => setSelected({ year, idx })}
                      >
                        <div className={styles.bracket} aria-hidden="true" />
                        {slot.size === 3 ? (
                          <>
                            <div
                              className={styles.bracketNotch}
                              style={{ top: "33%" }}
                              aria-hidden="true"
                            />
                            <div
                              className={styles.bracketNotch}
                              style={{ top: "66%" }}
                              aria-hidden="true"
                            />
                          </>
                        ) : (
                          <div
                            className={styles.bracketNotch}
                            style={{ top: "50%" }}
                            aria-hidden="true"
                          />
                        )}

                        <div className={styles.subStack}>
                          {slot.items.map((item, k) => (
                            <div
                              key={k}
                              className={styles.subSlot}
                              onClick={() => setSelected({ year, idx })}
                            >
                              {item ? (
                                <>
                                  <div className={styles.slotTitle}>
                                    {item.title}
                                  </div>
                                  <div className={styles.slotMeta}>
                                    <span>{item.department || "—"}</span>
                                    {item.termLabel ? (
                                      <>
                                        {" "}
                                        • <span>{item.termLabel}</span>
                                      </>
                                    ) : null}
                                    {item.level ? (
                                      <>
                                        {" "}
                                        • <span>{item.level}</span>
                                      </>
                                    ) : null}
                                  </div>
                                </>
                              ) : (
                                <span className={styles.slotPlaceholder}>
                                  Select course →
                                </span>
                              )}
                              <button
                                className={styles.subClear}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  clearSub(year, idx, k);
                                }}
                                aria-label="Clear sub-slot"
                                title="Clear this term slot"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  // Regular single slot
                  return (
                    <div
                      key={`${year}-${idx}`}
                      className={`${styles.slot} ${isSel ? styles.slotSelected : ""}`}
                      onClick={() => setSelected({ year, idx })}
                      title="Click to select this slot, then press Add on a course"
                    >
                      {slot ? (
                        <>
                          <div className={styles.slotTitle}>{slot.title}</div>
                          <div className={styles.slotMeta}>
                            <span>{slot.department || "—"}</span>
                            {slot.termLabel ? (
                              <>
                                {" "}
                                • <span>{slot.termLabel}</span>
                              </>
                            ) : null}
                            {slot.level ? (
                              <>
                                {" "}
                                • <span>{slot.level}</span>
                              </>
                            ) : null}
                          </div>
                        </>
                      ) : (
                        <span className={styles.slotPlaceholder}>
                          Select course →
                        </span>
                      )}
                      <button
                        className={styles.slotClear}
                        onClick={(e) => {
                          e.stopPropagation();
                          clearSlot(year, idx);
                        }}
                        aria-label="Clear slot"
                        title="Clear this slot"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Main container — Simple Plan list */}
      <div className={styles.container}>
        <div>
          <h2 className={styles.heading}>My Plan</h2>
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
    </>
  );
}
