import type { Metadata } from "next";

export const metadata: Metadata = { title: "Orders" };

export default function RiderOrdersPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="font-display text-2xl font-bold tracking-tight">Orders</h1>
      <div className="rounded-2xl bg-white border border-border shadow-card p-8 text-center text-muted text-sm">
        Incoming delivery requests will appear here when you&apos;re online.
      </div>
    </div>
  );
}
