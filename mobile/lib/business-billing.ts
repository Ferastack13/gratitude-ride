import type { PaymentMethod } from "@/lib/client-prefs";
import type { Delivery } from "@/lib/deliveries";
import { formatCurrency, formatStatus, shortAddress } from "@/lib/format";
import { rideTypeFromNotes } from "@/lib/ride-matching";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PAY_KEY = "gr.business.payment.method";

export type BusinessPaymentMethod = PaymentMethod;

export function paymentMethodLabel(method: BusinessPaymentMethod) {
  return method === "transfer" ? "Bank transfer" : "Cash on trip";
}

export async function getBusinessPaymentMethod(): Promise<BusinessPaymentMethod> {
  const v = await AsyncStorage.getItem(PAY_KEY);
  return v === "transfer" ? "transfer" : "cash";
}

export async function setBusinessPaymentMethod(method: BusinessPaymentMethod) {
  await AsyncStorage.setItem(PAY_KEY, method);
}

/** Pull guest name from delivery notes when present. */
export function guestFromNotes(notes: string | null | undefined): string | null {
  if (!notes) return null;
  const m = notes.match(/Guest:\s*([^·]+)/i);
  return m?.[1]?.trim() || null;
}

export function buildTripReceiptText(delivery: Delivery, companyName?: string) {
  const fee = Number(delivery.actual_fee ?? delivery.estimated_fee ?? 0);
  const when = delivery.delivered_at || delivery.created_at;
  const whenLabel = when
    ? new Date(when).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";
  const guest = guestFromNotes(delivery.notes);
  const pay =
    /Pay transfer/i.test(delivery.notes ?? "") ||
    /Bank transfer/i.test(delivery.notes ?? "")
      ? "Bank transfer"
      : /Pay cash/i.test(delivery.notes ?? "")
        ? "Cash on trip"
        : "—";

  return [
    "Gratitude Ride — Trip receipt",
    companyName ? `Company: ${companyName}` : null,
    `Tracking: ${delivery.tracking_id}`,
    `Status: ${formatStatus(delivery.status)}`,
    `When: ${whenLabel}`,
    `Ride: ${rideTypeFromNotes(delivery.notes)}`,
    guest ? `Passenger: ${guest}` : null,
    `Pickup: ${shortAddress(delivery.pickup_address)}`,
    `Drop-off: ${shortAddress(delivery.delivery_address)}`,
    delivery.city ? `City: ${delivery.city}` : null,
    `Amount: ${formatCurrency(fee)}`,
    `Payment: ${pay}`,
    "",
    "Thank you for riding with Gratitude Ride.",
  ]
    .filter(Boolean)
    .join("\n");
}
