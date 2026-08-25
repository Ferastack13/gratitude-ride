import type { Database } from "@/types/database";

export type DeliveryStatus = Database["public"]["Enums"]["delivery_status"];

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export function formatStatus(status: string) {
  return status.replace(/_/g, " ");
}

export function statusTone(
  status: DeliveryStatus | string
): "primary" | "success" | "warning" | "danger" | "muted" {
  switch (status) {
    case "delivered":
      return "success";
    case "pending":
      return "warning";
    case "cancelled":
      return "danger";
    case "accepted":
    case "picked_up":
    case "in_transit":
      return "primary";
    default:
      return "muted";
  }
}

export function shortAddress(address: string) {
  const parts = address.split(",");
  return parts.slice(0, 2).join(",").trim() || address;
}
