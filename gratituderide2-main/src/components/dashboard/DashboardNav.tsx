"use client";

import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";
import {
  BarChart3,
  Bell,
  Bike,
  CreditCard,
  LayoutDashboard,
  MapPin,
  Package,
  Settings,
  Star,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const clientLinks = [
  { href: "/client", label: "Overview", icon: LayoutDashboard },
  { href: "/client/book", label: "Book Delivery", icon: Package },
  { href: "/client/deliveries", label: "My Deliveries", icon: MapPin },
  { href: "/client/payments", label: "Payments", icon: CreditCard },
  { href: "/client/addresses", label: "Addresses", icon: MapPin },
  { href: "/client/notifications", label: "Notifications", icon: Bell },
  { href: "/client/profile", label: "Profile", icon: Settings },
];

const riderLinks = [
  { href: "/rider", label: "Overview", icon: LayoutDashboard },
  { href: "/rider/orders", label: "Orders", icon: Package },
  { href: "/rider/earnings", label: "Earnings", icon: Wallet },
  { href: "/rider/history", label: "History", icon: Bike },
  { href: "/rider/notifications", label: "Notifications", icon: Bell },
  { href: "/rider/profile", label: "Profile", icon: Settings },
];

const adminLinks = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/riders", label: "Riders", icon: Bike },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/deliveries", label: "Deliveries", icon: Package },
  { href: "/admin/revenue", label: "Revenue", icon: Wallet },
  { href: "/admin/coupons", label: "Coupons", icon: Star },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function linksForRole(role: UserRole) {
  if (role === "admin") return adminLinks;
  if (role === "rider") return riderLinks;
  return clientLinks;
}

export function DashboardNav({
  role,
  mobile = false,
}: {
  role: UserRole;
  mobile?: boolean;
}) {
  const pathname = usePathname();
  const links = linksForRole(role);

  if (mobile) {
    return (
      <nav className="flex gap-1 px-3 py-2" aria-label="Dashboard">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || (href !== `/${role === "client" ? "client" : role === "rider" ? "rider" : "admin"}` && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted hover:text-dark hover:bg-dark/5"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="flex-1 p-4 space-y-1" aria-label="Dashboard">
      {links.map(({ href, label, icon: Icon }) => {
        const home =
          role === "admin" ? "/admin" : role === "rider" ? "/rider" : "/client";
        const active =
          pathname === href || (href !== home && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted hover:text-dark hover:bg-dark/5"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
