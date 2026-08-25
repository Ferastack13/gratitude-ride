"use client";

import { signOut } from "@/lib/actions/auth";
import type { Profile } from "@/lib/auth";
import type { DashboardMode } from "@/lib/mode";
import { LogOut, User } from "lucide-react";
import { useTransition } from "react";

export function DashboardUserMenu({
  profile,
  activeMode,
}: {
  profile: Profile;
  activeMode: DashboardMode | "admin";
}) {
  const [isPending, startTransition] = useTransition();
  const modeLabel =
    activeMode === "admin"
      ? "admin"
      : activeMode === "rider"
        ? "rider mode"
        : "client mode";

  return (
    <div className="flex items-center gap-3">
      <div className="text-right hidden sm:block">
        <p className="text-sm font-medium text-dark leading-tight">
          {profile.full_name}
        </p>
        <p className="text-xs text-muted capitalize">{modeLabel}</p>
      </div>
      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
        <User className="h-4 w-4" />
      </div>
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => signOut())}
        className="p-2 rounded-lg text-muted hover:text-danger hover:bg-danger/5 transition-colors"
        aria-label="Sign out"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}
