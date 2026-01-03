import React from 'react';
import { Search, Moon, Sun, Bell, User } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="h-16 bg-[#1a1f2e] flex items-center justify-between px-6 flex-shrink-0">
      {/* Search Bar */}
      <div className="w-1/3 min-w-[300px]">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-md leading-5 bg-slate-800 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-[#252a3b] focus:border-indigo-500 focus:placeholder-slate-400 focus:text-white sm:text-sm transition-all duration-200"
            placeholder="Search by course name, Department, or keyword"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-5 text-slate-400">
        <button className="hover:text-white transition-colors">
          <Moon className="w-5 h-5" />
        </button>
        <button className="hover:text-white transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-[#1a1f2e] bg-red-500 transform translate-x-1/4 -translate-y-1/4"></span>
        </button>
        <button className="hover:text-white transition-colors">
          <User className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;
