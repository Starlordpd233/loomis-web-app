import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CourseCardProps {
  code: string;
  credits: number;
  title: string;
  description: string;
  tags: string[];
  icon: React.ReactNode;
  iconBgClass?: string;
  codeBgClass?: string;
  codeTextClass?: string;
}

export function CourseCard({
  code,
  credits,
  title,
  description,
  tags,
  icon,
  iconBgClass = "bg-primary/10",
  codeBgClass = "bg-primary",
  codeTextClass = "text-primary-foreground",
}: CourseCardProps) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group relative">
      {/* Favorite Button */}
      <button className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted">
        <Star className="w-4 h-4 text-muted-foreground" />
      </button>

      {/* Icon */}
      <div
        className={cn(
          "w-14 h-14 rounded-xl flex items-center justify-center mb-4",
          iconBgClass
        )}
      >
        {icon}
      </div>

      {/* Course Code & Credits */}
      <div className="flex items-center gap-3 mb-3">
        <Badge className={cn("text-xs font-semibold", codeBgClass, codeTextClass)}>
          {code}
        </Badge>
        <span className="text-xs text-muted-foreground font-medium">
          CREDITS: {credits}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-foreground text-lg mb-2 leading-tight">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
        {description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-md"
          >
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}
