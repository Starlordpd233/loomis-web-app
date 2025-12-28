import React from 'react';
import { ChevronRight } from 'lucide-react';
import { SIDEBAR_LINKS } from '../constants';

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 flex-shrink-0 hidden lg:block bg-white border-r border-slate-200 h-[calc(100vh-64px)] sticky top-16 overflow-y-auto">
      <div className="p-6">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          Catalog Navigation
        </h2>
        <nav className="space-y-1">
          {SIDEBAR_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                link.isActive
                  ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {link.label}
              {link.isActive && <ChevronRight className="h-4 w-4" />}
            </a>
          ))}
        </nav>

        <div className="mt-8 pt-8 border-t border-slate-200">
           <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          Resources
        </h2>
          <div className="space-y-3">
             <a href="#" className="block text-sm text-slate-600 hover:text-indigo-700">Student Handbook</a>
             <a href="#" className="block text-sm text-slate-600 hover:text-indigo-700">Course Schedules</a>
             <a href="#" className="block text-sm text-slate-600 hover:text-indigo-700">Faculty Directory</a>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;