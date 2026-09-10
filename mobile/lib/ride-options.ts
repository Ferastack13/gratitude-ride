import { estimateDeliveryFee } from "@/lib/geo";

export type RideOptionId = "standard" | "express" | "comfort";

export type RideOption = {
  id: RideOptionId;
  title: string;
  description: string;
  /** Multiplier on local base fare (client-side until backend pricing exists). */
  fareMult: number;
  /** Multiplier on drive duration for pickup ETA heuristic. */
  etaMult: number;
  icon: "car-outline" | "flash-outline" | "star-outline";
};

/**
 * UI ride catalog. Fares use local estimateDeliveryFee × mult until a pricing API exists.
 * Mark quotes with `pricingSource: "local"` in callers.
 */
export const RIDE_OPTIONS: RideOption[] = [
  {
    id: "standard",
    title: "Standard",
    description: "Everyday rides across town",
    fareMult: 1,
    etaMult: 1,
    icon: "car-outline",
  },
  {
    id: "express",
    title: "Express",
    description: "Faster pickup when available",
    fareMult: 1.25,
    etaMult: 0.75,
    icon: "flash-outline",
  },
  {
    id: "comfort",
    title: "Comfort",
    description: "Extra space and comfort",
    fareMult: 1.4,
    etaMult: 1.05,
    icon: "star-outline",
  },
];

export function quoteRideFare(distanceKm: number, option: RideOption) {
  const base = estimateDeliveryFee(distanceKm);
  return Math.round(base * option.fareMult);
}

export function quotePickupEtaMin(driveMin: number, option: RideOption) {
  return Math.max(3, Math.round(Math.min(driveMin, 18) * option.etaMult + 2));
}

export function rideOptionById(id?: string | null): RideOption {
  return RIDE_OPTIONS.find((o) => o.id === id) ?? RIDE_OPTIONS[0]!;
}
