import { Logo } from "@/components/layout/Logo";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { DashboardUserMenu } from "@/components/dashboard/DashboardUserMenu";
import { ModeSwitcher } from "@/components/dashboard/ModeSwitcher";
import { getCurrentProfile } from "@/lib/auth";
import { getDashboardMode } from "@/lib/mode";
import type { UserRole } from "@/types";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login");
  }

  const mode = await getDashboardMode(profile.role);
  const navRole: UserRole =
    mode === "admin" ? "admin" : mode === "rider" ? "rider" : "client";

  return (
    <div className="min-h-screen bg-surface flex">
      <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-white">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Logo size="sm" />
        </div>
        <DashboardNav role={navRole} />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-white flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="lg:hidden">
            <Logo size="sm" />
          </div>
          <div className="flex-1 flex justify-center lg:justify-start">
            {mode !== "admin" && <ModeSwitcher mode={mode} />}
          </div>
          <DashboardUserMenu profile={profile} activeMode={mode} />
        </header>

        <div className="lg:hidden border-b border-border bg-white overflow-x-auto">
          <DashboardNav role={navRole} mobile />
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
