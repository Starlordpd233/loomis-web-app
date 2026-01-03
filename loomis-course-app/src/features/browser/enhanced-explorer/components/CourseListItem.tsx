'use client';

import { Star, Laptop, Calculator, BookOpen, FlaskConical } from 'lucide-react';
import { Course, DepartmentMeta } from '../types';

interface CourseListItemProps {
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

export default function CourseListItem({ course, dept, onClick, isStarred, onToggleStar }: CourseListItemProps) {
  return (
    <div
      onClick={() => onClick(course)}
      className="group flex items-center gap-4 bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
    >
      <div className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-${dept?.color}-50 text-${dept?.color}-600`}>
        {getIcon(course.department)}
      </div>

      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-${dept?.color}-100 text-${dept?.color}-700`}>
            {course.code}
          </span>
          <span className="text-xs font-bold text-slate-400">{course.credits} Credits</span>
          <span className="text-xs text-slate-400">{course.department}</span>
        </div>
        <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
          {course.title}
        </h4>
      </div>

      <div className="flex-shrink-0 flex items-center gap-3">
        <div className="flex gap-1">
          {course.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-[10px] px-2 py-1 rounded bg-slate-50 text-slate-500 font-medium">
              #{tag}
            </span>
          ))}
        </div>
        <button
          onClick={(e) => onToggleStar(e, course.id)}
          className={`p-2 rounded-full transition-colors ${isStarred ? 'text-amber-500' : 'text-slate-300 hover:text-amber-400'}`}
        >
          <Star className={`w-5 h-5 ${isStarred ? 'fill-current' : ''}`} />
        </button>
      </div>
    </div>
  );
}
