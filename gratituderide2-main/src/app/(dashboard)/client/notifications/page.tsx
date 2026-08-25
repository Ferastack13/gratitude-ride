import type { Metadata } from "next";

export const metadata: Metadata = { title: "Notifications" };

export default function ClientNotificationsPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="font-display text-2xl font-bold tracking-tight">
        Notifications
      </h1>
      <div className="rounded-2xl bg-white border border-border shadow-card p-8 text-center text-muted text-sm">
        You&apos;re all caught up. Delivery updates will show here.
      </div>
    </div>
  );
}
