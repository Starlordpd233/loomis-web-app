import React, { useState } from 'react';
import { BookOpen, Zap, Bookmark, Shuffle, Grid, List as ListIcon } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatCard from './components/StatCard';
import CourseCard from './components/CourseCard';
import MyListPanel from './components/MyListPanel';
import { Course } from './types';

// Mock Data
const MOCK_COURSES: Course[] = [
  {
    id: '1',
    code: 'CS301',
    title: 'Introduction to Computer Science',
    credits: 1,
    department: 'Computer Science',
    tags: ['Introductory', 'Python'],
    description: 'An introductory course covering basic programming concepts.',
    term: 'Fall'
  },
  {
    id: '2',
    code: 'CS450',
    title: 'Advanced Machine Learning',
    credits: 1,
    department: 'Computer Science',
    tags: ['Advanced', 'AI'],
    description: 'Deep dive into neural networks and ML algorithms.',
    term: 'Spring'
  },
  {
    id: '3',
    code: 'ENG330',
    title: 'Modern World Literature',
    credits: 1,
    department: 'English',
    tags: ['Writing-Intensive', 'Global'],
    description: 'Exploring contemporary voices from around the globe.',
    term: 'Winter'
  },
  {
    id: '4',
    code: 'MATH505',
    title: 'Multivariable Calculus',
    credits: 1,
    department: 'Mathematics',
    tags: ['Advanced', 'STEM'],
    description: 'Differentiation and integration in multiple dimensions.',
    term: 'Fall'
  },
  {
    id: '5',
    code: 'HIST200',
    title: 'European History',
    credits: 1,
    department: 'History',
    tags: ['Research', 'Humanities'],
    description: 'A survey of European history from the Renaissance to the present.',
    term: 'Spring'
  }
];

const App: React.FC = () => {
  const [isMyListOpen, setIsMyListOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // We'll mock a "saved list" by taking a few items from mock courses
  // Adding duplicates to show department grouping better
  const savedCourses = [MOCK_COURSES[0], MOCK_COURSES[1], MOCK_COURSES[2], MOCK_COURSES[3]];

  const toggleMyList = () => setIsMyListOpen(!isMyListOpen);

  // Dynamic grid classes based on sidebar state
  // When sidebar is open, we reduce column count at certain breakpoints to keep cards readable
  const gridClasses = viewMode === 'grid' 
    ? isMyListOpen 
      ? 'grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3' 
      : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
    : 'flex flex-col space-y-4';

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      
      {/* Left Sidebar */}
      <Sidebar isMyListOpen={isMyListOpen} toggleMyList={toggleMyList} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Header />

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar relative">
          
          {/* 
            Content Wrapper.
            We use a margin transition on the right side to "push" content or simply allow the panel to overlay.
           */}
          <div 
            className={`
              p-8 max-w-7xl mx-auto transition-all duration-500 ease-in-out
              ${isMyListOpen ? 'mr-[400px]' : 'mr-0'}
            `}
          >
            {/* Page Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Explore Courses</h2>
              <p className="text-slate-500 max-w-3xl">
                Discover distinct programs, follow your curiosity, and plan your academic journey across 300+ rigorous offerings.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard 
                label="Courses Available" 
                value="307" 
                icon={<BookOpen className="w-5 h-5 text-blue-600" />} 
                iconBgColor="bg-blue-100"
              />
              <StatCard 
                label="New This Year" 
                value="12" 
                icon={<Zap className="w-5 h-5 text-orange-600" />} 
                iconBgColor="bg-orange-100"
              />
              <StatCard 
                label="AP Offerings" 
                value="24" 
                icon={<Bookmark className="w-5 h-5 text-indigo-600" />} 
                iconBgColor="bg-indigo-100"
              />
              <StatCard 
                label="Interdisciplinary" 
                value="18" 
                icon={<Shuffle className="w-5 h-5 text-emerald-600" />} 
                iconBgColor="bg-emerald-100"
              />
            </div>

            {/* Filter / Sort Bar */}
            <div className="flex justify-end mb-6">
              <div className="bg-white border border-slate-200 rounded-lg p-1 flex">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <ListIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Course List */}
            <div className={`gap-4 ${gridClasses}`}>
              {MOCK_COURSES.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
              {/* Duplicate to fill space for demo */}
               {MOCK_COURSES.map(course => (
                <CourseCard key={`${course.id}-dup`} course={{...course, id: `${course.id}-dup`}} />
              ))}
            </div>
          </div>
        </main>
        
        {/* Right Side Panel - "My List" */}
        <MyListPanel 
          isOpen={isMyListOpen} 
          onClose={() => setIsMyListOpen(false)} 
          savedCourses={savedCourses}
        />

      </div>
    </div>
  );
};

export default App;