"use client";

import { switchDashboardMode } from "@/lib/actions/mode";
import type { DashboardMode } from "@/lib/mode";
import { cn } from "@/lib/utils";
import { Bike, Package } from "lucide-react";
import { useTransition } from "react";

export function ModeSwitcher({
  mode,
  className,
}: {
  mode: DashboardMode;
  className?: string;
}) {
  const [isPending, startTransition] = useTransition();

  const setMode = (next: DashboardMode) => {
    if (next === mode || isPending) return;
    startTransition(async () => {
      try {
        await switchDashboardMode(next);
      } catch (err) {
        if (
          typeof err === "object" &&
          err !== null &&
          "digest" in err &&
          typeof (err as { digest: unknown }).digest === "string" &&
          (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
        ) {
          throw err;
        }
      }
    });
  };

  return (
    <div
      className={cn(
        "inline-flex rounded-xl bg-dark/5 p-1 border border-border",
        className
      )}
      role="group"
      aria-label="Switch dashboard mode"
    >
      <button
        type="button"
        disabled={isPending}
        onClick={() => setMode("client")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors",
          mode === "client"
            ? "bg-white text-dark shadow-sm"
            : "text-muted hover:text-dark"
        )}
      >
        <Package className="h-3.5 w-3.5" />
        Client
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => setMode("rider")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors",
          mode === "rider"
            ? "bg-white text-dark shadow-sm"
            : "text-muted hover:text-dark"
        )}
      >
        <Bike className="h-3.5 w-3.5" />
        Rider
      </button>
    </div>
  );
}
