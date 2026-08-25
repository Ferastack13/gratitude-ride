import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "outline";
}

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: "bg-dark/5 text-dark",
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/20 text-dark",
    success: "bg-green-100 text-green-700",
    warning: "bg-amber-100 text-amber-700",
    outline: "border border-border text-muted bg-transparent",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
