'use client';

import { useState, useMemo } from 'react';
import { Compass, Star, ListChecks, Code, BookOpen, Globe, Calculator, FlaskConical, Languages, Music, Palette, Users, Book, Bolt, Award, Shuffle, LayoutGrid, LayoutList, Sparkles, Wand2, Search, Bell, User, X, Calendar, FileText, MessageCircle } from 'lucide-react';
import { DEPARTMENTS, MOCK_COURSES } from './data';
import { Course, DepartmentFilter } from './types';
import CourseCard from './components/CourseCard';
import CourseListItem from './components/CourseListItem';
import CourseModal from './components/CourseModal';
import CoolSearchBar from './components/CoolSearchBar';
import MyListPanel from './components/MyListPanel';

const SidebarLink = ({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 ${active
        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      }`}
  >
    {icon}
    <span className="font-medium text-sm">{label}</span>
  </button>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="px-4 mt-6 mb-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
    {children}
  </h3>
);

export default function EnhancedExplorer() {
  const [activeTab, setActiveTab] = useState('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<DepartmentFilter>('All');
  const [starredCourses, setStarredCourses] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMyListOpen, setIsMyListOpen] = useState(false);
  const [myListWidth, setMyListWidth] = useState(400);

  const savedCourses = useMemo(() =>
    MOCK_COURSES.filter(course => starredCourses.includes(course.id)),
    [starredCourses]
  );

  const toggleMyList = () => setIsMyListOpen(!isMyListOpen);

  const filteredCourses = useMemo(() => {
    return MOCK_COURSES.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = selectedDept === 'All' || course.department === selectedDept;
      const matchesStarred = activeTab === 'shortlist' ? starredCourses.includes(course.id) : true;
      return matchesSearch && matchesDept && matchesStarred;
    });
  }, [searchQuery, selectedDept, starredCourses, activeTab]);

  const toggleStar = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setStarredCourses(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col z-20">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-900 rounded-xl flex items-center justify-center text-white">
              <Book className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-indigo-900 tracking-tight leading-none text-sm">LOOMIS CHAFFEE</h1>
              <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Academic Catalog</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 custom-scrollbar overflow-y-auto space-y-1">
          <SectionTitle>Discover</SectionTitle>
          <SidebarLink
            icon={<Compass className="w-5 h-5" />}
            label="Explore Courses"
            active={activeTab === 'browse'}
            onClick={() => { setActiveTab('browse'); setSelectedDept('All'); }}
          />
          <SidebarLink
            icon={<Star className="w-5 h-5" />}
            label="My Shortlist"
            active={activeTab === 'shortlist'}
            onClick={() => setActiveTab('shortlist')}
          />
          <SidebarLink
            icon={<ListChecks className="w-5 h-5" />}
            label="My List"
            onClick={toggleMyList}
          />
          <SidebarLink icon={<Shuffle className="w-5 h-5" />} label="Requirements" />

          <SectionTitle>Academic Units</SectionTitle>
          {DEPARTMENTS.map(dept => (
            <SidebarLink
              key={dept.name}
              icon={
                dept.name === 'Computer Science' ? <Code className="w-5 h-5" /> :
                dept.name === 'English' ? <BookOpen className="w-5 h-5" /> :
                dept.name === 'History' ? <Globe className="w-5 h-5" /> :
                dept.name === 'Mathematics' ? <Calculator className="w-5 h-5" /> :
                dept.name === 'Science' ? <FlaskConical className="w-5 h-5" /> :
                dept.name === 'Modern Languages' ? <Globe className="w-5 h-5" /> :
                dept.name === 'Performing Arts' ? <Music className="w-5 h-5" /> :
                dept.name === 'Visual Arts' ? <Palette className="w-5 h-5" /> :
                <Users className="w-5 h-5" />
              }
              label={dept.name}
              active={selectedDept === dept.name && activeTab === 'browse'}
              onClick={() => {
                setSelectedDept(dept.name as DepartmentFilter);
                setActiveTab('browse');
              }}
            />
          ))}

          <SectionTitle>Resources</SectionTitle>
          <SidebarLink icon={<Calendar className="w-5 h-5" />} label="Calendar 2025-26" />
          <SidebarLink icon={<FileText className="w-5 h-5" />} label="Student Handbook" />
        </nav>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <div className="bg-indigo-900 rounded-2xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2 text-indigo-300">
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">AI Counselor</span>
            </div>
            <p className="text-xs text-indigo-100 mb-3 font-medium">Need help picking courses for next term?</p>
            <button
              onClick={() => setActiveTab('assistant')}
              className="w-full py-2 bg-indigo-500 hover:bg-indigo-400 rounded-lg text-xs font-bold transition-all"
            >
              Ask Advisor
            </button>
          </div>
        </div>
      </aside>

      <main
        className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden relative"
        style={{
          marginRight: isMyListOpen ? `${myListWidth}px` : '0',
          transition: 'margin-right 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        <header className="h-24 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 px-10 flex items-center justify-between sticky top-0 z-10">
          <CoolSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by course name, Department, or keywords..."
          />
          <div className="flex items-center gap-6 ml-10">
            <div className="flex -space-x-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-4 border-slate-800 shadow-sm bg-slate-600"></div>
              ))}
              <div className="w-10 h-10 rounded-full bg-slate-800 border-4 border-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-300">+12</div>
            </div>
            <button className="relative p-3 text-slate-400 hover:text-indigo-400 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-900"></span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
          {activeTab === 'assistant' ? (
            <div className="max-w-4xl mx-auto py-10">
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-indigo-100 text-indigo-600 mb-6 animate-pulse">
                  <Sparkles className="w-10 h-10" />
                </div>
                <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">AI Course Advisor</h2>
                <p className="text-slate-500 text-lg max-w-xl mx-auto leading-relaxed">
                  Tell me about your interests, future goals, or subjects you enjoy, and I&apos;ll recommend the perfect academic path for you.
                </p>
              </div>

              <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 mb-10">
                <div className="mb-6">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Your Interests</label>
                  <textarea
                    placeholder="e.g., I love building things, I enjoy solving math puzzles, and I'm interested in how robots work..."
                    className="w-full p-6 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/10 min-h-[150px] text-lg text-slate-700 placeholder:text-slate-300 transition-all resize-none"
                  ></textarea>
                </div>
                <button
                  disabled={true}
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3"
                >
                  <Wand2 className="w-5 h-5" /> Get Personal Advice
                </button>
              </div>

              <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-3xl">
                <h4 className="text-indigo-900 font-bold mb-4 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" /> Advisor&apos;s View
                </h4>
                <p className="text-indigo-800/80 leading-relaxed text-lg italic">
                  AI Advisor integration coming soon. For now, use the search and filters to explore courses.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-12">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                    {activeTab === 'shortlist' ? 'My Shortlist' : selectedDept === 'All' ? 'Explore Courses' : selectedDept}
                  </h2>
                  <div className="flex bg-white border border-slate-200 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${viewMode === 'grid'
                          ? 'bg-slate-100 text-slate-900'
                          : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                      <LayoutGrid className="w-4 h-4 mr-2" />Grid
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${viewMode === 'list'
                          ? 'bg-slate-100 text-slate-900'
                          : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                      <LayoutList className="w-4 h-4 mr-2" />List
                    </button>
                  </div>
                </div>
                <p className="text-slate-500 text-lg max-w-2xl leading-relaxed">
                  {selectedDept === 'All'
                    ? 'Discover distinct programs, follow your curiosity, and plan your academic journey across 300+ rigorous offerings.'
                    : DEPARTMENTS.find(d => d.name === selectedDept)?.description}
                </p>
              </div>

              <div className="grid grid-cols-4 gap-6 mb-12">
                {[
                  { label: 'Courses Available', val: filteredCourses.length, icon: Book, color: 'text-slate-400' },
                  { label: 'New This Year', val: '12', icon: Bolt, color: 'text-amber-500' },
                  { label: 'AP Offerings', val: '24', icon: Award, color: 'text-indigo-600' },
                  { label: 'Interdisciplinary', val: '18', icon: Shuffle, color: 'text-emerald-500' }
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center gap-5 shadow-sm">
                    <div className={`w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center ${stat.color || 'text-slate-400'}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                      <span className="text-2xl font-bold text-slate-900">{stat.val}</span>
                    </div>
                  </div>
                ))}
              </div>

              {filteredCourses.length > 0 ? (
                viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCourses.map(course => {
                      const dept = DEPARTMENTS.find(d => d.name === course.department);
                      return (
                        <CourseCard
                          key={course.id}
                          course={course}
                          dept={dept}
                          onClick={setSelectedCourse}
                          isStarred={starredCourses.includes(course.id)}
                          onToggleStar={toggleStar}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredCourses.map(course => {
                      const dept = DEPARTMENTS.find(d => d.name === course.department);
                      return (
                        <CourseListItem
                          key={course.id}
                          course={course}
                          dept={dept}
                          onClick={setSelectedCourse}
                          isStarred={starredCourses.includes(course.id)}
                          onToggleStar={toggleStar}
                        />
                      );
                    })}
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-6">
                    <Search className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No results found</h3>
                  <p className="text-slate-500 max-w-sm">
                    Try adjusting your search filters or browse a different department to find what you&apos;re looking for.
                  </p>
                  <button
                    onClick={() => { setSearchQuery(''); setSelectedDept('All'); }}
                    className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-full font-bold text-sm shadow-lg shadow-indigo-100"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <MyListPanel
        isOpen={isMyListOpen}
        onClose={() => setIsMyListOpen(false)}
        savedCourses={savedCourses}
        width={myListWidth}
        onWidthChange={setMyListWidth}
      />

      <CourseModal
        course={selectedCourse}
        dept={selectedCourse ? DEPARTMENTS.find(d => d.name === selectedCourse.department) : undefined}
        onClose={() => setSelectedCourse(null)}
      />
    </div>
  );
}
