import React from 'react';
import { Star, Laptop, Calculator, BookOpen, Atom } from 'lucide-react';
import { Course } from '../types';

interface CourseCardProps {
  course: Course;
  compact?: boolean; 
}

const CourseCard: React.FC<CourseCardProps> = ({ course, compact = false }) => {
  // Helper to get icon based on dept
  const getIcon = (dept: string) => {
    switch (dept) {
      case 'Computer Science': return <Laptop className="w-6 h-6 text-white" />;
      case 'Mathematics': return <Calculator className="w-6 h-6 text-white" />;
      case 'English': return <BookOpen className="w-6 h-6 text-white" />;
      default: return <Atom className="w-6 h-6 text-white" />;
    }
  };

  const getBgColor = (dept: string) => {
    switch (dept) {
      case 'Computer Science': return 'bg-blue-600';
      case 'Mathematics': return 'bg-purple-600';
      case 'English': return 'bg-orange-500';
      default: return 'bg-emerald-600';
    }
  };

  if (compact) {
    return (
      <div className="group bg-white p-3 rounded-lg border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer flex gap-3 items-center">
        <div className={`w-10 h-10 rounded-lg ${getBgColor(course.department)} flex items-center justify-center flex-shrink-0 shadow-sm`}>
           {React.cloneElement(getIcon(course.department) as React.ReactElement<{ className?: string }>, { className: "w-5 h-5 text-white" })}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex justify-between items-start">
            <h4 className="text-sm font-semibold text-slate-900 truncate pr-2">{course.code}</h4>
          </div>
          <p className="text-xs text-slate-600 truncate">{course.title}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="group bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex gap-4 h-full">
      <div className={`w-14 h-14 rounded-xl ${getBgColor(course.department)} flex items-center justify-center flex-shrink-0 shadow-sm`}>
        {getIcon(course.department)}
      </div>
      
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex justify-between items-start mb-1 gap-2">
          {/* Metadata Row: Handles truncation to preserve layout structure */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium min-w-0 overflow-hidden">
            <span className="text-indigo-600 font-bold whitespace-nowrap shrink-0">{course.code}</span>
            <span className="text-slate-300 shrink-0">•</span>
            <span className="whitespace-nowrap shrink-0">{course.credits} Credits</span>
            <span className="text-slate-300 shrink-0">•</span>
            <span className="truncate">{course.department}</span>
          </div>
          
          {/* Star Button: Fixed size, prevents being pushed out */}
          <button className="text-slate-300 hover:text-yellow-400 transition-colors shrink-0">
            <Star className="w-5 h-5" />
          </button>
        </div>
        
        <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
          {course.title}
        </h3>
        
        <div className="flex flex-wrap gap-2 mt-auto">
          {course.tags.map(tag => (
            <span key={tag} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-md font-medium">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;