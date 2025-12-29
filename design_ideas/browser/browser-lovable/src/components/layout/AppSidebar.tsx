import { useState } from "react";
import {
  Compass,
  Star,
  ClipboardList,
  Code,
  BookOpen,
  Landmark,
  Calculator,
  FlaskConical,
  Languages,
  Drama,
  Palette,
  Users,
  Calendar,
  FileText,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NavItem {
  title: string;
  icon: React.ElementType;
  active?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const discoverItems: NavItem[] = [
  { title: "Explore Courses", icon: Compass, active: true },
  { title: "My Shortlist", icon: Star },
  { title: "Requirements", icon: ClipboardList },
];

const academicUnits: NavItem[] = [
  { title: "Computer Science", icon: Code },
  { title: "English", icon: BookOpen },
  { title: "History", icon: Landmark },
  { title: "Mathematics", icon: Calculator },
  { title: "Science", icon: FlaskConical },
  { title: "Modern Languages", icon: Languages },
  { title: "Performing Arts", icon: Drama },
  { title: "Visual Arts", icon: Palette },
  { title: "Social Sciences", icon: Users },
];

const resources: NavItem[] = [
  { title: "Calendar 2025-26", icon: Calendar },
  { title: "Student Handbook", icon: FileText },
];

const navSections: NavSection[] = [
  { title: "DISCOVER", items: discoverItems },
  { title: "ACADEMIC UNITS", items: academicUnits },
  { title: "RESOURCES", items: resources },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const [activeItem, setActiveItem] = useState("Explore Courses");

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-6 h-6 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sidebar-foreground text-sm tracking-wide truncate">
                LOOMIS CHAFFEE
              </span>
              <span className="text-[10px] text-sidebar-muted tracking-widest uppercase">
                Academic Catalog
              </span>
              <span className="text-[10px] text-sidebar-primary font-medium">
                2025-2026
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        {navSections.map((section) => (
          <div key={section.title} className="mb-6">
            {!collapsed && (
              <span className="text-[10px] font-semibold text-sidebar-muted tracking-wider px-3 mb-2 block">
                {section.title}
              </span>
            )}
            <nav className="space-y-1">
              {section.items.map((item) => {
                const isActive = activeItem === item.title;
                return (
                  <button
                    key={item.title}
                    onClick={() => setActiveItem(item.title)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent"
                    )}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    {!collapsed && (
                      <span className="truncate">{item.title}</span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </ScrollArea>

      {/* AI Counselor Card */}
      {!collapsed && (
        <div className="p-4">
          <div className="rounded-xl bg-gradient-to-br from-sidebar-primary/20 to-sidebar-accent p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-sidebar-primary" />
              <span className="text-xs font-semibold text-sidebar-foreground uppercase tracking-wide">
                AI Counselor
              </span>
            </div>
            <p className="text-xs text-sidebar-muted mb-3">
              Need help picking courses for next term?
            </p>
            <Button
              size="sm"
              className="w-full bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground"
            >
              Ask Advisor
            </Button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 bg-sidebar-primary rounded-full flex items-center justify-center text-sidebar-primary-foreground shadow-md hover:bg-sidebar-primary/90 transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </aside>
  );
}
