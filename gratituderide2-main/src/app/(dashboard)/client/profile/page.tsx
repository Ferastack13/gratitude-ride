import type { Metadata } from "next";
import { getCurrentProfile } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Profile" };

export default async function ClientProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="font-display text-2xl font-bold tracking-tight">Profile</h1>
      <div className="rounded-2xl bg-white border border-border shadow-card p-6 space-y-4">
        {[
          { label: "Full name", value: profile.full_name },
          { label: "Email", value: profile.email },
          { label: "Phone", value: profile.phone || "—" },
          { label: "Role", value: profile.role },
        ].map((row) => (
          <div key={row.label} className="flex justify-between gap-4 text-sm">
            <span className="text-muted">{row.label}</span>
            <span className="font-medium capitalize text-right">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
