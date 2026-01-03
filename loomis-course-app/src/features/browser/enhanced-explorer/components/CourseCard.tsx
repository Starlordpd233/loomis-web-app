'use client';

import { Star, Laptop, Calculator, BookOpen, FlaskConical } from 'lucide-react';
import { Course, DepartmentMeta } from '../types';

interface CourseCardProps {
  course: Course;
  dept: DepartmentMeta | undefined;
  onClick: (course: Course) => void;
  isStarred: boolean;
  onToggleStar: (e: React.MouseEvent, id: string) => void;
}

const getIcon = (dept: string) => {
  switch (dept) {
    case 'Computer Science': return <Laptop className="w-5 h-5" />;
    case 'Mathematics': return <Calculator className="w-5 h-5" />;
    case 'English': return <BookOpen className="w-5 h-5" />;
    default: return <FlaskConical className="w-5 h-5" />;
  }
};

export default function CourseCard({ course, dept, onClick, isStarred, onToggleStar }: CourseCardProps) {
  return (
    <div
      onClick={() => onClick(course)}
      className="group relative bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 bg-${dept?.color}-500 group-hover:scale-150 transition-transform duration-500`}></div>

      <div className="flex justify-between items-start mb-4">
        <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-${dept?.color}-50 text-${dept?.color}-600`}>
          {getIcon(course.department)}
        </div>
        <button
          onClick={(e) => onToggleStar(e, course.id)}
          className={`p-2 rounded-full transition-colors ${isStarred ? 'text-amber-500' : 'text-slate-300 hover:text-amber-400'}`}
        >
          <Star className={`w-5 h-5 ${isStarred ? 'fill-current' : ''}`} />
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
          <span key={tag} className="text-[10px] px-2 py-1 rounded bg-slate-50 text-slate-500 font-medium">
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}
