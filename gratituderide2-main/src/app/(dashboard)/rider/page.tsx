import { RiderCityPanel } from "@/components/dashboard/RiderCityPanel";
import { Badge } from "@/components/ui/Badge";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import { Bike, Power, Wallet } from "lucide-react";
import { redirect } from "next/navigation";

export default async function RiderDashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const supabase = await createClient();
  const { data: rider } = await supabase
    .from("riders")
    .select(
      "is_available, is_verified, earnings, total_deliveries, vehicle_type, rating"
    )
    .eq("user_id", profile.id)
    .maybeSingle();

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
            Rider Hub
          </h1>
          <p className="text-muted mt-1 text-sm">
            {profile.full_name} · {rider?.vehicle_type || "Motorcycle"} · Lagos,
            Abuja & Port Harcourt
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={rider?.is_verified ? "success" : "warning"}>
            {rider?.is_verified ? "Verified" : "Pending verification"}
          </Badge>
          <Badge variant={rider?.is_available ? "primary" : "default"}>
            <Power className="h-3 w-3 mr-1" />
            {rider?.is_available ? "Online" : "Offline"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Today's Earnings",
            value: formatCurrency(Number(rider?.earnings || 0) || 12500),
            icon: Wallet,
          },
          {
            label: "Total Deliveries",
            value: String(rider?.total_deliveries || 0),
            icon: Bike,
          },
          {
            label: "Rating",
            value: `${Number(rider?.rating || 5).toFixed(1)}★`,
            icon: Bike,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl bg-white border border-border p-5 shadow-card"
          >
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <stat.icon className="h-5 w-5" />
            </div>
            <p className="mt-4 font-display text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <RiderCityPanel />
    </div>
  );
}
