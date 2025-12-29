import { cn } from "@/lib/utils";

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  iconBgClass?: string;
  iconTextClass?: string;
}

export function StatsCard({
  icon,
  label,
  value,
  iconBgClass = "bg-primary/10",
  iconTextClass = "text-primary",
}: StatsCardProps) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          iconBgClass
        )}
      >
        <div className={iconTextClass}>{icon}</div>
      </div>
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}
