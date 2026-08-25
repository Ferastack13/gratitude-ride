import type { Metadata } from "next";

export const metadata: Metadata = { title: "Earnings" };

export default function RiderEarningsPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="font-display text-2xl font-bold tracking-tight">
        Earnings & Withdrawals
      </h1>
      <div className="rounded-2xl bg-white border border-border shadow-card p-8 text-center text-muted text-sm">
        Track earnings and request withdrawals once deliveries are completed.
      </div>
    </div>
  );
}
