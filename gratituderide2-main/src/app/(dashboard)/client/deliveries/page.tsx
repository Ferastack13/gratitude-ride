import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Deliveries" };

export default function ClientDeliveriesPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="font-display text-2xl font-bold tracking-tight">
        My Deliveries
      </h1>
      <div className="rounded-2xl bg-white border border-border shadow-card p-8 text-center text-muted text-sm">
        No live deliveries yet. Book your first package to see tracking here.
      </div>
    </div>
  );
}
