import type { Metadata } from "next";

export const metadata: Metadata = { title: "Payments" };

export default function ClientPaymentsPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="font-display text-2xl font-bold tracking-tight">
        Payment History
      </h1>
      <div className="rounded-2xl bg-white border border-border shadow-card p-8 text-center text-muted text-sm">
        Payments via Paystack will appear here after your first delivery.
      </div>
    </div>
  );
}
