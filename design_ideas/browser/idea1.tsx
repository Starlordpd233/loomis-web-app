import React, { useState, useEffect } from 'react';
import { 
  Search, 
  BookOpen, 
  Atom, 
  Palette, 
  Globe, 
  Cpu, 
  Calculator, 
  Microscope, 
  Landmark, 
  Music, 
  Briefcase,
  FlaskConical,
  Dna,
  Code,
  PenTool,
  Languages,
  History,
  TrendingUp,
  Brain,
  Filter,
  X,
  ChevronRight,
  GraduationCap
} from 'lucide-react';

// --- Mock Data ---

const CATEGORIES = [
  { id: 'all', label: 'All Departments', icon: null },
  { id: 'stem', label: 'Science & Math', icon: Atom },
  { id: 'humanities', label: 'Humanities', icon: BookOpen },
  { id: 'arts', label: 'Arts & Design', icon: Palette },
  { id: 'social', label: 'Social Sciences', icon: Globe },
  { id: 'business', label: 'Business', icon: Briefcase },
];

const DEPARTMENTS = [
  { code: 'CS', name: 'Computer Science', category: 'stem', icon: Code, courses: 42 },
  { code: 'BIO', name: 'Biology', category: 'stem', icon: Dna, courses: 38 },
  { code: 'MATH', name: 'Mathematics', category: 'stem', icon: Calculator, courses: 55 },
  { code: 'PHYS', name: 'Physics', category: 'stem', icon: Atom, courses: 29 },
  { code: 'CHEM', name: 'Chemistry', category: 'stem', icon: FlaskConical, courses: 31 },
  { code: 'ENG', name: 'English', category: 'humanities', icon: BookOpen, courses: 64 },
  { code: 'HIST', name: 'History', category: 'humanities', icon: History, courses: 45 },
  { code: 'PHIL', name: 'Philosophy', category: 'humanities', icon: Brain, courses: 22 },
  { code: 'ART', name: 'Visual Arts', category: 'arts', icon: PenTool, courses: 33 },
  { code: 'MUS', name: 'Music', category: 'arts', icon: Music, courses: 28 },
  { code: 'THTR', name: 'Theater', category: 'arts', icon: Palette, courses: 19 },
  { code: 'ECON', name: 'Economics', category: 'social', icon: TrendingUp, courses: 36 },
  { code: 'PSY', name: 'Psychology', category: 'social', icon: Brain, courses: 41 },
  { code: 'POLS', name: 'Political Science', category: 'social', icon: Landmark, courses: 27 },
  { code: 'SOC', name: 'Sociology', category: 'social', icon: Globe, courses: 24 },
  { code: 'LANG', name: 'World Languages', category: 'humanities', icon: Languages, courses: 50 },
  { code: 'BUS', name: 'Business Admin', category: 'business', icon: Briefcase, courses: 48 },
  { code: 'DS', name: 'Data Science', category: 'stem', icon: Cpu, courses: 15 },
];

// --- Components ---

const Badge = ({ children, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-100 text-blue-800",
    purple: "bg-purple-100 text-purple-800",
    green: "bg-emerald-100 text-emerald-800",
    orange: "bg-orange-100 text-orange-800",
    gray: "bg-gray-100 text-gray-800",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[color] || colors.gray}`}>
      {children}
    </span>
  );
};

const DepartmentCard = ({ dept }) => {
  const Icon = dept.icon || BookOpen;
  
  return (
    <div className="group relative bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg hover:border-blue-200 transition-all duration-200 cursor-pointer flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
          <Icon size={24} />
        </div>
        <Badge color="gray">{dept.code}</Badge>
      </div>
      
      <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
        {dept.name}
      </h3>
      
      <p className="text-sm text-gray-500 mb-4 mt-auto">
        {dept.courses} courses available
      </p>

      <div className="flex items-center text-sm text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        Browse Catalog <ChevronRight size={16} className="ml-1" />
      </div>
    </div>
  );
};

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredDepts, setFilteredDepts] = useState(DEPARTMENTS);

  // Filter Logic
  useEffect(() => {
    let results = DEPARTMENTS;

    // 1. Filter by Category
    if (selectedCategory !== 'all') {
      results = results.filter(d => d.category === selectedCategory);
    }

    // 2. Filter by Search Term
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      results = results.filter(d => 
        d.name.toLowerCase().includes(lowerTerm) || 
        d.code.toLowerCase().includes(lowerTerm)
      );
    }

    // 3. Sort Alphabetically
    results.sort((a, b) => a.name.localeCompare(b.name));

    setFilteredDepts(results);
  }, [searchTerm, selectedCategory]);

  const handleCategoryClick = (id) => {
    setSelectedCategory(id);
    // Reset search when switching categories for better UX? 
    // Usually better to keep it, but let's scroll to top
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900">
                Academic<span className="text-indigo-600">Catalog</span>
              </span>
            </div>
            <div className="hidden md:flex space-x-8 text-sm font-medium text-gray-600">
              <a href="#" className="hover:text-indigo-600 transition-colors">Course Search</a>
              <a href="#" className="text-indigo-600">Browse Departments</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Schedules</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Help</a>
            </div>
            <div className="flex items-center gap-3">
               <button className="text-gray-500 hover:text-indigo-600 md:hidden">
                 <Filter size={24} />
               </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Find your next <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">favorite class.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-500 mb-10">
            Browse over 800 courses across {DEPARTMENTS.length} departments for the 2025-2026 Academic Year.
          </p>
          
          {/* Main Search Bar */}
          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 text-lg shadow-sm"
              placeholder="Search departments, codes (e.g. CS), or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Quick Stats/Pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <span className="text-sm font-medium text-gray-500 mr-2 uppercase tracking-wide">Popular:</span>
            {['Computer Science', 'Psychology', 'Economics', 'English'].map(term => (
              <button 
                key={term}
                onClick={() => setSearchTerm(term)}
                className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-sm transition-all"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Filters (Desktop) */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-8">
              
              {/* Category Filter */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  Discipline
                </h3>
                <div className="space-y-1">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isActive = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryClick(cat.id)}
                        className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                          isActive 
                            ? 'bg-indigo-50 text-indigo-700' 
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        {Icon && <Icon size={18} className={`mr-3 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />}
                        {!Icon && <div className="w-[18px] mr-3" />} {/* Spacer for 'All' */}
                        {cat.label}
                        {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* A-Z Quick Jump (Visual only for this demo) */}
              <div className="hidden lg:block">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Quick Jump
                </h3>
                <div className="flex flex-wrap gap-1">
                  {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(letter => (
                    <button 
                      key={letter}
                      className="w-6 h-6 flex items-center justify-center text-[10px] font-bold text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                    >
                      {letter}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Department Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedCategory === 'all' ? 'All Departments' : CATEGORIES.find(c => c.id === selectedCategory)?.label}
              </h2>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {filteredDepts.length} departments found
              </span>
            </div>

            {filteredDepts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredDepts.map((dept) => (
                  <DepartmentCard key={dept.code} dept={dept} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No departments found</h3>
                <p className="text-gray-500">Try adjusting your search or filters.</p>
                <button 
                  onClick={() => {setSearchTerm(''); setSelectedCategory('all');}}
                  className="mt-4 text-indigo-600 font-medium hover:text-indigo-800"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="h-6 w-6 text-indigo-600" />
                <span className="font-bold text-xl text-gray-900">AcademicCatalog</span>
              </div>
              <p className="text-gray-500 text-sm max-w-xs">
                A modern interface for browsing the 2025-2026 academic offerings. Designed for clarity and ease of access.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-indigo-600">Registrar</a></li>
                <li><a href="#" className="hover:text-indigo-600">Academic Calendar</a></li>
                <li><a href="#" className="hover:text-indigo-600">Final Exams</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-indigo-600">Advising</a></li>
                <li><a href="#" className="hover:text-indigo-600">IT Help Desk</a></li>
                <li><a href="#" className="hover:text-indigo-600">Accessibility</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 mt-12 pt-8 text-center text-sm text-gray-400">
            &copy; 2025 Academic Catalog UI Demo.
          </div>
        </div>
      </footer>

    </div>
  );
}