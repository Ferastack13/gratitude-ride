import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

interface SectionHeaderProps {
  badge?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  dark?: boolean;
  className?: string;
}

export function SectionHeader({
  badge,
  title,
  description,
  align = "center",
  dark = false,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {badge && (
        <Badge variant={dark ? "secondary" : "primary"} className="mb-4">
          {badge}
        </Badge>
      )}
      <h2
        className={cn(
          "font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight",
          dark ? "text-white" : "text-dark"
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-4 text-base sm:text-lg leading-relaxed",
            dark ? "text-white/60" : "text-muted"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
