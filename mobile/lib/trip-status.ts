import type { DeliveryStatus } from "@/lib/format";

/** Passenger-facing trip stages mapped from delivery status. */
export type TripStage =
  | "searching"
  | "driver_found"
  | "arriving"
  | "arrived"
  | "in_trip"
  | "completed"
  | "cancelled";

export function tripStageFromStatus(status: DeliveryStatus): TripStage {
  switch (status) {
    case "pending":
      return "searching";
    case "accepted":
      return "driver_found";
    case "picked_up":
      return "arrived";
    case "in_transit":
      return "in_trip";
    case "delivered":
      return "completed";
    case "cancelled":
      return "cancelled";
    default:
      return "searching";
  }
}

export const TRIP_STAGE_COPY: Record<
  TripStage,
  { title: string; detail: string }
> = {
  searching: {
    title: "Searching for driver",
    detail: "We’re matching a nearby driver to your trip.",
  },
  driver_found: {
    title: "Driver found",
    detail: "Your driver is heading to the pickup point.",
  },
  arriving: {
    title: "Driver arriving",
    detail: "Stay ready at the pickup location.",
  },
  arrived: {
    title: "Driver arrived",
    detail: "Meet your driver at the pickup point.",
  },
  in_trip: {
    title: "Trip started",
    detail: "You’re on the way to your destination.",
  },
  completed: {
    title: "Trip completed",
    detail: "Thanks for riding with Gratitude Ride.",
  },
  cancelled: {
    title: "Trip cancelled",
    detail: "This trip was cancelled.",
  },
};

export const PASSENGER_TIMELINE_LABELS: Record<DeliveryStatus, string> = {
  pending: "Searching for driver",
  accepted: "Driver found",
  picked_up: "Driver arrived",
  in_transit: "Trip started",
  delivered: "Trip completed",
  cancelled: "Cancelled",
};
