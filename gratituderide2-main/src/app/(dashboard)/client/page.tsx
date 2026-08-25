import { ClientCityPanel } from "@/components/dashboard/ClientCityPanel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getCurrentProfile } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import {
  ArrowRight,
  Bell,
  MapPin,
  Package,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

const recentDeliveries = [
  {
    id: "GR7X2K9M",
    to: "Lekki Phase 1, Lagos",
    status: "in_transit",
    fee: 3200,
  },
  {
    id: "GRAB1W2E",
    to: "Maitama, Abuja",
    status: "delivered",
    fee: 2800,
  },
  {
    id: "GRPH5Y6U",
    to: "PH GRA, Port Harcourt",
    status: "pending",
    fee: 2500,
  },
];

export default async function ClientDashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
            Hello, {profile.full_name.split(" ")[0]}
          </h1>
          <p className="text-muted mt-1 text-sm">
            Send across Lagos, Abuja, and Port Harcourt — switch to Rider mode
            anytime.
          </p>
        </div>
        <Button href="/client/book" size="lg">
          Book a Delivery
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Active Deliveries",
            value: "2",
            icon: Package,
            tone: "text-primary bg-primary/10",
          },
          {
            label: "This Month",
            value: formatCurrency(18400),
            icon: TrendingUp,
            tone: "text-secondary-dark bg-secondary/20",
          },
          {
            label: "Notifications",
            value: "3",
            icon: Bell,
            tone: "text-dark bg-dark/5",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl bg-white border border-border p-5 shadow-card"
          >
            <div
              className={`h-10 w-10 rounded-xl flex items-center justify-center ${stat.tone}`}
            >
              <stat.icon className="h-5 w-5" />
            </div>
            <p className="mt-4 font-display text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <ClientCityPanel />

      <section className="rounded-2xl bg-white border border-border shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-display font-semibold text-lg">Recent Deliveries</h2>
          <Link
            href="/client/deliveries"
            className="text-sm text-primary hover:underline"
          >
            View all
          </Link>
        </div>
        <ul className="divide-y divide-border">
          {recentDeliveries.map((d) => (
            <li
              key={d.id}
              className="px-5 py-4 flex items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-sm font-semibold">{d.id}</p>
                  <p className="text-sm text-muted truncate">{d.to}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <Badge
                  variant={
                    d.status === "delivered"
                      ? "success"
                      : d.status === "pending"
                        ? "warning"
                        : "primary"
                  }
                >
                  {d.status.replace("_", " ")}
                </Badge>
                <p className="text-sm font-medium mt-1">
                  {formatCurrency(d.fee)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
