/** Estimate minutes for map distance — ride-app style ETA. */
export function estimateEtaMinutes(distanceKm: number, status?: string) {
  const base = Math.max(8, Math.round(distanceKm * 3.2 + 6));
  switch (status) {
    case "pending":
      return Math.max(4, Math.round(base * 0.35));
    case "accepted":
      return Math.max(5, Math.round(base * 0.45));
    case "picked_up":
    case "in_transit":
      return Math.max(6, Math.round(base * 0.7));
    case "delivered":
      return 0;
    default:
      return base;
  }
}

export function formatEta(minutes: number) {
  if (minutes <= 0) return "Arrived";
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}
