import { BookDeliveryForm } from "@/components/dashboard/BookDeliveryForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Book Delivery" };

export default function BookDeliveryPage() {
  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Book a Delivery
        </h1>
        <p className="text-muted text-sm mt-1">
          Choose Lagos, Abuja, or Port Harcourt, set pickup and drop-off on the
          map, and get an instant quote.
        </p>
      </div>
      <BookDeliveryForm />
    </div>
  );
}
