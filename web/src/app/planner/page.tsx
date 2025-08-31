'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './page.module.css';

type RawCourse = {
  title: string;
  description?: string;
  department?: string;
  rigor?: number;         // 1,2,3
  gesc?: boolean;
  ppr?: boolean;
  term?: string;          // "year course", "term course"
  duration?: string;      // "full-year", "term", "two terms", "half course"
  grades?: number[];
  offered_in_25?: boolean;
  prerequisite?: [string | null, boolean]; // [text, permissionRequired]
};

type Course = {
  title: string;
  description?: string;
  department?: string;
  tags: string[];         // derived
  level?: string;         // "CL" | "ADV" | undefined
  grades?: number[];
  permissionRequired?: boolean;
  termLabel?: string;     // "Full year" / "Term" / etc
  prerequisiteText?: string; // shown in red banner
};

type PlanItem = { title: string };
type YearKey = 'Freshman' | 'Sophomore' | 'Junior' | 'Senior';
const YEARS: YearKey[] = ['Freshman', 'Sophomore', 'Junior', 'Senior'];
const SLOTS_PER_YEAR = 6; // adjust if you want more/less boxes

type PlannerState = Record<YearKey, PlannerSlot[]>;

async function fetchFirst<T>(paths: string[]): Promise<T | null> {
  for (const p of paths) {
    try { const r = await fetch(p); if (r.ok) return (await r.json()) as T; } catch {}
  }
  return null;
}

// --- Term/half grouping support (ADD) ---
type TermGroup = {
  kind: 'GROUP';
  size: 2 | 3;                 // 2 = Half course, 3 = Term course
  items: (Course | null)[];
};

type PlannerSlot = Course | TermGroup | null; // if you already had PlannerSlot, extend it

const isGroup = (s: PlannerSlot): s is TermGroup =>
  !!s && (s as any).kind === 'GROUP';

const isTermLike = (c: Course) =>
  (c.termLabel?.toLowerCase().includes('term') && !c.termLabel?.toLowerCase().includes('two')) ||
  c.termLabel?.toLowerCase().includes('half');

const groupSizeFor = (c: Course): 2 | 3 =>
  c.termLabel?.toLowerCase().includes('half') ? 2 : 3;


function normalizeTerm(raw?: string, duration?: string): { termLabel?: string; termTags: string[] } {
  const s = `${(raw || '').toLowerCase()} ${(duration || '').toLowerCase()}`.trim();
  if (s.includes('year')) return { termLabel: 'Full year', termTags: ['YEAR'] };
  if (s.includes('two terms')) return { termLabel: 'Two terms', termTags: ['TWO-TERM'] };
  if (s.includes('half')) return { termLabel: 'Half course', termTags: ['HALF'] };
  if (s.includes('term')) return { termLabel: 'Term', termTags: ['TERM'] };
  return { termLabel: undefined, termTags: [] };
}

function deriveTags(c: RawCourse): { tags: string[]; level?: string } {
  const tags: string[] = [];
  if (c.gesc) tags.push('GESC');
  if (c.ppr) tags.push('PPR');

  let level: string | undefined;
  const titleCL = (c.title || '').trim().toUpperCase().startsWith('CL ');
  if (titleCL || (c.rigor ?? 1) >= 3) { tags.push('CL'); level = 'CL'; }
  else if ((c.rigor ?? 1) === 2) { tags.push('ADV'); level = 'ADV'; }

  const { termTags } = normalizeTerm(c.term, c.duration);
  tags.push(...termTags);

  return { tags: Array.from(new Set(tags)), level };
}


// ---- Canonical department mapping (matches form sections) ----
const DEPT_OPTIONS = [
  'All',
  'English',
  'Modern or Classical Languages',
  'History, Philosophy, Religious Studies & Social Science',
  'Mathematics',
  'Computer Science',
  'Science',
  'Performing Arts/Visual Arts',
] as const;

type DeptOption = (typeof DEPT_OPTIONS)[number];

function canonicalizeDepartment(dep?: string): DeptOption | 'Other' {
  const d = (dep || '').toLowerCase().trim();

  if (/\benglish\b/.test(d)) return 'English';

  if (
    /(modern|classical).*language/.test(d) ||
    /\b(world )?languages?\b/.test(d) ||
    /\b(arabic|chinese|french|latin|spanish)\b/.test(d)
  ) return 'Modern or Classical Languages';

  if (/(history|philosophy|religious|religion|social)/.test(d) || /\bhprss\b/.test(d))
    return 'History, Philosophy, Religious Studies & Social Science';

  // Check CS BEFORE math/science
  if (/\b(computer(\s+science)?|cs|comp(uter)?\s*sci(ence)?)\b/.test(d))
    return 'Computer Science';

  if (/\bmath(ematics)?\b/.test(d)) return 'Mathematics';

  if (/\b(science|biology|chemistry|physics|environmental|earth)\b/.test(d))
    return 'Science';

  if (/\b(performing|visual|music|theater|theatre|dance|arts?)\b/.test(d))
    return 'Performing Arts/Visual Arts';

  return 'Other';
}

// flatten DB to simple array
function flattenDatabase(db: any): Course[] {
  const out: Course[] = [];

  const pushCourse = (rc: RawCourse, deptName?: string) => {
    const { tags, level } = deriveTags(rc);
    const { termLabel } = normalizeTerm(rc.term, rc.duration);
    out.push({
      title: rc.title,
      description: rc.description,
      department: rc.department || deptName,
      tags,
      level,
      grades: rc.grades,
      permissionRequired: Array.isArray(rc.prerequisite) ? !!rc.prerequisite[1] : undefined,
      termLabel,
      prerequisiteText: Array.isArray(rc.prerequisite) ? (rc.prerequisite[0] || '') : ''
    });
  };

  if (db && Array.isArray(db.departments)) {
    for (const deptBlock of db.departments) {
      const deptName: string | undefined = deptBlock.department;
      const courses = deptBlock.courses;

      if (Array.isArray(courses)) {
        for (const rc of courses as RawCourse[]) pushCourse(rc, deptName);
      } else if (courses && typeof courses === 'object') {
        for (const key of Object.keys(courses)) {
          const list: RawCourse[] = courses[key];
          if (!Array.isArray(list)) continue;
          for (const rc of list) pushCourse(rc, deptName || key);
        }
      }
    }
    return out;
  }

  if (Array.isArray(db)) {
    return (db as RawCourse[]).map((rc) => {
      const { tags, level } = deriveTags(rc);
      const { termLabel } = normalizeTerm(rc.term, rc.duration);
      return {
        title: rc.title,
        description: rc.description,
        department: rc.department,
        tags,
        level,
        grades: rc.grades,
        permissionRequired: Array.isArray(rc.prerequisite) ? !!rc.prerequisite[1] : undefined,
        termLabel,
        prerequisiteText: Array.isArray(rc.prerequisite) ? (rc.prerequisite[0] || '') : ''
      };
    });
  }

  const arr = Array.isArray(db?.courses) ? db.courses : [];
  return arr.map((rc: RawCourse) => {
    const { tags, level } = deriveTags(rc);
    const { termLabel } = normalizeTerm(rc.term, rc.duration);
    return {
      title: rc.title,
      description: rc.description,
      department: rc.department,
      tags,
      level,
      grades: rc.grades,
      permissionRequired: Array.isArray(rc.prerequisite) ? !!rc.prerequisite[1] : undefined,
      termLabel,
      prerequisiteText: Array.isArray(rc.prerequisite) ? (rc.prerequisite[0] || '') : ''
    };
  });
}

// Grades → labels used in subheading
const GRADE_LABELS: Record<number, string> = {
  9: 'Freshman',
  10: 'Sophomore',
  11: 'Junior',
  12: 'Senior',
};

function formatGrades(grades?: number[]): string | null {
  if (!grades || grades.length === 0) return null;
  const names = Array.from(
    new Set(
      grades
        .filter((g) => GRADE_LABELS[g])
        .sort((a, b) => a - b)
        .map((g) => GRADE_LABELS[g]!)
    )
  );
  return names.length ? names.join(', ') : null;
}

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [query, setQuery] = useState('');
  const [includeDescriptions, setIncludeDescriptions] = useState(false);
  const [deptFilter, setDeptFilter] = useState<DeptOption>('All');
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<PlanItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem('plan') || '[]'); } catch { return []; }
  });

  // Tag filters
  const [tagGESC, setTagGESC] = useState(false);
  const [tagPPR, setTagPPR] = useState(false);
  const [tagCL, setTagCL] = useState(false);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(true);

  // === 4-year planner state (ADD) ===
const [planner, setPlanner] = useState<PlannerState>(() => {
  if (typeof window === 'undefined') {
    return {
      Freshman: Array(SLOTS_PER_YEAR).fill(null),
      Sophomore: Array(SLOTS_PER_YEAR).fill(null),
      Junior: Array(SLOTS_PER_YEAR).fill(null),
      Senior: Array(SLOTS_PER_YEAR).fill(null),
    };
  }
  try {
    const saved = localStorage.getItem('plannerV1');
    if (saved) return JSON.parse(saved) as PlannerState;
  } catch {}
  return {
    Freshman: Array(SLOTS_PER_YEAR).fill(null),
    Sophomore: Array(SLOTS_PER_YEAR).fill(null),
    Junior: Array(SLOTS_PER_YEAR).fill(null),
    Senior: Array(SLOTS_PER_YEAR).fill(null),
  };
});

// which slot is selected for assignment
const [selected, setSelected] = useState<{ year: YearKey; idx: number } | null>(null);

// if a slot is selected, fill it; otherwise fall back to old Add-to-list behavior
function assignToSelectedOrList(c: Course) {
  if (!selected) { addToPlan(c); return; } // keep your original list behavior

  setPlanner(prev => {
    const copy: any = JSON.parse(JSON.stringify(prev));
    const y = selected.year, i = selected.idx;
    const current = copy[y][i] as PlannerSlot;

    // TERM / HALF → grouped sub-cells
    if (isTermLike(c)) {
      const needed = groupSizeFor(c); // 3 for term, 2 for half

      // Create group if none exists
      if (!current || !isGroup(current)) {
        copy[y][i] = { kind: 'GROUP', size: needed, items: Array(needed).fill(null) } as TermGroup;
      }

      const g = copy[y][i] as TermGroup;

      // Resize group if needed (switching between half/term)
      if (g.size !== needed) {
        g.size = needed;
        g.items = g.items.slice(0, needed);
        while (g.items.length < needed) g.items.push(null);
      }

      // Put the course into the first empty sub-slot (or replace the last if full)
      const spot = g.items.findIndex(x => x === null);
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
  setPlanner(prev => {
    const copy: PlannerState = JSON.parse(JSON.stringify(prev));
    copy[y][i] = null;
    return copy;
  });
  if (selected && selected.year === y && selected.idx === i) setSelected(null);
}

function clearAllSlots() {
  if (!confirm('Clear all four years?')) return;
  setPlanner({
    Freshman: Array(SLOTS_PER_YEAR).fill(null),
    Sophomore: Array(SLOTS_PER_YEAR).fill(null),
    Junior: Array(SLOTS_PER_YEAR).fill(null),
    Senior: Array(SLOTS_PER_YEAR).fill(null),
  });
  setSelected(null);
}

function clearSub(year: YearKey, idx: number, sub: number) {
  setPlanner(prev => {
    const copy: any = JSON.parse(JSON.stringify(prev));
    const g = copy[year][idx] as TermGroup;
    if (!g || !isGroup(g)) return copy;
    g.items[sub] = null;

    // If the whole group is empty, collapse to empty slot
    if (g.items.every(x => x === null)) copy[year][idx] = null;
    return copy;
  });
}


  useEffect(() => {
    (async () => {
      const data = await fetchFirst<any>([
        '/catalog.json',
        '/catalogdbfinal.json',
        '/course_catalog_full.json'
      ]);
      if (!data) { setError('Could not load catalog from /public'); return; }
      setCourses(flattenDatabase(data));
    })();
  }, []);

  useEffect(() => {
    localStorage.setItem('plan', JSON.stringify(plan));
  }, [plan]);

  const tagsAvailable = useMemo(() => {
    const set = new Set<string>();
    courses.forEach(c => c.tags?.forEach(t => set.add(t)));
    return Array.from(set).sort();
  }, [courses]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const needTag = (c: Course) => {
      if (tagGESC && !c.tags?.includes('GESC')) return false;
      if (tagPPR && !c.tags?.includes('PPR')) return false;
      if (tagCL && !c.tags?.includes('CL')) return false;
      return true;
    };
    return courses.filter(c => {
      const matchesDept =
        deptFilter === 'All' || canonicalizeDepartment(c.department) === deptFilter;

      const matchesTags = needTag(c);

      const haystacks = [
        (c.title || '').toLowerCase(),
        (c.department || '').toLowerCase(),
        ...(includeDescriptions ? [(c.description || '').toLowerCase()] : [])
      ];
      const matchesQuery = q === '' || haystacks.some(h => h.includes(q));
      return matchesDept && matchesTags && matchesQuery;
    });
  }, [courses, query, includeDescriptions, deptFilter, tagGESC, tagPPR, tagCL]);

  function addToPlan(c: Course) { setPlan(prev => [...prev, { title: c.title }]); }
  function removeFromPlan(i: number) { setPlan(prev => prev.filter((_, idx) => idx !== i)); }

  function printPlan(): void {
  if (typeof window === 'undefined') return;

  const escapeHtml = (s = '') =>
    String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const itemsHtml = plan
    .map((p) => {
      const course = courses.find((c) => c.title === p.title) || {
        title: p.title,
        description: '',
        department: '—',
        termLabel: '—',
        tags: [] as string[],
        level: undefined,
      };

      const title = escapeHtml(course.title);
      const subject = escapeHtml(course.department ?? '—');
      const term = escapeHtml((course as any).termLabel ?? (course as any).duration ?? '—');
      const level = escapeHtml(course.level ?? '');
      const tagsHtml = (course.tags || [])
        .map((t) => `<span class="tag">${escapeHtml(t)}</span>`)
        .join(' ');
      const descHtml = course.description ? `<div class="desc">${escapeHtml(course.description)}</div>` : '';

      return `<div class="card">
        <div class="card-header">
          <div class="card-title">${title}</div>
          ${level ? `<div class="card-level">${level}</div>` : ''}
        </div>
        <div class="card-meta"><span class="subject">${subject}</span> • <span class="term">${term}</span></div>
        <div class="card-tags">${tagsHtml}</div>
        ${descHtml}
      </div>`;
    })
    .join('\n');

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
        .card{
          display:block;
          border:1px solid #e6e6e6;
          border-radius:6px;
          padding:12px 14px;
          margin:0 0 12px 0;
          background:#fff;
          page-break-inside:avoid;
          box-shadow:0 0 0 rgba(0,0,0,0);
        }
        .card-header{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;}
        .card-title{font-weight:700;font-size:15px;margin-bottom:6px;}
        .card-level{font-size:12px;color:#666;font-weight:600;}
        .card-meta{font-size:12px;color:#555;margin-bottom:8px;}
        .card-tags{margin-bottom:8px;}
        .tag{display:inline-block;background:#f1f1f1;color:#333;border-radius:3px;padding:3px 6px;font-size:11px;margin-right:6px;}
        .desc{font-size:13px;color:#222;white-space:pre-wrap;margin-top:6px;}
        button,.remove-button,.add-button{display:none !important;}
      </style>
    </head>
    <body>
      <div class="container">
        <h1>My Plan</h1>
        ${itemsHtml}
      </div>
    </body>
  </html>`;

  const w = window.open('', '_blank');
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
  w.focus();
  // small delay gives the new window time to layout before printing on some browsers
  setTimeout(() => {
    try {
      w.print();
      w.close();
    } catch {
      // ignore
    }
  }, 250);
}

// persist 4-year plan
useEffect(() => {
  try { localStorage.setItem('plannerV1', JSON.stringify(planner)); } catch {}
}, [planner]);


  return (
    <>
      {/* Top bar */}
      <header className={styles.topBar}>
        <div className={styles.topBarInner}>
          <img src="/logo.svg" alt="Loomis Chaffee" className={styles.logo} />
        </div>
      </header>

      {/* Drawer toggle button */}
      <button
        type="button"
        className={`${styles.drawerToggle} ${drawerOpen ? styles.drawerToggleOpen : ''}`}
        aria-expanded={drawerOpen}
        aria-controls="course-drawer"
        onClick={() => setDrawerOpen(o => !o)}
        title={drawerOpen ? 'Close course browser' : 'Open course browser'}
      >
        <span aria-hidden="true">{drawerOpen ? '◀' : '▶'}</span>
      </button>

      {/* Left Drawer: Course Browser */}
      <aside
        id="course-drawer"
        className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ''}`}
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
                onChange={e => setQuery(e.target.value)}
                placeholder="Search title or department"
                className={styles.input}
              />
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={includeDescriptions}
                  onChange={e => setIncludeDescriptions(e.target.checked)}
                />
                Search descriptions
              </label>

              {/* Department dropdown — canonical options */}
              <select
                value={deptFilter}
                onChange={e => setDeptFilter(e.target.value as DeptOption)}
                className={styles.select}
              >
                {DEPT_OPTIONS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Tag filters */}
            <div className={styles.tagRow}>
              <span>Tags:</span>
              <label><input type="checkbox" checked={tagGESC} onChange={e => setTagGESC(e.target.checked)} /> GESC</label>
              <label><input type="checkbox" checked={tagPPR} onChange={e => setTagPPR(e.target.checked)} /> PPR</label>
              <label><input type="checkbox" checked={tagCL} onChange={e => setTagCL(e.target.checked)} /> CL</label>
              <span className={styles.tagInfo}>({tagsAvailable.length} tag types found)</span>
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
                    <button className={styles.addButton} onClick={() => assignToSelectedOrList(c)}>Add</button>
                  </div>

                  {/* Subheading: Department • Grades offered */}
                  <div className={styles.cardMeta}>
                    <span>{(() => {
                      const canon = canonicalizeDepartment(c.department);
                      return canon !== 'Other' ? canon : (c.department || '—');
                    })()}</span>
                    {formatGrades(c.grades) ? <> • <span>{formatGrades(c.grades)}</span></> : null}
                  </div>

                  {c.tags?.length ? (
                    <div className={styles.tagContainer}>
                      {c.tags.map(tag => (
                        <span key={tag} className={styles.tagChip}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  {c.description && <p className={styles.description}>{c.description}</p>}

                  {(c.prerequisiteText || c.permissionRequired) && (
                    <div className={styles.prereqBanner}>
                      {c.prerequisiteText ? <span>Prerequisite: {c.prerequisiteText}</span> : null}
                      {c.permissionRequired ? <span>Departmental permission required</span> : null}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* === 4-Year Planner (ADD) === */}
<section className={styles.plannerShell}>
  <div className={styles.plannerHeaderRow}>
    <div className={styles.smallNote}>Here’s your current four year plan.</div>
    <div className={styles.tools}>
      <button className={styles.toolBtn} onClick={clearAllSlots}>Clear all</button>
      <button className={styles.toolBtn} onClick={() => window.print()}>Print / Save PDF</button>
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
  if (isGroup(slot)) {
    return (
      <div
        key={`${year}-${idx}`}
        className={`${styles.slot} ${styles.slotGroup} ${
          slot.size === 3 ? styles.group3 : styles.group2
        } ${isSel ? styles.slotSelected : ''}`}
        onClick={() => setSelected({ year, idx })}
      >
        <div className={styles.bracket} aria-hidden="true" />
        {slot.size === 3 ? (
          <>
            <div className={styles.bracketNotch} style={{ top: '33%' }} aria-hidden="true" />
            <div className={styles.bracketNotch} style={{ top: '66%' }} aria-hidden="true" />
          </>
        ) : (
          <div className={styles.bracketNotch} style={{ top: '50%' }} aria-hidden="true" />
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
                  <div className={styles.slotTitle}>{item.title}</div>
                  <div className={styles.slotMeta}>
                    <span>{item.department || '—'}</span>
                    {item.termLabel ? <> • <span>{item.termLabel}</span></> : null}
                    {item.level ? <> • <span>{item.level}</span></> : null}
                  </div>
                </>
              ) : (
                <span className={styles.slotPlaceholder}>Select course →</span>
              )}
              <button
                className={styles.subClear}
                onClick={(e) => { e.stopPropagation(); clearSub(year, idx, k); }}
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
      className={`${styles.slot} ${isSel ? styles.slotSelected : ''}`}
      onClick={() => setSelected({ year, idx })}
      title="Click to select this slot, then press Add on a course"
    >
      {slot ? (
        <>
          <div className={styles.slotTitle}>{slot.title}</div>
          <div className={styles.slotMeta}>
            <span>{slot.department || '—'}</span>
            {slot.termLabel ? <> • <span>{slot.termLabel}</span></> : null}
            {slot.level ? <> • <span>{slot.level}</span></> : null}
          </div>
        </>
      ) : (
        <span className={styles.slotPlaceholder}>Select course →</span>
      )}
      <button
        className={styles.slotClear}
        onClick={(e) => { e.stopPropagation(); clearSlot(year, idx); }}
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

      {/* Main container — Plan on the page (full width while drawer overlays) */}
      <div className={styles.container}>
        <div>
          <h2 className={styles.heading}>My Plan</h2>
          <div className={styles.planGrid}>
            {plan.map((p, i) => (
              <div key={i} className={styles.planItem}>
                <span>{p.title}</span>
                <button className={styles.removeButton} onClick={() => removeFromPlan(i)}>Remove</button>
              </div>
            ))}
          </div>
          <button className={styles.printButton} onClick={printPlan}>Print / Save PDF</button>
        </div>
      </div>
    </>
  );
}
