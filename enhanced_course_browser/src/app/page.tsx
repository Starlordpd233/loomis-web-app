'use client';

import { useEffect, useMemo, useState } from 'react';

// --- TYPE DEFINITIONS ---
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

type PlanItem = { title: string; note?: string; department?: string; level?: string };
type Plan = Record<string, PlanItem[]>;


// --- HELPER & DATA FETCHING FUNCTIONS (Largely Unchanged) ---
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
  const { termTags } = normalizeTerm(c.term, c.duration);
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
          out.push({ title: rc.title, description: rc.description, department: rc.department || deptName, tags, level, grades: rc.grades, permissionRequired: Array.isArray(rc.prerequisite) ? !!rc.prerequisite[1] : undefined, termLabel });
        }
      } else if (courses && typeof courses === 'object') {
        for (const key of Object.keys(courses)) {
          const list: RawCourse[] = courses[key];
          if (!Array.isArray(list)) continue;
          for (const rc of list) {
            const { tags, level } = deriveTags(rc);
            const { termLabel } = normalizeTerm(rc.term, rc.duration);
            out.push({ title: rc.title, description: rc.description, department: rc.department || deptName || key, tags, level, grades: rc.grades, permissionRequired: Array.isArray(rc.prerequisite) ? !!rc.prerequisite[1] : undefined, termLabel });
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
      return { title: rc.title, description: rc.description, department: rc.department, tags, level, grades: rc.grades, permissionRequired: Array.isArray(rc.prerequisite) ? !!rc.prerequisite[1] : undefined, termLabel };
    });
  }
  const arr = Array.isArray(db?.courses) ? db.courses : [];
  return arr.map((rc: RawCourse) => {
    const { tags, level } = deriveTags(rc);
    const { termLabel } = normalizeTerm(rc.term, rc.duration);
    return { title: rc.title, description: rc.description, department: rc.department, tags, level, grades: rc.grades, permissionRequired: Array.isArray(rc.prerequisite) ? !!rc.prerequisite[1] : undefined, termLabel };
  });
}

// --- ICONS ---
const Icon = ({ path, className = "w-5 h-5" }: { path: string, className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);
const SunIcon = () => <Icon path="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />;
const MoonIcon = () => <Icon path="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />;
const SearchIcon = () => <Icon path="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />;
const PlusIcon = () => <Icon path="M12 4.5v15m7.5-7.5h-15" />;
const XIcon = () => <Icon path="M6 18L18 6M6 6l12 12" />;
const PlannerIcon = () => <Icon path="M3.75 9.75h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5-13.5h16.5a1.5 1.5 0 011.5 1.5v10.5a1.5 1.5 0 01-1.5 1.5H3.75a1.5 1.5 0 01-1.5-1.5V5.25a1.5 1.5 0 011.5-1.5z" />;
const InfoIcon = () => <Icon path="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />;
const TrashIcon = () => <Icon path="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.067-2.09 1.02-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />;
const PrintIcon = () => <Icon path="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6 18.25m0 0l2.146-2.147M12 13.875V18.25m0 0l2.146-2.147M18 13.875l-2.146 2.147M12 13.875l-2.146-2.147M6 18.25h12M6 6h12v8.25H6V6z" />;

// --- DARK MODE HOOK ---
function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialMode = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
    setIsDarkMode(initialMode);
    document.documentElement.classList.toggle('dark', initialMode);
  }, []);
  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', newMode);
      return newMode;
    });
  };
  return { isDarkMode, toggleDarkMode };
}

// --- MAIN PAGE COMPONENT ---
export default function Home() {
  // --- STATE MANAGEMENT ---
  const [courses, setCourses] = useState<Course[]>([]);
  const [query, setQuery] = useState('');
  const [includeDescriptions] = useState(false);
  const [deptFilter, setDeptFilter] = useState<string>('All');
  const [tagFilters, setTagFilters] = useState<Record<string, boolean>>({
    GESC: false, PPR: false, CL: false, ADV: false, YEAR: false, HALF: false
  });
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // New Planner State
  const [plan, setPlan] = useState<Plan>(() => {
    if (typeof window === 'undefined') return { 'Uncategorized': [] };
    try {
      const savedPlan = JSON.parse(localStorage.getItem('academicPlan') || '{"Uncategorized": []}');
      return Object.keys(savedPlan).length > 0 ? savedPlan : { 'Uncategorized': [] };
    } catch {
      return { 'Uncategorized': [] };
    }
  });

  const [quickViewCourse, setQuickViewCourse] = useState<Course | null>(null);
  
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  // --- DATA FETCHING & LOCAL STORAGE EFFECTS ---
  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await fetchFirst<any>(['/catalog.json', '/catalogdbfinal.json', '/course_catalog_full.json']);
      if (!data) {
        setError('Could not load course catalog. Please try refreshing.');
        setLoading(false);
        return;
      }
      setCourses(flattenDatabase(data));
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    localStorage.setItem('academicPlan', JSON.stringify(plan));
  }, [plan]);
  
  const totalCoursesInPlan = useMemo(() => Object.values(plan).reduce((acc, term) => acc + term.length, 0), [plan]);

  // --- COMPUTED VALUES (MEMOIZED) ---
  const departments = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => c.department && set.add(c.department));
    return ['All', ...Array.from(set).sort()];
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter((c) => {
      const activeTags = Object.entries(tagFilters).filter(([, v]) => v).map(([k]) => k);
      const matchesTags = activeTags.every(tag => c.tags?.includes(tag));
      const matchesDept = deptFilter === 'All' || (c.department || '').toLowerCase() === deptFilter.toLowerCase();
      const haystacks = [(c.title || '').toLowerCase(), (c.department || '').toLowerCase(), ...(includeDescriptions ? [(c.description || '').toLowerCase()] : [])];
      const matchesQuery = q === '' || haystacks.some((h) => h.includes(q));
      return matchesDept && matchesTags && matchesQuery;
    });
  }, [courses, query, includeDescriptions, deptFilter, tagFilters]);
  
  // --- EVENT HANDLERS & ACTIONS ---
  const handleTagToggle = (tag: string) => {
    setTagFilters(prev => ({ ...prev, [tag]: !prev[tag] }));
  };

  const addToPlan = (course: Course, term: string = 'Uncategorized') => {
    setPlan(prev => {
      const newPlan = { ...prev };
      if (!newPlan[term]) newPlan[term] = [];
      // Avoid duplicates in the same term
      if (newPlan[term].some(p => p.title === course.title)) return prev;
      newPlan[term] = [...newPlan[term], { title: course.title, department: course.department, level: course.level }];
      return newPlan;
    });
  };

  // --- UI COMPONENTS ---

  const CourseCard = ({ course }: { course: Course }) => {
    return (
      <div className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 pr-2">
            {course.title}
          </h3>
          <button
            onClick={() => addToPlan(course)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold rounded-md transition-transform transform hover:scale-105"
          >
            <PlusIcon />
            <span>Add to Plan</span>
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 my-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-medium text-slate-600 dark:text-slate-300">{course.department || '—'}</span>
          {course.termLabel && <span>• {course.termLabel}</span>}
          {course.level && <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full font-medium">{course.level}</span>}
        </div>
        {course.description && (
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2 mt-2">
            {course.description}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between">
            <div className="flex flex-wrap gap-1.5">
              {course.tags?.map(tag => (
                <span key={tag} className={`px-2 py-0.5 text-xs font-medium rounded-full ${ tag === 'GESC' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' : tag === 'PPR' ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300' : tag === 'CL' ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300' }`}>{tag}</span>
              ))}
            </div>
            <button onClick={() => setQuickViewCourse(course)} className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1">
                <InfoIcon /> Details
            </button>
        </div>
      </div>
    );
  };
  
  const PlanPanel = () => {
      const [newTermName, setNewTermName] = useState('');
  
      const addTerm = () => {
          if (newTermName && !plan[newTermName]) {
              setPlan(prev => ({ ...prev, [newTermName]: [] }));
              setNewTermName('');
          }
      };
  
      const removeTerm = (term: string) => {
          setPlan(prev => {
              const newPlan = { ...prev };
              if (newPlan[term].length > 0) {
                  newPlan['Uncategorized'] = [...(newPlan['Uncategorized'] || []), ...newPlan[term]];
              }
              delete newPlan[term];
              return newPlan;
          });
      };
  
      const removeFromPlan = (term: string, index: number) => {
          setPlan(prev => {
              const newPlan = { ...prev };
              newPlan[term] = newPlan[term].filter((_, i) => i !== index);
              return newPlan;
          });
      };
      
      const printPlan = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        printWindow.document.write('<html><head><title>My Academic Plan</title>');
        printWindow.document.write('<style>body{font-family: sans-serif; padding: 2rem;} h1{font-size: 1.5rem; margin-bottom: 1rem;} h2{font-size: 1.2rem; margin-top: 1.5rem; border-bottom: 1px solid #ccc; padding-bottom: 0.5rem;} ul{list-style: none; padding: 0;} li{background: #f4f4f4; padding: 0.75rem; border-radius: 4px; margin-bottom: 0.5rem;}</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write('<h1>My Academic Plan</h1>');
        Object.entries(plan).forEach(([term, courses]) => {
            printWindow.document.write(`<h2>${term} (${courses.length} courses)</h2>`);
            if (courses.length > 0) {
                printWindow.document.write('<ul>');
                courses.forEach(course => printWindow.document.write(`<li>${course.title}</li>`));
                printWindow.document.write('</ul>');
            } else {
                printWindow.document.write('<p>No courses in this term.</p>');
            }
        });
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
      };
  
      return (
          <div className="w-full lg:w-1/3 lg:max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-l border-slate-200 dark:border-slate-800 shadow-lg">
              <div className="flex flex-col h-full">
                  <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
                      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">My Academic Path</h2>
                      <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{totalCoursesInPlan} {totalCoursesInPlan === 1 ? 'course' : 'courses'}</span>
                          {totalCoursesInPlan > 0 && <button onClick={printPlan} className="p-2 text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400"><PrintIcon /></button>}
                      </div>
                  </header>
                  <div className="flex-grow p-4 overflow-y-auto space-y-6">
                      {totalCoursesInPlan === 0 ? (
                          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                              <div className="w-12 h-12 mx-auto text-slate-400"><PlannerIcon /></div>
                              <p className="mt-2 font-semibold">Your plan is empty.</p>
                              <p className="text-sm">Add courses from the catalog to get started.</p>
                          </div>
                      ) : (
                          Object.entries(plan).map(([term, courses]) => (
                              <div key={term}>
                                  <div className="flex justify-between items-center mb-2">
                                      <h3 className="font-semibold text-slate-700 dark:text-slate-300">{term}</h3>
                                      {term !== 'Uncategorized' && <button onClick={() => removeTerm(term)} className="text-slate-500 hover:text-red-500"><TrashIcon /></button>}
                                  </div>
                                  <div className="space-y-2">
                                      {courses.map((item, index) => (
                                          <div key={index} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-2 rounded-md">
                                              <span className="text-sm text-slate-800 dark:text-slate-200">{item.title}</span>
                                              <button onClick={() => removeFromPlan(term, index)} className="text-slate-500 hover:text-red-500"><XIcon /></button>
                                          </div>
                                      ))}
                                      {courses.length === 0 && <p className="text-xs text-slate-400 italic">No courses in this term.</p>}
                                  </div>
                              </div>
                          ))
                      )}
                  </div>
                  <footer className="p-4 border-t border-slate-200 dark:border-slate-800">
                      <div className="flex gap-2">
                          <input type="text" value={newTermName} onChange={e => setNewTermName(e.target.value)} placeholder="New term name (e.g., Fall 2025)" className="flex-grow px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-sky-500 focus:outline-none"/>
                          <button onClick={addTerm} className="px-4 py-2 text-sm font-semibold text-white bg-sky-600 rounded-md hover:bg-sky-700 disabled:opacity-50" disabled={!newTermName}>Add Term</button>
                      </div>
                  </footer>
              </div>
          </div>
      );
  };
  
  const QuickViewModal = () => {
    if (!quickViewCourse) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="absolute inset-0 bg-black/60" onClick={() => setQuickViewCourse(null)} />
        <div className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden animate-slide-up">
          <header className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{quickViewCourse.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{quickViewCourse.department}</p>
          </header>
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{quickViewCourse.description || "No description available."}</p>
            <div className="mt-6 space-y-3">
              <div className="flex items-center"><strong className="w-24 text-sm text-slate-500 dark:text-slate-400">Level</strong><span className="text-sm">{quickViewCourse.level || 'N/A'}</span></div>
              <div className="flex items-center"><strong className="w-24 text-sm text-slate-500 dark:text-slate-400">Term</strong><span className="text-sm">{quickViewCourse.termLabel || 'N/A'}</span></div>
              <div className="flex items-center"><strong className="w-24 text-sm text-slate-500 dark:text-slate-400">Tags</strong><div className="flex flex-wrap gap-2">{quickViewCourse.tags?.map(t => <span key={t} className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 dark:bg-slate-700">{t}</span>)}</div></div>
              {quickViewCourse.permissionRequired && <div className="flex items-center"><strong className="w-24 text-sm text-slate-500 dark:text-slate-400">Note</strong><span className="text-sm font-semibold text-amber-600 dark:text-amber-400">Permission Required</span></div>}
            </div>
          </div>
          <footer className="p-4 flex justify-end gap-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
            <button onClick={() => setQuickViewCourse(null)} className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600">Close</button>
            <button onClick={() => { addToPlan(quickViewCourse); setQuickViewCourse(null); }} className="px-4 py-2 text-sm font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700">Add to Plan</button>
          </footer>
        </div>
      </div>
    );
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Enhanced Course Browser</h1>
              {loading && <span className="text-sm text-slate-500">Loading...</span>}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={toggleDarkMode} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Toggle dark mode">
                {isDarkMode ? <SunIcon /> : <MoonIcon />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-grow flex">
        {/* Main Content (Course Browser) */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white text-balance">
              Find Your Next Favorite Course
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-300">
              Search, filter, and explore the complete catalog to build your ideal academic path.
            </p>
          </div>
          
          {/* Filters & Search Section */}
          <div className="p-4 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm mb-8 sticky top-20 z-30 backdrop-blur-sm">
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><SearchIcon /></div>
              <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by title, department..." className="w-full pl-12 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"/>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="w-full sm:w-auto px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm">
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <div className="flex flex-wrap gap-2">
                {Object.keys(tagFilters).map(tag => (
                  <button key={tag} onClick={() => handleTagToggle(tag)} className={`px-3 py-1 text-xs font-semibold rounded-full border transition ${tagFilters[tag] ? 'bg-sky-600 border-sky-600 text-white' : 'bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'}`}>{tag}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Course Grid */}
          {loading ? (
            <div className="text-center py-10">Loading courses...</div>
          ) : filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {filteredCourses.map((course, i) => <CourseCard key={course.title + i} course={course} />)}
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500">
              <h3 className="text-xl font-semibold">No Courses Found</h3>
              <p>Try adjusting your search or filters.</p>
            </div>
          )}
        </main>

        {/* Right Panel (Planner) */}
        <aside className="hidden lg:block w-1/3 max-w-sm border-l border-slate-200 dark:border-slate-800">
          <PlanPanel />
        </aside>
      </div>

      {/* Modals & Drawers */}
      <QuickViewModal />
    </div>
  );
}