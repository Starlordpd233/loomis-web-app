import React from 'react';
import { 
  Compass, 
  Star, 
  ListChecks, 
  Code, 
  BookOpen, 
  Globe, 
  Calculator, 
  FlaskConical, 
  Languages, 
  Music, 
  Palette, 
  Users 
} from 'lucide-react';

interface SidebarProps {
  isMyListOpen: boolean;
  toggleMyList: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMyListOpen, toggleMyList }) => {
  const navItemClass = (active: boolean) => 
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
      active 
        ? 'bg-indigo-600 text-white' 
        : 'text-slate-600 hover:bg-slate-100'
    }`;

  const subHeaderClass = "text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 mt-8 mb-2";

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col flex-shrink-0 z-20">
      {/* Brand Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
          <BookOpen className="text-white w-5 h-5" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-900 leading-tight">LOOMIS CHAFFEE</h1>
          <p className="text-[10px] text-slate-500 font-medium tracking-wide">ACADEMIC CATALOG</p>
        </div>
      </div>

      {/* Navigation Scroll Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar py-6 px-3">
        
        <div className={subHeaderClass}>Discover</div>
        <div className="space-y-1">
          <div className={navItemClass(true)}>
            <Compass className="w-4 h-4" />
            All Courses
          </div>
          
          <div 
            className={navItemClass(isMyListOpen)} 
            onClick={toggleMyList}
            role="button"
          >
            <Star className={`w-4 h-4 ${isMyListOpen ? 'fill-current' : ''}`} />
            My List
          </div>

          <div className={navItemClass(false)}>
            <ListChecks className="w-4 h-4" />
            Requirements
          </div>
        </div>

        <div className={subHeaderClass}>Academic Units</div>
        <div className="space-y-1">
          <div className={navItemClass(false)}>
            <Code className="w-4 h-4" />
            Computer Science
          </div>
          <div className={navItemClass(false)}>
            <BookOpen className="w-4 h-4" />
            English
          </div>
          <div className={navItemClass(false)}>
            <Globe className="w-4 h-4" />
            History
          </div>
          <div className={navItemClass(false)}>
            <Calculator className="w-4 h-4" />
            Mathematics
          </div>
          <div className={navItemClass(false)}>
            <FlaskConical className="w-4 h-4" />
            Science
          </div>
          <div className={navItemClass(false)}>
            <Languages className="w-4 h-4" />
            Modern Languages
          </div>
          <div className={navItemClass(false)}>
            <Music className="w-4 h-4" />
            Performing Arts
          </div>
          <div className={navItemClass(false)}>
            <Palette className="w-4 h-4" />
            Visual Arts
          </div>
          <div className={navItemClass(false)}>
            <Users className="w-4 h-4" />
            Social Sciences
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;