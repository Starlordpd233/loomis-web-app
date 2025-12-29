import React, { useMemo } from 'react';
import { X, Sparkles, ArrowRight, Share2, Download, Search, Layers } from 'lucide-react';
import { Course } from '../types';

interface MyListPanelProps {
  isOpen: boolean;
  onClose: () => void;
  savedCourses: Course[];
}

const MyListPanel: React.FC<MyListPanelProps> = ({ isOpen, onClose, savedCourses }) => {
  
  // Group courses by Department
  const groupedCourses = useMemo(() => {
    return savedCourses.reduce((acc, course) => {
      const dept = course.department;
      if (!acc[dept]) {
        acc[dept] = [];
      }
      acc[dept].push(course);
      return acc;
    }, {} as Record<string, Course[]>);
  }, [savedCourses]);

  const getTermStyle = (term: string) => {
    switch(term) {
      case 'Fall': return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
      case 'Winter': return 'bg-sky-500/10 text-sky-300 border-sky-500/20';
      case 'Spring': return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
      default: return 'bg-slate-700/50 text-slate-300 border-slate-600/50';
    }
  };

  const totalCredits = savedCourses.reduce((sum, course) => sum + course.credits, 0);

  return (
    <div 
      className={`
        fixed inset-y-0 right-0 z-30 w-[400px]
        bg-slate-900/95 backdrop-blur-2xl border-l border-white/10
        shadow-2xl shadow-black/50
        transform transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)
        flex flex-col
        ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0 pointer-events-none'}
      `}
      aria-hidden={!isOpen}
    >
      {/* Ambient Background Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] -z-10 pointer-events-none mix-blend-screen animate-pulse" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-fuchsia-600/10 rounded-full blur-[100px] -z-10 pointer-events-none mix-blend-screen" />

      {/* Panel Header */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-white/5 bg-slate-900/40 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg shadow-indigo-500/30">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">My List</h2>
            <p className="text-[10px] font-medium text-indigo-300 uppercase tracking-wider">
              {savedCourses.length} Courses Selected
            </p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all duration-300 hover:rotate-90"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        
        {savedCourses.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
             <div className="relative group">
               <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
               <div className="w-20 h-20 bg-slate-800/50 border border-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md relative transform group-hover:-translate-y-2 transition-transform duration-500">
                  <Sparkles className="w-8 h-8 text-indigo-400" />
               </div>
             </div>
             <div>
               <p className="font-semibold text-white text-lg">Your list is empty</p>
               <p className="text-sm text-slate-400 mt-2 max-w-[220px] leading-relaxed">
                 Start exploring courses and tap the star icon to add them to your plan.
               </p>
             </div>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Dark Search Bar */}
            <div className="relative group z-10">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
               </div>
               <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl leading-5 bg-black/20 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:bg-black/40 sm:text-sm transition-all duration-300 shadow-inner"
                  placeholder="Quick add by code or name..."
               />
            </div>

            {/* 3D Credit Summary Card */}
            <div className="relative group perspective-1000">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
              <div className="relative bg-gradient-to-br from-[#1e1b4b] to-[#312e81] border border-indigo-400/30 rounded-2xl p-6 flex items-center justify-between overflow-hidden group-hover:transform group-hover:scale-[1.02] transition-transform duration-500">
                 {/* Decorative elements */}
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                 <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/20 rounded-full blur-xl -ml-10 -mb-10 pointer-events-none"></div>
                 
                 <div className="relative z-10">
                   <h3 className="text-sm font-medium text-indigo-200 uppercase tracking-wider mb-1">Total Credits</h3>
                   <div className="text-3xl font-bold text-white flex items-baseline gap-1">
                     {totalCredits} <span className="text-base font-normal text-indigo-300">/ 5.5</span>
                   </div>
                   <div className="w-full h-1 bg-white/10 rounded-full mt-3 w-32 overflow-hidden">
                      <div className="h-full bg-indigo-400 w-3/4 rounded-full shadow-[0_0_10px_rgba(129,140,248,0.5)]"></div>
                   </div>
                 </div>
                 
                 <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md shadow-lg group-hover:rotate-12 transition-transform duration-500">
                    <Sparkles className="w-6 h-6 text-indigo-300" />
                 </div>
              </div>
            </div>

            {/* Course List */}
            <div className="space-y-8">
              {Object.entries(groupedCourses).map(([department, courses]) => (
                <div key={department} className="relative">
                  <h4 className="sticky top-0 z-10 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 pl-1 backdrop-blur-sm py-1 bg-slate-900/0 inline-block">
                    {department}
                  </h4>
                  <div className="space-y-3">
                    {courses.map((course, index) => (
                      <div 
                        key={course.id} 
                        className="group relative bg-white/5 hover:bg-white/10 border border-white/5 hover:border-indigo-500/50 rounded-xl p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_20px_-5px_rgba(0,0,0,0.5)] cursor-pointer overflow-hidden"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none"></div>
                        
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-indigo-400 font-mono bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                                {course.code}
                              </span>
                            </div>
                            <h5 className="text-sm font-semibold text-slate-100 leading-snug mb-1 group-hover:text-indigo-200 transition-colors">
                              {course.title}
                            </h5>
                            <p className="text-xs text-slate-500">
                              {course.credits} {course.credits === 1 ? 'Credit' : 'Credits'}
                            </p>
                          </div>
                          
                          <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wide flex-shrink-0 backdrop-blur-md ${getTermStyle(course.term)} shadow-sm`}>
                            {course.term}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Panel Footer */}
      <div className="p-6 border-t border-white/10 bg-black/20 backdrop-blur-md space-y-4 shrink-0 z-20">
        <button className="relative w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:-translate-y-0.5 active:translate-y-0 overflow-hidden group">
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 skew-y-12"></div>
          <span className="relative flex items-center gap-2">
            Plan Schedule <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
        </button>
        <div className="grid grid-cols-2 gap-3">
            <button className="py-2.5 border border-white/10 hover:bg-white/5 text-slate-300 hover:text-white rounded-lg font-medium text-xs flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98]">
              <Share2 className="w-3.5 h-3.5" /> Share List
            </button>
            <button className="py-2.5 border border-white/10 hover:bg-white/5 text-slate-300 hover:text-white rounded-lg font-medium text-xs flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98]">
              <Download className="w-3.5 h-3.5" /> Export PDF
            </button>
        </div>
      </div>
    </div>
  );
};

export default MyListPanel;