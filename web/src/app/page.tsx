'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './page.module.css';

type RawCourse = {
  title: string;
  description?: string;
  department?: string;
  rigor?: number;
  gesc?: boolean;
  ppr?: boolean;
  term?: string;
  duration?: string;
  grades?: number[];
  offered_in_25?: boolean;
  prerequisite?: [string | null, boolean];
};

type Course = {
  title: string;
  description?: string;
  department?: string;
  tags: string[];
  level?: string;
  grades?: number[];
  permissionRequired?: boolean;
  termLabel?: string;
};

type PlanItem = { title: string };

async function fetchFirst<T>(paths: string[]): Promise<T | null> {
  for (const p of paths) {
    try {
      const r = await fetch(p);
      if (r.ok) return (await r.json()) as T;
    } catch {}
  }
  return null;
}

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
  if (titleCL || (c.rigor ?? 1) >= 3) {
    tags.push('CL');
    level = 'CL';
  } else if ((c.rigor ?? 1) === 2) {
    tags.push('ADV');
    level = 'ADV';
  }

  const { termLabel, termTags } = normalizeTerm(c.term, c.duration);
  tags.push(...termTags);

  return { tags: Array.from(new Set(tags)), level };
}

function flattenDatabase(db: any): Course[] {
  const out: Course[] = [];

  if (db && Array.isArray(db.departments)) {
    for (const deptBlock of db.departments) {
      const deptName: string | undefined = deptBlock.department;
      const courses = deptBlock.courses;

      if (Array.isArray(courses)) {
        for (const rc of courses as RawCourse[]) {
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
            termLabel
          });
        }
      } else if (courses && typeof courses === 'object') {
        for (const key of Object.keys(courses)) {
          const list: RawCourse[] = courses[key];
          if (!Array.isArray(list)) continue;
          for (const rc of list) {
            const { tags, level } = deriveTags(rc);
            const { termLabel } = normalizeTerm(rc.term, rc.duration);
            out.push({
              title: rc.title,
              description: rc.description,
              department: rc.department || deptName || key,
              tags,
              level,
              grades: rc.grades,
              permissionRequired: Array.isArray(rc.prerequisite) ? !!rc.prerequisite[1] : undefined,
              termLabel
            });
          }
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
        termLabel
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
      termLabel
    };
  });
}

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [query, setQuery] = useState('');
  const [includeDescriptions, setIncludeDescriptions] = useState(false);
  const [deptFilter, setDeptFilter] = useState<string>('All');
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<PlanItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('plan') || '[]');
    } catch {
      return [];
    }
  });

  const [tagGESC, setTagGESC] = useState(false);
  const [tagPPR, setTagPPR] = useState(false);
  const [tagCL, setTagCL] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await fetchFirst<any>(['/catalog.json', '/catalogdbfinal.json', '/course_catalog_full.json']);
      if (!data) {
        setError('Could not load catalog from /public');
        return;
      }
      const flat = flattenDatabase(data);
      setCourses(flat);
    })();
  }, []);

  useEffect(() => {
    localStorage.setItem('plan', JSON.stringify(plan));
  }, [plan]);

  const departments = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => c.department && set.add(c.department));
    return ['All', ...Array.from(set).sort()];
  }, [courses]);

  const tagsAvailable = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => c.tags?.forEach((t) => set.add(t)));
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
    return courses.filter((c) => {
      const matchesDept = deptFilter === 'All' || (c.department || '').toLowerCase() === deptFilter.toLowerCase();
      const matchesTags = needTag(c);
      const haystacks = [
        (c.title || '').toLowerCase(),
        (c.department || '').toLowerCase(),
        ...(includeDescriptions ? [(c.description || '').toLowerCase()] : [])
      ];
      const matchesQuery = q === '' || haystacks.some((h) => h.includes(q));
      return matchesDept && matchesTags && matchesQuery;
    });
  }, [courses, query, includeDescriptions, deptFilter, tagGESC, tagPPR, tagCL]);

  function addToPlan(c: Course) {
    setPlan((prev) => [...prev, { title: c.title }]);
  }
  function removeFromPlan(i: number) {
    setPlan((prev) => prev.filter((_, idx) => idx !== i));
  }

function printPlan(): void {
  if (typeof window === 'undefined') return;
  
  const planElement = document.getElementById('plan');
  if (!planElement) return;
  
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  
  printWindow.document.write(`
    <html>
      <head>
        <title>My Plan</title>
        <style>
          @page {
            size: A4;
            margin: 0.5in;
          }
          body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.3;
            margin: 0;
            padding: 20px;
            max-height: calc(11in - 1in);
            overflow: hidden;
          }
          .plan-item {
            margin-bottom: 8px;
            padding: 4px 0;
            border-bottom: 1px solid #eee;
          }
          button { display: none; }
        </style>
      </head>
      <body>
        <h2>My Plan</h2>
        <div class="plan-content">
          ${Array.from(planElement.children).map((item: Element) => {
            const titleElement = item.querySelector('span');
            const title = titleElement?.textContent || '';
            return `<div class="plan-item">${title}</div>`;
          }).join('')}
        </div>
      </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
}

  return (
    <div className={styles.container}>
      <div>
        <h1 className={styles.heading}>Course Browser</h1>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.filters}>
          <div className={styles.searchRow}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title or department"
              className={styles.input}
            />
            <label className={styles.checkboxLabel}>
              <input type="checkbox" checked={includeDescriptions} onChange={(e) => setIncludeDescriptions(e.target.checked)} />
              Search descriptions
            </label>
            <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className={styles.select}>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.tagRow}>
            <span>Tags:</span>
            <label><input type="checkbox" checked={tagGESC} onChange={(e) => setTagGESC(e.target.checked)} /> GESC</label>
            <label><input type="checkbox" checked={tagPPR} onChange={(e) => setTagPPR(e.target.checked)} /> PPR</label>
            <label><input type="checkbox" checked={tagCL} onChange={(e) => setTagCL(e.target.checked)} /> CL</label>
            <span className={styles.tagInfo}>({tagsAvailable.length} tag types found)</span>
          </div>
        </div>

        <div className={styles.resultInfo}>
          Showing {filtered.length} of {courses.length} courses
        </div>

        <div className={styles.cardGrid}>
          {filtered.map((c, i) => (
            <div key={c.title + i} className={styles.card}>
              <div className={styles.cardHeader}>
                <strong>{c.title}</strong>
                <button className={styles.addButton} onClick={() => addToPlan(c)}>Add</button>
              </div>
              <div className={styles.cardMeta}>
                <span>{c.department || '—'}</span>
                {c.termLabel ? <> • <span>{c.termLabel}</span></> : null}
                {c.level ? <> • <span>{c.level}</span></> : null}
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

              {c.description && <p className={styles.description}>{c.description}</p>}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className={styles.heading}>My Plan</h2>
        <div id="plan" className={styles.planGrid}>
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
  );
}
