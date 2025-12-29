import { Search, Filter, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TopHeaderProps {
  sidebarCollapsed: boolean;
}

export function TopHeader({ sidebarCollapsed }: TopHeaderProps) {
  return (
    <header
      className={`fixed top-0 right-0 z-30 h-16 bg-background border-b border-border transition-all duration-300 ${
        sidebarCollapsed ? "left-16" : "left-64"
      }`}
    >
      <div className="flex items-center justify-between h-full px-6">
        {/* Search Bar */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by course name, Department, or keyword"
              className="pl-10 pr-12 bg-card border-border h-10 rounded-xl"
            />
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4 ml-6">
          {/* User Avatars */}
          <div className="flex -space-x-2">
            <Avatar className="w-8 h-8 border-2 border-background">
              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <Avatar className="w-8 h-8 border-2 border-background">
              <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64" />
              <AvatarFallback>AS</AvatarFallback>
            </Avatar>
            <Avatar className="w-8 h-8 border-2 border-background">
              <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64" />
              <AvatarFallback>MJ</AvatarFallback>
            </Avatar>
            <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
              <span className="text-xs font-medium text-muted-foreground">+12</span>
            </div>
          </div>

          {/* Notification Bell */}
          <Button size="icon" variant="ghost" className="relative">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
          </Button>
        </div>
      </div>
    </header>
  );
}
