import React, { useMemo, useState } from 'react';
import { LayoutGrid, List, Search } from 'lucide-react';
import DepartmentCard from './components/DepartmentCard';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { ALPHABET, CATEGORIES, DEPARTMENTS } from './constants';
import { Department, ViewMode } from './types';

const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const filteredDepartments = useMemo(() => {
    return DEPARTMENTS.filter((dept) => {
      const matchesSearch =
        dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dept.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'All' || dept.category === selectedCategory;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [searchQuery, selectedCategory]);

  // Grouping for List View (A-Z)
  const groupedDepartments = useMemo(() => {
    const groups: Record<string, Department[]> = {};
    filteredDepartments.forEach((dept) => {
      const letter = dept.name.charAt(0).toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(dept);
    });
    return groups;
  }, [filteredDepartments]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <div className="flex flex-1 max-w-7xl mx-auto w-full">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-8 min-w-0">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Explore Courses
              </h1>
              <p className="text-slate-500 mb-6">
                Browse distinct programs, discover new interests, and plan your
                academic journey.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:placeholder-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                    placeholder="Search departments (e.g. Computer Science, History)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex bg-slate-100 p-1 rounded-lg shrink-0">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md flex items-center justify-center transition-all ${
                      viewMode === 'grid'
                        ? 'bg-white shadow-sm text-indigo-600'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md flex items-center justify-center transition-all ${
                      viewMode === 'list'
                        ? 'bg-white shadow-sm text-indigo-600'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                    title="List View"
                  >
                    <List className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="sticky top-20 z-30 bg-slate-50/90 backdrop-blur-sm py-2 mb-6 border-b border-slate-200 overflow-x-auto no-scrollbar">
            <div className="flex items-center space-x-1 min-w-max">
              <span className="text-xs font-bold text-slate-400 uppercase mr-2 px-2">
                Jump to:
              </span>
              {ALPHABET.map((char) => (
                <a
                  key={char}
                  href={viewMode === 'list' ? `#letter-${char}` : undefined}
                  className={`w-7 h-7 flex items-center justify-center rounded text-xs font-medium transition-colors ${
                    DEPARTMENTS.some((d) => d.name.startsWith(char))
                      ? 'text-indigo-600 hover:bg-indigo-100 cursor-pointer'
                      : 'text-slate-300 cursor-default'
                  }`}
                  onClick={(e) => {
                    if (viewMode === 'grid') {
                      e.preventDefault();
                    }
                  }}
                >
                  {char}
                </a>
              ))}
            </div>
          </div>

          {filteredDepartments.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                <Search className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">
                No departments found
              </h3>
              <p className="text-slate-500 mt-1">
                Try adjusting your search or category filter.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="mt-4 text-indigo-600 font-medium hover:text-indigo-800"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredDepartments.map((dept) => (
                    <DepartmentCard key={dept.id} dept={dept} />
                  ))}
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(groupedDepartments).map(
                    ([letter, depts]: [string, Department[]]) => (
                      <div
                        key={letter}
                        id={`letter-${letter}`}
                        className="scroll-mt-32"
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <h2 className="text-2xl font-bold text-slate-300 w-8">
                            {letter}
                          </h2>
                          <div className="h-px bg-slate-200 flex-grow"></div>
                        </div>
                        <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100 shadow-sm">
                          {depts.map((dept) => (
                            <div
                              key={dept.id}
                              className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer"
                            >
                              <div>
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-mono text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded">
                                    {dept.code}
                                  </span>
                                  <h3 className="font-semibold text-slate-900 group-hover:text-indigo-700">
                                    {dept.name}
                                  </h3>
                                </div>
                                <p className="text-sm text-slate-500 mt-1 ml-14 hidden sm:block">
                                  {dept.description}
                                </p>
                              </div>
                              <div className="flex items-center text-slate-400 group-hover:text-indigo-600">
                                <span className="text-xs mr-2">
                                  {dept.courseCount} courses
                                </span>
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 5l7 7-7 7"
                                  ></path>
                                </svg>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </>
          )}

          <div className="mt-12 pt-8 border-t border-slate-200 text-center text-slate-500 text-sm">
            <p>
              Don&apos;t see what you&apos;re looking for?{' '}
              <a href="#" className="text-indigo-600 hover:underline">
                View Archived Catalogs
              </a>{' '}
              or{' '}
              <a href="#" className="text-indigo-600 hover:underline">
                Contact the Registrar
              </a>
              .
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
