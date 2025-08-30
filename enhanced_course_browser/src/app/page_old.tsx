'use client';

import { useEffect, useMemo, useState } from 'react';

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

type FilterPreset = {
  name: string;
  query: string;
  includeDescriptions: boolean;
  deptFilter: string;
  tags: Record<string, boolean>;
  view: 'grid' | 'list';
};

// Dark mode hook
function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return { isDarkMode, toggleDarkMode };
}

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

function SearchIcon() {
  return (
    <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function PrintIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-9 0h10" />
    </svg>
  );
}

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [query, setQuery] = useState('');
  const [includeDescriptions, setIncludeDescriptions] = useState(false);
  const [deptFilter, setDeptFilter] = useState<string>('All');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
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
  const [tagADV, setTagADV] = useState(false);
  const [tagYEAR, setTagYEAR] = useState(false);
  const [tagHALF, setTagHALF] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>(() => {
    if (typeof window === 'undefined') return 'grid';
    const saved = localStorage.getItem('view');
    return saved === 'list' ? 'list' : 'grid';
  });
  const [filterPresets, setFilterPresets] = useState<FilterPreset[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('filterPresets') || '[]');
    } catch {
      return [];
    }
  });
  const [newPresetName, setNewPresetName] = useState('');
  const [compareSelection, setCompareSelection] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [groupBy, setGroupBy] = useState<'none' | 'department' | 'level'>('none');

  const { isDarkMode, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await fetchFirst<any>(['/catalog.json', '/catalogdbfinal.json', '/course_catalog_full.json']);
      if (!data) {
        setError('Could not load catalog from /public');
        setLoading(false);
        return;
      }
      const flat = flattenDatabase(data);
      setCourses(flat);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    localStorage.setItem('plan', JSON.stringify(plan));
  }, [plan]);

  useEffect(() => {
    localStorage.setItem('filterPresets', JSON.stringify(filterPresets));
  }, [filterPresets]);

  useEffect(() => {
    localStorage.setItem('view', view);
  }, [view]);

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
      if (tagADV && !c.tags?.includes('ADV')) return false;
      if (tagYEAR && !c.tags?.includes('YEAR')) return false;
      if (tagHALF && !c.tags?.includes('HALF')) return false;
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
  }, [courses, query, includeDescriptions, deptFilter, tagGESC, tagPPR, tagCL, tagADV, tagYEAR, tagHALF]);

  const compareCourses = useMemo(() => {
    return courses.filter((c) => compareSelection.includes(c.title));
  }, [courses, compareSelection]);

  function toggleCompare(title: string) {
    setCompareSelection((prev) => {
      const exists = prev.includes(title);
      if (exists) return prev.filter((t) => t !== title);
      if (prev.length >= 3) return prev; // limit to 3
      return [...prev, title];
    });
  }

  function addToPlan(c: Course) {
    setPlan((prev) => [...prev, { title: c.title, department: c.department, level: c.level }]);
  }
  
  function removeFromPlan(i: number) {
    setPlan((prev) => prev.filter((_, idx) => idx !== i));
  }

  function printPlan(): void {
    if (typeof window === 'undefined') return;
    
    const planElement = document.getElementById('plan');
    if (!planElement) return;
    
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
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
              font-size: 12px;
              line-height: 1.4;
              margin: 0;
              padding: 20px;
              max-height: calc(11in - 1in);
              overflow: hidden;
            }
            h2 {
              color: #1f2937;
              margin-bottom: 16px;
              font-size: 18px;
            }
            .plan-item {
              margin-bottom: 10px;
              padding: 8px 12px;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              background: #f9fafb;
            }
            button { display: none; }
          </style>
        </head>
        <body>
          <h2>My Course Plan</h2>
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

  const activeFiltersCount = [tagGESC, tagPPR, tagCL, tagADV, tagYEAR, tagHALF].filter(Boolean).length + (deptFilter !== 'All' ? 1 : 0);

  function savePreset() {
    const name = newPresetName.trim();
    if (!name) return;
    const preset: FilterPreset = {
      name,
      query,
      includeDescriptions,
      deptFilter,
      view,
      tags: { GESC: tagGESC, PPR: tagPPR, CL: tagCL, ADV: tagADV, YEAR: tagYEAR, HALF: tagHALF },
    };
    setFilterPresets((prev) => {
      const withoutDup = prev.filter((p) => p.name !== name);
      return [...withoutDup, preset];
    });
    setNewPresetName('');
  }

  function applyPreset(name: string) {
    const p = filterPresets.find((x) => x.name === name);
    if (!p) return;
    setQuery(p.query);
    setIncludeDescriptions(p.includeDescriptions);
    setDeptFilter(p.deptFilter);
    setView(p.view);
    setTagGESC(!!p.tags.GESC);
    setTagPPR(!!p.tags.PPR);
    setTagCL(!!p.tags.CL);
    setTagADV(!!p.tags.ADV);
    setTagYEAR(!!p.tags.YEAR);
    setTagHALF(!!p.tags.HALF);
  }

  function deletePreset(name: string) {
    setFilterPresets((prev) => prev.filter((p) => p.name !== name));
  }

  function updatePlanNote(index: number, note: string) {
    setPlan((prev) => prev.map((p, i) => (i === index ? { ...p, note } : p)));
  }

  function groupedPlan() {
    if (groupBy === 'none') return null;
    const groups: Record<string, Array<{ item: PlanItem; index: number }>> = {};
    plan.forEach((p, i) => {
      const label = groupBy === 'department' ? (p.department || 'Other') : (p.level || 'Other');
      if (!groups[label]) groups[label] = [];
      groups[label].push({ item: p, index: i });
    });
    return groups;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Enhanced Header */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <BookmarkIcon />
                <h1 className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                  Course Browser
                </h1>
              </div>
              {loading && (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Loading courses...</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <span>Showing {filtered.length} of {courses.length} courses</span>
                {plan.length > 0 && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                    {plan.length} in plan
                  </span>
                )}
              </div>
              
              {/* Theme Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <SunIcon /> : <MoonIcon />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-surface pattern-grid border-b border-gray-200/60 dark:border-gray-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Design your academic path</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-300">Explore, compare, and plan courses with clarity and style.</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex p-1 bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-lg backdrop-blur supports-[backdrop-filter]:bg-white/60">
                <button onClick={() => setView('grid')} className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm ${view === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                  <GridIcon /> Grid
                </button>
                <button onClick={() => setView('list')} className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm ${view === 'list' ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                  <ListIcon /> List
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error loading courses
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-3 space-y-6">
            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <select onChange={(e) => applyPreset(e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                    <option value="">Apply preset...</option>
                    {filterPresets.map((p) => (
                      <option key={p.name} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                  {filterPresets.length > 0 && (
                    <button onClick={() => setFilterPresets([])} className="px-3 py-2 text-xs rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">Clear presets</button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    placeholder="Save current filters as..."
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                  <button onClick={savePreset} className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700">Save</button>
                </div>
              </div>
              {/* Search Bar */}
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search courses by title or department..."
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Quick Filters Row */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    showFilters
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <FilterIcon />
                  <span>Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeDescriptions}
                    onChange={(e) => setIncludeDescriptions(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Search descriptions</span>
                </label>

                {/* Quick Tag Chips */}
                {[
                  { key: 'GESC', value: tagGESC, setter: setTagGESC },
                  { key: 'PPR', value: tagPPR, setter: setTagPPR },
                  { key: 'CL', value: tagCL, setter: setTagCL },
                  { key: 'ADV', value: tagADV, setter: setTagADV },
                  { key: 'YEAR', value: tagYEAR, setter: setTagYEAR },
                  { key: 'HALF', value: tagHALF, setter: setTagHALF },
                ].map(({ key, value, setter }) => (
                  <button
                    key={key}
                    onClick={() => setter(!value)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition ${
                      value
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-gray-50 dark:bg-gray-700/60 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {key}
                  </button>
                ))}
              </div>

              {/* Expanded Filters */}
              {showFilters && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 animate-slide-up">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Department Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Department
                      </label>
                      <select
                        value={deptFilter}
                        onChange={(e) => setDeptFilter(e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {departments.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Tag Filters */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Course Tags
                      </label>
                      <div className="space-y-2">
                        {[
                          { key: 'GESC', value: tagGESC, setter: setTagGESC, label: 'GESC' },
                          { key: 'PPR', value: tagPPR, setter: setTagPPR, label: 'PPR' },
                          { key: 'CL', value: tagCL, setter: setTagCL, label: 'CL' }
                        ].map(({ key, value, setter, label }) => (
                          <label key={key} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) => setter(e.target.checked)}
                              className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Available Tags Info */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Statistics
                      </label>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <div>{tagsAvailable.length} tag types available</div>
                        <div className="mt-1 text-xs">
                          {tagsAvailable.slice(0, 5).join(', ')}
                          {tagsAvailable.length > 5 && '...'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Course Grid */}
            <div className="space-y-4">
              {loading ? (
                <div className="grid gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                      <div className="animate-pulse">
                        <div className="flex justify-between items-start mb-3">
                          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                        </div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
                        <div className="flex gap-2 mb-3">
                          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`${view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4' : 'grid gap-4'}`}>
                  {filtered.map((c, i) => (
                    <div
                      key={c.title + i}
                      className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 animate-fade-in"
                    >
                      {/* Course Header */}
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-4">
                          {c.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleCompare(c.title)}
                            className={`flex items-center space-x-1 px-3 py-1.5 text-sm font-medium rounded-lg border transition ${
                              compareSelection.includes(c.title)
                                ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-600 text-blue-700 dark:text-blue-300'
                                : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                            }`}
                          >
                            <CheckIcon />
                            <span>Compare</span>
                          </button>
                          <button
                            onClick={() => addToPlan(c)}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                          >
                            <PlusIcon />
                            <span>Add</span>
                          </button>
                        </div>
                      </div>

                      {/* Course Meta */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-3 text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">{c.department || '—'}</span>
                        {c.termLabel && (
                          <span className="flex items-center">
                            <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                            {c.termLabel}
                          </span>
                        )}
                        {c.level && (
                          <span className="flex items-center">
                            <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-medium">
                              {c.level}
                            </span>
                          </span>
                        )}
                        {c.permissionRequired && (
                          <span className="flex items-center text-orange-600 dark:text-orange-400">
                            <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                            Permission Required
                          </span>
                        )}
                      </div>

                      {/* Tags */}
                      {c.tags?.length ? (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {c.tags.map((tag) => (
                            <span
                              key={tag}
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                tag === 'GESC'
                                  ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                                  : tag === 'PPR'
                                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                                  : tag === 'CL'
                                  ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      {/* Description */}
                      {c.description && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-3">
                          {c.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {!loading && filtered.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 dark:text-gray-500 mb-2">
                    <SearchIcon />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No courses found</h3>
                  <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - My Plan */}
          <div className="xl:col-span-1">
            <div className="sticky top-24 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Plan</h2>
                {plan.length > 0 && (
                  <button
                    onClick={printPlan}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-all duration-200"
                  >
                    <PrintIcon />
                    <span className="hidden sm:inline">Export</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 mb-3">
                <label className="text-sm text-gray-600 dark:text-gray-300">Group by</label>
                <select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value as 'none' | 'department' | 'level')}
                  className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
                >
                  <option value="none">None</option>
                  <option value="department">Department</option>
                  <option value="level">Level</option>
                </select>
              </div>

              <div id="plan" className="space-y-3">
                {plan.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 dark:text-gray-500 mb-2">
                      <BookmarkIcon />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No courses added yet. Click "Add" on any course to get started.
                    </p>
                  </div>
                ) : (
                  (() => {
                    const groups = groupedPlan();
                    if (!groups) {
                      return (
                        <>
                          {plan.map((p, i) => (
                            <div key={i} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 group animate-slide-up">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-900 dark:text-white font-medium pr-2">{p.title}</span>
                                <div className="flex items-center gap-2">
                                  <button onClick={() => removeFromPlan(i)} className="flex items-center justify-center p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200">
                                    <XIcon />
                                  </button>
                                </div>
                              </div>
                              <div className="mt-2">
                                <textarea
                                  value={p.note || ''}
                                  onChange={(e) => updatePlanNote(i, e.target.value)}
                                  placeholder="Add a note (optional)"
                                  className="w-full text-sm px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                  rows={2}
                                />
                              </div>
                            </div>
                          ))}
                        </>
                      );
                    }
                    return (
                      <div className="space-y-4">
                        {Object.entries(groups).map(([label, entries]) => (
                          <div key={label}>
                            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">{label}</div>
                            <div className="space-y-3">
                              {entries.map(({ item, index }) => (
                                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 group">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-900 dark:text-white font-medium pr-2">{item.title}</span>
                                    <button onClick={() => removeFromPlan(index)} className="flex items-center justify-center p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200">
                                      <XIcon />
                                    </button>
                                  </div>
                                  <div className="mt-2">
                                    <textarea
                                      value={item.note || ''}
                                      onChange={(e) => updatePlanNote(index, e.target.value)}
                                      placeholder="Add a note (optional)"
                                      className="w-full text-sm px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                      rows={2}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()
                )}
              </div>

              {plan.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {plan.length} course{plan.length !== 1 ? 's' : ''} selected
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Compare Bar */}
      {compareSelection.length > 0 && (
        <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center">
          <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-full">
            <span className="text-sm text-gray-700 dark:text-gray-300">{compareSelection.length} selected</span>
            <button onClick={() => setShowCompareModal(true)} className="px-3 py-1.5 text-sm rounded-full bg-blue-600 text-white hover:bg-blue-700">Compare</button>
            <button onClick={() => setCompareSelection([])} className="px-3 py-1.5 text-sm rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">Clear</button>
          </div>
        </div>
      )}

      {/* Compare Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCompareModal(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-5xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Compare Courses</h3>
                <button onClick={() => setShowCompareModal(false)} className="p-1 text-gray-500 hover:text-gray-900 dark:hover:text-white">
                  <XIcon />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                  <thead className="bg-gray-50 dark:bg-gray-800/60">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Field</th>
                      {compareCourses.map((c) => (
                        <th key={c.title} className="px-4 py-2 text-left text-sm font-semibold text-gray-900 dark:text-white">{c.title}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    <tr>
                      <td className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Department</td>
                      {compareCourses.map((c) => (
                        <td key={c.title + '-dept'} className="px-4 py-3 text-sm text-gray-900 dark:text-gray-200">{c.department || '—'}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Level</td>
                      {compareCourses.map((c) => (
                        <td key={c.title + '-level'} className="px-4 py-3 text-sm text-gray-900 dark:text-gray-200">{c.level || '—'}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tags</td>
                      {compareCourses.map((c) => (
                        <td key={c.title + '-tags'} className="px-4 py-3 text-sm text-gray-900 dark:text-gray-200">{c.tags?.join(', ') || '—'}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Term</td>
                      {compareCourses.map((c) => (
                        <td key={c.title + '-term'} className="px-4 py-3 text-sm text-gray-900 dark:text-gray-200">{c.termLabel || '—'}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase align-top">Description</td>
                      {compareCourses.map((c) => (
                        <td key={c.title + '-desc'} className="px-4 py-3 text-sm text-gray-900 dark:text-gray-200 max-w-sm">
                          <div className="line-clamp-5">{c.description || '—'}</div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                <button onClick={() => setCompareSelection([])} className="px-3 py-1.5 text-sm rounded-md bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">Clear selection</button>
                <button onClick={() => setShowCompareModal(false)} className="px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}