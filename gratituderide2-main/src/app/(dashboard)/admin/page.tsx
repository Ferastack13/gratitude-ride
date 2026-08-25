import { Badge } from "@/components/ui/Badge";
import { getCurrentProfile } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import {
  Bike,
  Package,
  TrendingUp,
  Users,
} from "lucide-react";
import { redirect } from "next/navigation";

const metrics = [
  { label: "Total Revenue", value: formatCurrency(12840000), icon: TrendingUp },
  { label: "Active Deliveries", value: "148", icon: Package },
  { label: "Verified Riders", value: "2,314", icon: Bike },
  { label: "Clients", value: "18.4K", icon: Users },
];

export default async function AdminDashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    if (!profile) redirect("/login");
    redirect("/dashboard");
  }

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-muted mt-1 text-sm">
          Platform overview across Lagos, Abuja & Port Harcourt
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((stat) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-2xl bg-white border border-border shadow-card p-6">
          <h2 className="font-display font-semibold text-lg mb-4">
            City Performance
          </h2>
          <ul className="space-y-4">
            {[
              { city: "Lagos", deliveries: 842, revenue: 5400000 },
              { city: "Abuja", deliveries: 391, revenue: 2800000 },
              { city: "Port Harcourt", deliveries: 274, revenue: 1900000 },
            ].map((row) => (
              <li
                key={row.city}
                className="flex items-center justify-between gap-4"
              >
                <div>
                  <p className="font-medium">{row.city}</p>
                  <p className="text-xs text-muted">
                    {row.deliveries} deliveries today
                  </p>
                </div>
                <p className="font-semibold text-primary">
                  {formatCurrency(row.revenue)}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl bg-white border border-border shadow-card p-6">
          <h2 className="font-display font-semibold text-lg mb-4">
            Pending Actions
          </h2>
          <ul className="space-y-3">
            {[
              { label: "Disputed deliveries", count: 3, tone: "warning" as const },
              { label: "Coupon requests", count: 5, tone: "primary" as const },
              { label: "Rider verifications", count: 12, tone: "secondary" as const },
            ].map((item) => (
              <li
                key={item.label}
                className="flex items-center justify-between rounded-xl bg-surface px-4 py-3"
              >
                <span className="text-sm font-medium">{item.label}</span>
                <Badge variant={item.tone}>{item.count}</Badge>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
