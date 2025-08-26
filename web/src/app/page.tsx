'use client';

import { useEffect, useMemo, useState } from 'react';

type RawCourse = {
  title: string;
  description?: string;
  department?: string;
  rigor?: number;         // 1,2,3
  gesc?: boolean;
  ppr?: boolean;
  term?: string;          // e.g., "year course", "term course"
  duration?: string;      // e.g., "full-year", "term", "two terms", "half course"
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
};

type PlanItem = { title: string };

async function fetchFirst<T>(paths: string[]): Promise<T | null> {
  for (const p of paths) {
    try { const r = await fetch(p); if (r.ok) return (await r.json()) as T; } catch {}
  }
  return null;
}

// --- helpers to derive tags/labels from your schema ---
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

  // level / rigor
  let level: string | undefined;
  const titleCL = (c.title || '').trim().toUpperCase().startsWith('CL ');
  if (titleCL || (c.rigor ?? 1) >= 3) { tags.push('CL'); level = 'CL'; }
  else if ((c.rigor ?? 1) === 2) { tags.push('ADV'); level = 'ADV'; }

  // duration/term tags
  const { termLabel, termTags } = normalizeTerm(c.term, c.duration);
  tags.push(...termTags);

  return { tags: Array.from(new Set(tags)), level };
}

// flatten your DB into a simple course array
function flattenDatabase(db: any): Course[] {
  const out: Course[] = [];

  // case: { departments: [ { department, courses }, ... ] }
  if (db && Array.isArray(db.departments)) {
    for (const deptBlock of db.departments) {
      const deptName: string | undefined = deptBlock.department;

      // courses can be an array OR an object (Languages has { Arabic: [...], ... })
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
        // object keyed by sub-language/category
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

  // fallback: simple arrays you used earlier
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
    try { return JSON.parse(localStorage.getItem('plan') || '[]'); } catch { return []; }
  });

  // NEW: tag filter state (simple checkboxes)
  const [tagGESC, setTagGESC] = useState(false);
  const [tagPPR, setTagPPR] = useState(false);
  const [tagCL, setTagCL] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await fetchFirst<any>([
        '/catalog.json',
        '/catalogdbfinal.json',
        '/course_catalog_full.json'
      ]);
      if (!data) { setError('Could not load catalog from /public'); return; }
      const flat = flattenDatabase(data);
      setCourses(flat);
    })();
  }, []);

  useEffect(() => {
    localStorage.setItem('plan', JSON.stringify(plan));
  }, [plan]);

  const departments = useMemo(() => {
    const set = new Set<string>();
    courses.forEach(c => c.department && set.add(c.department));
    return ['All', ...Array.from(set).sort()];
  }, [courses]);

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
      // dept filter
      const matchesDept = deptFilter === 'All' || (c.department || '').toLowerCase() === deptFilter.toLowerCase();
      // tag filters
      const matchesTags = needTag(c);
      // text search (title + department; descriptions optional)
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

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, padding: 16, maxWidth: 1200, margin: '0 auto' }}>
      {/* Left: Browser */}
      <div>
        <h1>Course Browser</h1>
        {error && (
          <div style={{ background: '#fff3cd', border: '1px solid #ffeeba', padding: 8, borderRadius: 8, marginBottom: 8 }}>
            {error}
          </div>
        )}

        {/* Filters */}
        <div style={{ display: 'grid', gap: 8, marginBottom: 8 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="search title or department"
              style={{ flex: 1, padding: 8 }}
            />
            <label style={{ display: 'flex', gap: 6, fontSize: 12 }}>
              <input
                type="checkbox"
                checked={includeDescriptions}
                onChange={e => setIncludeDescriptions(e.target.checked)}
              />
              search descriptions
            </label>
            <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} style={{ padding: 8 }}>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Tag filters */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, opacity: 0.8 }}>Tags:</span>
            <label style={{ display: 'flex', gap: 6, fontSize: 12 }}>
              <input type="checkbox" checked={tagGESC} onChange={e => setTagGESC(e.target.checked)} /> GESC
            </label>
            <label style={{ display: 'flex', gap: 6, fontSize: 12 }}>
              <input type="checkbox" checked={tagPPR} onChange={e => setTagPPR(e.target.checked)} /> PPR
            </label>
            <label style={{ display: 'flex', gap: 6, fontSize: 12 }}>
              <input type="checkbox" checked={tagCL} onChange={e => setTagCL(e.target.checked)} /> CL
            </label>
            <span style={{ fontSize: 12, opacity: 0.6 }}>
              ({tagsAvailable.length} tag types found)
            </span>
          </div>
        </div>

        <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 8 }}>
          Showing {filtered.length} of {courses.length} courses
        </div>

        <div style={{ display: 'grid', gap: 8 }}>
          {filtered.map((c, i) => (
            <div key={c.title + i} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                <strong>{c.title}</strong>
                <button onClick={() => addToPlan(c)}>Add</button>
              </div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>
                <span>{c.department || '—'}</span>
                {c.termLabel ? <> {' • '}<span>{c.termLabel}</span></> : null}
                {c.level ? <> {' • '}<span>{c.level}</span></> : null}
              </div>

              {/* tag chips */}
              {c.tags?.length ? (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                  {c.tags.map(tag => (
                    <span key={tag} style={{ fontSize: 11, border: '1px solid #ccc', borderRadius: 999, padding: '2px 8px' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}

              {c.description && <p style={{ marginTop: 8 }}>{c.description}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Right: Plan */}
      <div>
        <h2>My Plan</h2>
        <div style={{ display: 'grid', gap: 8 }}>
          {plan.map((p, i) => (
            <div key={i} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 8, display: 'flex', justifyContent: 'space-between' }}>
              <span>{p.title}</span>
              <button onClick={() => removeFromPlan(i)}>Remove</button>
            </div>
          ))}
        </div>
        <button style={{ marginTop: 12 }} onClick={() => window.print()}>Print / Save PDF</button>
      </div>
    </div>
  );
}
