"use client";

import { getCityConfig, type ServiceCity } from "@/lib/cities";
import { CityMap } from "@/components/maps/CityMap";
import { CitySelector } from "@/components/maps/CitySelector";
import { useMemo, useState } from "react";

const deliveriesByCity: Record<
  ServiceCity,
  { id: string; to: string; status: string; fee: number; lat: number; lng: number }[]
> = {
  Lagos: [
    {
      id: "GR7X2K9M",
      to: "Lekki Phase 1",
      status: "in_transit",
      fee: 3200,
      lat: 6.4474,
      lng: 3.4721,
    },
    {
      id: "GR4P8N2Q",
      to: "Ikeja GRA",
      status: "delivered",
      fee: 2100,
      lat: 6.6018,
      lng: 3.3515,
    },
    {
      id: "GR9M1L5R",
      to: "Yaba",
      status: "pending",
      fee: 1800,
      lat: 6.5095,
      lng: 3.3711,
    },
  ],
  Abuja: [
    {
      id: "GRAB1W2E",
      to: "Maitama",
      status: "in_transit",
      fee: 2800,
      lat: 9.0882,
      lng: 7.4922,
    },
    {
      id: "GRAB3R4T",
      to: "Wuse 2",
      status: "pending",
      fee: 2200,
      lat: 9.065,
      lng: 7.4648,
    },
  ],
  "Port Harcourt": [
    {
      id: "GRPH5Y6U",
      to: "PH GRA",
      status: "in_transit",
      fee: 2500,
      lat: 4.829,
      lng: 7.013,
    },
    {
      id: "GRPH7I8O",
      to: "Trans Amadi",
      status: "pending",
      fee: 1900,
      lat: 4.8065,
      lng: 7.0338,
    },
  ],
};

export function ClientCityPanel() {
  const [city, setCity] = useState<ServiceCity>("Lagos");
  const config = getCityConfig(city);
  const deliveries = deliveriesByCity[city];

  const markers = useMemo(
    () =>
      deliveries.map((d) => ({
        id: d.id,
        lat: d.lat,
        lng: d.lng,
        label: `${d.id} · ${d.to}`,
        color:
          d.status === "delivered"
            ? ("dark" as const)
            : d.status === "pending"
              ? ("secondary" as const)
              : ("primary" as const),
      })),
    [deliveries]
  );

  return (
    <section className="rounded-2xl bg-white border border-border shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-semibold text-lg">Live coverage map</h2>
          <p className="text-sm text-muted">Your deliveries across {city}</p>
        </div>
        <CitySelector value={city} onChange={setCity} />
      </div>
      <div className="p-4 sm:p-5">
        <CityMap
          center={config.center}
          zoom={config.zoom}
          markers={markers}
          height="340px"
        />
      </div>
    </section>
  );
}
