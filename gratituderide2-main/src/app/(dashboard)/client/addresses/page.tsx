import type { Metadata } from "next";

export const metadata: Metadata = { title: "Addresses" };

export default function ClientAddressesPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="font-display text-2xl font-bold tracking-tight">
        Saved Addresses
      </h1>
      <div className="rounded-2xl bg-white border border-border shadow-card p-8 text-center text-muted text-sm">
        Save pickup and delivery locations for faster booking.
      </div>
    </div>
  );
}
