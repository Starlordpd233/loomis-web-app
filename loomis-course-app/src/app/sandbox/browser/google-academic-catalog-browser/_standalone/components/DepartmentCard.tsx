import React from 'react';
import { Code, Calculator, Palette, BookOpenText, Globe, Scale, FlaskConical, Atom } from 'lucide-react';
import { Department } from '../types';

interface Props {
  dept: Department;
}

const getIcon = (category: Department['category'], name: string) => {
  if (name.includes('Computer')) return <Code className="h-6 w-6 text-blue-500" />;
  if (name.includes('Math')) return <Calculator className="h-6 w-6 text-indigo-500" />;
  if (name.includes('Visual') || name.includes('Performing')) return <Palette className="h-6 w-6 text-pink-500" />;
  if (name.includes('English')) return <BookOpenText className="h-6 w-6 text-amber-600" />;
  if (name.includes('Languages')) return <Globe className="h-6 w-6 text-emerald-500" />;
  if (name.includes('History')) return <Scale className="h-6 w-6 text-orange-500" />;
  if (name.includes('Social')) return <Globe className="h-6 w-6 text-cyan-600" />;
  if (name === 'Science') return <FlaskConical className="h-6 w-6 text-teal-500" />;
  
  switch (category) {
    case 'Sciences':
      return <FlaskConical className="h-6 w-6 text-teal-500" />;
    case 'Engineering':
      return <Atom className="h-6 w-6 text-blue-600" />;
    case 'Arts & Humanities':
      return <BookOpenText className="h-6 w-6 text-amber-600" />;
    default:
      return <Scale className="h-6 w-6 text-slate-500" />;
  }
};

const DepartmentCard: React.FC<Props> = ({ dept }) => {
  return (
    <div className="group bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-indigo-300 transition-all duration-300 cursor-pointer flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-slate-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
          {getIcon(dept.category, dept.name)}
        </div>
        <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded-full group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors">
          {dept.code}
        </span>
      </div>

      <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-indigo-700 transition-colors">
        {dept.name}
      </h3>

      <p className="text-sm text-slate-500 mb-4 flex-grow line-clamp-2">
        {dept.description}
      </p>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span>{dept.courseCount} Courses</span>
        <span className="group-hover:translate-x-1 transition-transform text-indigo-600 font-medium">
          View Courses &rarr;
        </span>
      </div>
    </div>
  );
};

export default DepartmentCard;
