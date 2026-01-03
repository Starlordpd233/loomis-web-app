'use client';

import { X, Download } from 'lucide-react';
import { Course, DepartmentMeta } from '../types';

interface CourseModalProps {
  course: Course | null;
  dept: DepartmentMeta | undefined;
  onClose: () => void;
}

export default function CourseModal({ course, dept, onClose }: CourseModalProps) {
  if (!course) return null;

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
              <X className="w-6 h-6" />
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
              &ldquo;{course.description}&rdquo;
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
              <Download className="w-5 h-5" /> Add to Academic Plan
            </button>
            <button className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all">
              Syllabus PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
