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
  /** Service details screen copy — only features the app actually supports. */
  detailsHeadline: string;
  detailsIntro: string;
  benefits: string[];
  availabilityNote?: string;
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
    detailsHeadline: "Standard Ride",
    detailsIntro: "Everyday rides across town — simple, reliable booking.",
    benefits: [
      "Comfortable everyday ride",
      "Driver matching near your pickup",
      "Real-time trip status",
      "Live driver location after acceptance",
    ],
  },
  {
    id: "express",
    title: "Express",
    description: "Faster pickup when available",
    fareMult: 1.25,
    etaMult: 0.75,
    icon: "flash-outline",
    detailsHeadline: "Express Ride",
    detailsIntro:
      "Prioritized matching for a quicker pickup when drivers are nearby.",
    benefits: [
      "Faster pickup when drivers are available",
      "Same live trip status as Standard",
      "Live driver location after acceptance",
      "Clear fare estimate before you confirm",
    ],
    availabilityNote:
      "Pickup speed depends on nearby drivers — Express does not guarantee a faster arrival.",
  },
  {
    id: "comfort",
    title: "Comfort",
    description: "Extra space and comfort",
    fareMult: 1.4,
    etaMult: 1.05,
    icon: "star-outline",
    detailsHeadline: "Comfort Ride",
    detailsIntro: "Extra space and a more comfortable ride when you want it.",
    benefits: [
      "Extra space and comfort focus",
      "Driver matching near your pickup",
      "Real-time trip status",
      "Live driver location after acceptance",
    ],
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

export function isRideOptionId(id?: string | null): id is RideOptionId {
  return id === "standard" || id === "express" || id === "comfort";
}
