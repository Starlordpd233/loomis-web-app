
import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { DEPARTMENTS, MOCK_COURSES } from './data';
import { Course, Department } from './types';
import { getCourseAdvice } from './services/geminiService';

// --- Cool Search Bar Component ---

const CoolSearchBar: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}> = ({ value, onChange, placeholder = "Search..." }) => {
  return (
    <SearchWrapper>
      <div id="poda">
        <div className="glow" />
        <div className="darkBorderBg" />
        <div className="darkBorderBg" />
        <div className="darkBorderBg" />
        <div className="white" />
        <div className="border" />
        <div id="main">
          <input
            placeholder={placeholder}
            type="text"
            name="text"
            className="input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          <div id="input-mask" />
          <div id="pink-mask" />
          <div className="filterBorder" />
          <div id="filter-icon">
            <svg preserveAspectRatio="none" height={27} width={27} viewBox="4.8 4.56 14.832 15.408" fill="none">
              <path d="M8.16 6.65002H15.83C16.47 6.65002 16.99 7.17002 16.99 7.81002V9.09002C16.99 9.56002 16.7 10.14 16.41 10.43L13.91 12.64C13.56 12.93 13.33 13.51 13.33 13.98V16.48C13.33 16.83 13.1 17.29 12.81 17.47L12 17.98C11.24 18.45 10.2 17.92 10.2 16.99V13.91C10.2 13.5 9.97 12.98 9.73 12.69L7.52 10.36C7.23 10.08 7 9.55002 7 9.20002V7.87002C7 7.17002 7.52 6.65002 8.16 6.65002Z" stroke="#d6d6e6" strokeWidth={1} strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div id="search-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width={24} viewBox="0 0 24 24" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" height={24} fill="none" className="feather feather-search">
              <circle stroke="url(#search)" r={8} cy={11} cx={11} />
              <line stroke="url(#searchl)" y2="16.65" y1={22} x2="16.65" x1={22} />
              <defs>
                <linearGradient gradientTransform="rotate(50)" id="search">
                  <stop stopColor="#f8e7f8" offset="0%" />
                  <stop stopColor="#b6a9b7" offset="50%" />
                </linearGradient>
                <linearGradient id="searchl">
                  <stop stopColor="#b6a9b7" offset="0%" />
                  <stop stopColor="#837484" offset="50%" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </SearchWrapper>
  );
};

const SearchWrapper = styled.div`
  .white,
  .border,
  .darkBorderBg,
  .glow {
    max-height: 70px;
    max-width: 500px;
    height: 100%;
    width: 100%;
    position: absolute;
    overflow: hidden;
    z-index: -1;
    border-radius: 12px;
    filter: blur(3px);
  }
  .input {
    background-color: #010201;
    border: none;
    width: 487px;
    height: 56px;
    border-radius: 10px;
    color: white;
    padding-inline: 59px;
    font-size: 16px;
  }
  #poda {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  .input::placeholder {
    color: #c0b9c0;
  }
  .input:focus {
    outline: none;
  }
  #main:focus-within > #input-mask {
    display: none;
  }
  #input-mask {
    display: none; /* Hidden to prevent blocking placeholder text */
    pointer-events: none;
    width: 100px;
    height: 20px;
    position: absolute;
    background: linear-gradient(90deg, transparent, black);
    top: 18px;
    left: 70px;
  }
  #pink-mask {
    pointer-events: none;
    width: 30px;
    height: 20px;
    position: absolute;
    background: #cf30aa;
    top: 10px;
    left: 5px;
    filter: blur(20px);
    opacity: 0.8;
    transition: all 2s;
  }
  #main:hover > #pink-mask {
    opacity: 0;
  }
  .white {
    max-height: 63px;
    max-width: 493px;
    border-radius: 10px;
    filter: blur(2px);
  }
  .white::before {
    content: "";
    z-index: -2;
    text-align: center;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(83deg);
    position: absolute;
    width: 600px;
    height: 600px;
    background-repeat: no-repeat;
    background-position: 0 0;
    filter: brightness(1.4);
    background-image: conic-gradient(
      rgba(0, 0, 0, 0) 0%,
      #a099d8,
      rgba(0, 0, 0, 0) 8%,
      rgba(0, 0, 0, 0) 50%,
      #dfa2da,
      rgba(0, 0, 0, 0) 58%
    );
    transition: all 2s;
  }
  .border {
    max-height: 59px;
    max-width: 489px;
    border-radius: 11px;
    filter: blur(0.5px);
  }
  .border::before {
    content: "";
    z-index: -2;
    text-align: center;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(70deg);
    position: absolute;
    width: 600px;
    height: 600px;
    filter: brightness(1.3);
    background-repeat: no-repeat;
    background-position: 0 0;
    background-image: conic-gradient(
      #1c191c,
      #402fb5 5%,
      #1c191c 14%,
      #1c191c 50%,
      #cf30aa 60%,
      #1c191c 64%
    );
    transition: all 2s;
  }
  .darkBorderBg {
    max-height: 65px;
    max-width: 498px;
  }
  .darkBorderBg::before {
    content: "";
    z-index: -2;
    text-align: center;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(82deg);
    position: absolute;
    width: 600px;
    height: 600px;
    background-repeat: no-repeat;
    background-position: 0 0;
    background-image: conic-gradient(
      rgba(0, 0, 0, 0),
      #18116a,
      rgba(0, 0, 0, 0) 10%,
      rgba(0, 0, 0, 0) 50%,
      #6e1b60,
      rgba(0, 0, 0, 0) 60%
    );
    transition: all 2s;
  }
  #poda:hover > .darkBorderBg::before {
    transform: translate(-50%, -50%) rotate(-98deg);
  }
  #poda:hover > .glow::before {
    transform: translate(-50%, -50%) rotate(-120deg);
  }
  #poda:hover > .white::before {
    transform: translate(-50%, -50%) rotate(-97deg);
  }
  #poda:hover > .border::before {
    transform: translate(-50%, -50%) rotate(-110deg);
  }
  #poda:focus-within > .darkBorderBg::before {
    transform: translate(-50%, -50%) rotate(442deg);
    transition: all 4s;
  }
  #poda:focus-within > .glow::before {
    transform: translate(-50%, -50%) rotate(420deg);
    transition: all 4s;
  }
  #poda:focus-within > .white::before {
    transform: translate(-50%, -50%) rotate(443deg);
    transition: all 4s;
  }
  #poda:focus-within > .border::before {
    transform: translate(-50%, -50%) rotate(430deg);
    transition: all 4s;
  }
  .glow {
    overflow: hidden;
    filter: blur(30px);
    opacity: 0.4;
    max-height: 130px;
    max-width: 540px;
  }
  .glow:before {
    content: "";
    z-index: -2;
    text-align: center;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(60deg);
    position: absolute;
    width: 999px;
    height: 999px;
    background-repeat: no-repeat;
    background-position: 0 0;
    background-image: conic-gradient(
      #000,
      #402fb5 5%,
      #000 38%,
      #000 50%,
      #cf30aa 60%,
      #000 87%
    );
    transition: all 2s;
  }
  @keyframes rotate {
    100% {
      transform: translate(-50%, -50%) rotate(450deg);
    }
  }
  #filter-icon {
    position: absolute;
    top: 8px;
    right: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    max-height: 40px;
    max-width: 38px;
    height: 100%;
    width: 100%;
    isolation: isolate;
    overflow: hidden;
    border-radius: 10px;
    background: linear-gradient(180deg, #161329, black, #1d1b4b);
    border: 1px solid transparent;
  }
  .filterBorder {
    height: 42px;
    width: 40px;
    position: absolute;
    overflow: hidden;
    top: 7px;
    right: 7px;
    border-radius: 10px;
  }
  .filterBorder::before {
    content: "";
    text-align: center;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(90deg);
    position: absolute;
    width: 600px;
    height: 600px;
    background-repeat: no-repeat;
    background-position: 0 0;
    filter: brightness(1.35);
    background-image: conic-gradient(
      rgba(0, 0, 0, 0),
      #3d3a4f,
      rgba(0, 0, 0, 0) 50%,
      rgba(0, 0, 0, 0) 50%,
      #3d3a4f,
      rgba(0, 0, 0, 0) 100%
    );
    animation: rotate 4s linear infinite;
  }
  #main {
    position: relative;
  }
  #search-icon {
    position: absolute;
    left: 20px;
    top: 15px;
  }
`;

// --- Components ---

const SidebarLink: React.FC<{ 
  icon: string; 
  label: string; 
  active?: boolean; 
  onClick?: () => void 
}> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    <i className={`fas ${icon} w-5`}></i>
    <span className="font-medium text-sm">{label}</span>
  </button>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="px-4 mt-6 mb-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
    {children}
  </h3>
);

const CourseCard: React.FC<{ 
  course: Course; 
  onClick: (course: Course) => void;
  isStarred: boolean;
  onToggleStar: (e: React.MouseEvent, id: string) => void;
}> = ({ course, onClick, isStarred, onToggleStar }) => {
  const dept = DEPARTMENTS.find(d => d.name === course.department);
  
  return (
    <div 
      onClick={() => onClick(course)}
      className="group relative bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 bg-${dept?.color}-500 group-hover:scale-150 transition-transform duration-500`}></div>
      
      <div className="flex justify-between items-start mb-4">
        <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-${dept?.color}-50 text-${dept?.color}-600`}>
          <i className={`fas ${dept?.icon} text-xl`}></i>
        </div>
        <button 
          onClick={(e) => onToggleStar(e, course.id)}
          className={`p-2 rounded-full transition-colors ${isStarred ? 'text-amber-500' : 'text-slate-300 hover:text-amber-400'}`}
        >
          <i className={`fas fa-star ${isStarred ? '' : 'fa-regular'}`}></i>
        </button>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-${dept?.color}-100 text-${dept?.color}-700 tracking-wider`}>
          {course.code}
        </span>
        <span className="text-[10px] font-bold text-slate-400">CREDITS: {course.credits}</span>
      </div>

      <h4 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2 line-clamp-1">
        {course.title}
      </h4>
      <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-6">
        {course.description}
      </p>

      <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-50">
        {course.tags.slice(0, 2).map(tag => (
          <span key={tag} className="text-[10px] px-2 py-1 rounded bg-slate-50 text-slate-500 font-medium">#{tag}</span>
        ))}
      </div>
    </div>
  );
};

const CourseModal: React.FC<{ 
  course: Course | null; 
  onClose: () => void;
}> = ({ course, onClose }) => {
  if (!course) return null;
  const dept = DEPARTMENTS.find(d => d.name === course.department);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className={`h-2 bg-${dept?.color}-500`}></div>
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full bg-${dept?.color}-100 text-${dept?.color}-700 uppercase tracking-widest`}>
                  {course.code}
                </span>
                <span className="text-sm font-medium text-slate-400">{course.department}</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-900">{course.title}</h2>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-50 p-4 rounded-2xl">
              <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Credits</span>
              <span className="text-lg font-semibold text-slate-700">{course.credits} Units</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl">
              <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Grade Levels</span>
              <span className="text-lg font-semibold text-slate-700">{course.gradeLevels.join(', ')}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl">
              <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Type</span>
              <span className="text-lg font-semibold text-slate-700">{course.tags[0]}</span>
            </div>
          </div>

          <div className="mb-8">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Course Description</h4>
            <p className="text-slate-600 leading-relaxed text-lg italic font-light">
              "{course.description}"
            </p>
          </div>

          {course.prerequisites && (
            <div className="mb-8">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Prerequisites</h4>
              <div className="flex gap-2">
                {course.prerequisites.map(p => (
                  <span key={p} className="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-sm font-bold border border-amber-100">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2">
              <i className="fas fa-plus"></i> Add to Academic Plan
            </button>
            <button className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all">
              Syllabus PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<Department | 'All'>('All');
  const [starredCourses, setStarredCourses] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
  // AI Assistant State
  const [advicePrompt, setAdvicePrompt] = useState('');
  const [aiAdvice, setAiAdvice] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

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

  const handleAiAdvice = async () => {
    if (!advicePrompt.trim()) return;
    setIsAiLoading(true);
    const result = await getCourseAdvice(advicePrompt, MOCK_COURSES);
    setAiAdvice(result);
    setIsAiLoading(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col z-20">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-900 rounded-xl flex items-center justify-center text-white">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <div>
              <h1 className="font-bold text-indigo-900 tracking-tight leading-none">LOOMIS CHAFFEE</h1>
              <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Academic Catalog</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 custom-scrollbar overflow-y-auto space-y-1">
          <SectionTitle>Discover</SectionTitle>
          <SidebarLink 
            icon="fa-compass" 
            label="Explore Courses" 
            active={activeTab === 'browse'} 
            onClick={() => { setActiveTab('browse'); setSelectedDept('All'); }}
          />
          <SidebarLink 
            icon="fa-star" 
            label="My Shortlist" 
            active={activeTab === 'shortlist'}
            onClick={() => setActiveTab('shortlist')}
          />
          <SidebarLink icon="fa-chart-pie" label="Requirements" />
          
          <SectionTitle>Academic Units</SectionTitle>
          {DEPARTMENTS.map(dept => (
            <SidebarLink 
              key={dept.name}
              icon={dept.icon} 
              label={dept.name} 
              active={selectedDept === dept.name && activeTab === 'browse'}
              onClick={() => {
                setSelectedDept(dept.name);
                setActiveTab('browse');
              }}
            />
          ))}

          <SectionTitle>Resources</SectionTitle>
          <SidebarLink icon="fa-calendar-days" label="Calendar 2025-26" />
          <SidebarLink icon="fa-file-lines" label="Student Handbook" />
        </nav>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <div className="bg-indigo-900 rounded-2xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2 text-indigo-300">
              <i className="fas fa-sparkles"></i>
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

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden relative">
        {/* Top Navbar */}
        <header className="h-24 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 px-10 flex items-center justify-between sticky top-0 z-10">
          <CoolSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by course name, Department, or keywords..."
          />
          <div className="flex items-center gap-6 ml-10">
            <div className="flex -space-x-3">
              {[1, 2, 3].map(i => (
                <img key={i} src={`https://picsum.photos/seed/${i*50}/40/40`} className="w-10 h-10 rounded-full border-4 border-slate-800 shadow-sm" alt="Student" />
              ))}
              <div className="w-10 h-10 rounded-full bg-slate-800 border-4 border-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-300">+12</div>
            </div>
            <button className="relative p-3 text-slate-400 hover:text-indigo-400 transition-colors">
              <i className="fas fa-bell text-xl"></i>
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-900"></span>
            </button>
          </div>
        </header>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
          {activeTab === 'assistant' ? (
            <div className="max-w-4xl mx-auto py-10">
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-indigo-100 text-indigo-600 mb-6 animate-pulse">
                  <i className="fas fa-sparkles text-4xl"></i>
                </div>
                <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">AI Course Advisor</h2>
                <p className="text-slate-500 text-lg max-w-xl mx-auto leading-relaxed">
                  Tell me about your interests, future goals, or subjects you enjoy, and I'll recommend the perfect academic path for you.
                </p>
              </div>

              <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 mb-10">
                <div className="mb-6">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Your Interests</label>
                  <textarea 
                    value={advicePrompt}
                    onChange={(e) => setAdvicePrompt(e.target.value)}
                    placeholder="e.g., I love building things, I enjoy solving math puzzles, and I'm interested in how robots work..."
                    className="w-full p-6 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/10 min-h-[150px] text-lg text-slate-700 placeholder:text-slate-300 transition-all resize-none"
                  ></textarea>
                </div>
                <button 
                  onClick={handleAiAdvice}
                  disabled={isAiLoading || !advicePrompt}
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3"
                >
                  {isAiLoading ? (
                    <><i className="fas fa-spinner fa-spin"></i> Generating Pathways...</>
                  ) : (
                    <><i className="fas fa-wand-magic-sparkles"></i> Get Personal Advice</>
                  )}
                </button>
              </div>

              {aiAdvice && (
                <div className="space-y-8 animate-in slide-in-from-bottom-10 duration-500">
                  <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-3xl">
                    <h4 className="text-indigo-900 font-bold mb-4 flex items-center gap-2">
                      <i className="fas fa-comment-dots"></i> Advisor's View
                    </h4>
                    <p className="text-indigo-800/80 leading-relaxed text-lg italic">
                      {aiAdvice.advice}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {aiAdvice.suggestions.map((sug: any, idx: number) => (
                      <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                        <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                          <i className="fas fa-lightbulb"></i>
                        </div>
                        <h5 className="font-bold text-slate-900 mb-3">{sug.title}</h5>
                        <p className="text-slate-500 text-sm leading-relaxed">{sug.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Hero Section */}
              <div className="mb-12">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                    {activeTab === 'shortlist' ? 'My Shortlist' : selectedDept === 'All' ? 'Explore Courses' : selectedDept}
                  </h2>
                  <div className="flex bg-white border border-slate-200 rounded-xl p-1">
                    <button className="px-4 py-2 bg-slate-100 rounded-lg text-slate-900 font-bold text-xs"><i className="fas fa-th-large mr-2"></i>Grid</button>
                    <button className="px-4 py-2 text-slate-400 hover:text-slate-600 font-bold text-xs"><i className="fas fa-list mr-2"></i>List</button>
                  </div>
                </div>
                <p className="text-slate-500 text-lg max-w-2xl leading-relaxed">
                  {selectedDept === 'All' 
                    ? 'Discover distinct programs, follow your curiosity, and plan your academic journey across 300+ rigorous offerings.' 
                    : DEPARTMENTS.find(d => d.name === selectedDept)?.description}
                </p>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-4 gap-6 mb-12">
                {[
                  { label: 'Courses Available', val: filteredCourses.length, icon: 'fa-book' },
                  { label: 'New This Year', val: '12', icon: 'fa-bolt', color: 'text-amber-500' },
                  { label: 'AP Offerings', val: '24', icon: 'fa-certificate', color: 'text-indigo-600' },
                  { label: 'Interdisciplinary', val: '18', icon: 'fa-shuffle', color: 'text-emerald-500' }
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center gap-5 shadow-sm">
                    <div className={`w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center ${stat.color || 'text-slate-400'}`}>
                      <i className={`fas ${stat.icon} text-xl`}></i>
                    </div>
                    <div>
                      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                      <span className="text-2xl font-bold text-slate-900">{stat.val}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Course Grid */}
              {filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredCourses.map(course => (
                    <CourseCard 
                      key={course.id} 
                      course={course} 
                      onClick={setSelectedCourse}
                      isStarred={starredCourses.includes(course.id)}
                      onToggleStar={toggleStar}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-6">
                    <i className="fas fa-search text-4xl"></i>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No results found</h3>
                  <p className="text-slate-500 max-w-sm">
                    Try adjusting your search filters or browse a different department to find what you're looking for.
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

      {/* Modal Overlay */}
      <CourseModal 
        course={selectedCourse} 
        onClose={() => setSelectedCourse(null)} 
      />
    </div>
  );
}
