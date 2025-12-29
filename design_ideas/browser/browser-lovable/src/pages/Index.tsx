import { useState } from "react";
import { LayoutGrid, List, ClipboardList, Zap, Award, Shuffle } from "lucide-react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopHeader } from "@/components/layout/TopHeader";
import { StatsCard } from "@/components/courses/StatsCard";
import { CourseGrid } from "@/components/courses/CourseGrid";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <TopHeader sidebarCollapsed={sidebarCollapsed} />

      {/* Main Content */}
      <main
        className={cn(
          "pt-16 min-h-screen transition-all duration-300",
          sidebarCollapsed ? "pl-16" : "pl-64"
        )}
      >
        <div className="p-6 lg:p-8">
          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Explore Courses
              </h1>
              <p className="text-muted-foreground text-base lg:text-lg max-w-2xl">
                Discover distinct programs, follow your curiosity, and plan your
                academic journey across 300+ rigorous offerings.
              </p>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "gap-2 rounded-lg",
                  viewMode === "grid" && "bg-muted"
                )}
              >
                <LayoutGrid className="w-4 h-4" />
                Grid
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("list")}
                className={cn(
                  "gap-2 rounded-lg",
                  viewMode === "list" && "bg-muted"
                )}
              >
                <List className="w-4 h-4" />
                List
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard
              icon={<ClipboardList className="w-5 h-5" />}
              label="Courses Available"
              value={7}
              iconBgClass="bg-primary/10"
              iconTextClass="text-primary"
            />
            <StatsCard
              icon={<Zap className="w-5 h-5" />}
              label="New This Year"
              value={12}
              iconBgClass="bg-amber-100"
              iconTextClass="text-amber-600"
            />
            <StatsCard
              icon={<Award className="w-5 h-5" />}
              label="AP Offerings"
              value={24}
              iconBgClass="bg-emerald-100"
              iconTextClass="text-emerald-600"
            />
            <StatsCard
              icon={<Shuffle className="w-5 h-5" />}
              label="Interdisciplinary"
              value={18}
              iconBgClass="bg-violet-100"
              iconTextClass="text-violet-600"
            />
          </div>

          {/* Course Grid */}
          <CourseGrid />
        </div>
      </main>
    </div>
  );
};

export default Index;
