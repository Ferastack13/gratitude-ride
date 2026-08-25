"use client";

import { getCityConfig, type ServiceCity } from "@/lib/cities";
import { CityMap } from "@/components/maps/CityMap";
import { CitySelector } from "@/components/maps/CitySelector";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { useMemo, useState } from "react";

const ordersByCity: Record<
  ServiceCity,
  {
    id: string;
    from: string;
    to: string;
    fee: number;
    distance: string;
    fromLat: number;
    fromLng: number;
    toLat: number;
    toLng: number;
  }[]
> = {
  Lagos: [
    {
      id: "GR7X2K9M",
      from: "Victoria Island",
      to: "Lekki Phase 1",
      fee: 3200,
      distance: "8.2 km",
      fromLat: 6.4281,
      fromLng: 3.4219,
      toLat: 6.4474,
      toLng: 3.4721,
    },
    {
      id: "GR2H5K8L",
      from: "Surulere",
      to: "Yaba",
      fee: 1900,
      distance: "4.1 km",
      fromLat: 6.4969,
      fromLng: 3.3568,
      toLat: 6.5095,
      toLng: 3.3711,
    },
  ],
  Abuja: [
    {
      id: "GRAB9P0A",
      from: "Garki",
      to: "Maitama",
      fee: 2700,
      distance: "6.4 km",
      fromLat: 9.035,
      fromLng: 7.485,
      toLat: 9.0882,
      toLng: 7.4922,
    },
    {
      id: "GRAB1S2D",
      from: "Wuse 2",
      to: "Asokoro",
      fee: 2400,
      distance: "5.1 km",
      fromLat: 9.065,
      fromLng: 7.4648,
      toLat: 9.0431,
      toLng: 7.5142,
    },
  ],
  "Port Harcourt": [
    {
      id: "GRPH3F4G",
      from: "Rumuola",
      to: "PH GRA",
      fee: 2100,
      distance: "3.8 km",
      fromLat: 4.8472,
      fromLng: 7.0126,
      toLat: 4.829,
      toLng: 7.013,
    },
    {
      id: "GRPH5H6J",
      from: "Old GRA",
      to: "Trans Amadi",
      fee: 2300,
      distance: "4.6 km",
      fromLat: 4.7875,
      fromLng: 7.0139,
      toLat: 4.8065,
      toLng: 7.0338,
    },
  ],
};

export function RiderCityPanel() {
  const [city, setCity] = useState<ServiceCity>("Lagos");
  const [activeId, setActiveId] = useState<string | null>(null);
  const config = getCityConfig(city);
  const orders = ordersByCity[city];
  const active = orders.find((o) => o.id === activeId) ?? orders[0];

  const markers = useMemo(
    () => [
      {
        id: `${active.id}-from`,
        lat: active.fromLat,
        lng: active.fromLng,
        label: `Pickup · ${active.from}`,
        color: "primary" as const,
      },
      {
        id: `${active.id}-to`,
        lat: active.toLat,
        lng: active.toLng,
        label: `Drop-off · ${active.to}`,
        color: "secondary" as const,
      },
    ],
    [active]
  );

  const route = [
    { lat: active.fromLat, lng: active.fromLng },
    { lat: active.toLat, lng: active.toLng },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <section className="rounded-2xl bg-white border border-border shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display font-semibold text-lg">City map</h2>
            <p className="text-sm text-muted">Available jobs in {city}</p>
          </div>
          <CitySelector
            value={city}
            onChange={(c) => {
              setCity(c);
              setActiveId(null);
            }}
          />
        </div>
        <div className="p-4 sm:p-5">
          <CityMap
            center={config.center}
            zoom={config.zoom}
            markers={markers}
            route={route}
            height="360px"
          />
        </div>
      </section>

      <section className="rounded-2xl bg-white border border-border shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-display font-semibold text-lg">Available orders</h2>
        </div>
        <ul className="divide-y divide-border">
          {orders.map((order) => {
            const selected = order.id === active.id;
            return (
              <li key={order.id} className="px-5 py-4 space-y-3">
                <button
                  type="button"
                  onClick={() => setActiveId(order.id)}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-sm font-semibold">{order.id}</p>
                    {selected && <Badge variant="primary">On map</Badge>}
                  </div>
                  <p className="text-sm text-muted mt-1">
                    {order.from} → {order.to} · {order.distance}
                  </p>
                  <p className="text-sm font-medium mt-1 text-primary">
                    {formatCurrency(order.fee)}
                  </p>
                </button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Reject
                  </Button>
                  <Button size="sm">Accept</Button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
