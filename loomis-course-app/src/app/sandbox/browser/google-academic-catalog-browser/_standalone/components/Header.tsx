import React from 'react';
import { BookOpen, Search, Menu } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-indigo-900 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg">
              <BookOpen className="h-6 w-6 text-indigo-100" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-wide uppercase">Loomis Chaffee</h1>
              <p className="text-xs text-indigo-200 font-medium">Academic Catalog 2025-2026</p>
            </div>
          </div>

          {/* Search/Mobile */}
          <div className="flex items-center gap-4">
            <button className="text-indigo-200 hover:text-white p-1">
              <Search className="h-5 w-5" />
            </button>
            <button className="md:hidden text-indigo-200 hover:text-white p-1">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;