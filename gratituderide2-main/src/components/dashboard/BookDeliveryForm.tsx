"use client";

import {
  distanceKm,
  estimateDeliveryFee,
  getCityConfig,
  type CityPoint,
  type ServiceCity,
} from "@/lib/cities";
import { CityMap } from "@/components/maps/CityMap";
import { CitySelector } from "@/components/maps/CitySelector";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/utils";
import { ArrowRight, Navigation } from "lucide-react";
import { useMemo, useState } from "react";

export function BookDeliveryForm() {
  const [city, setCity] = useState<ServiceCity>("Lagos");
  const config = getCityConfig(city);
  const [pickupId, setPickupId] = useState(config.hubs[0].id);
  const [dropoffId, setDropoffId] = useState(config.hubs[1].id);
  const [notes, setNotes] = useState("");
  const [booked, setBooked] = useState(false);

  const pickup =
    config.hubs.find((h) => h.id === pickupId) ?? config.hubs[0];
  const dropoff =
    config.hubs.find((h) => h.id === dropoffId) ?? config.hubs[1];

  const onCityChange = (next: ServiceCity) => {
    const nextConfig = getCityConfig(next);
    setCity(next);
    setPickupId(nextConfig.hubs[0].id);
    setDropoffId(nextConfig.hubs[1].id);
    setBooked(false);
  };

  const km = useMemo(
    () => distanceKm(pickup, dropoff),
    [pickup, dropoff]
  );
  const fee = estimateDeliveryFee(km);

  const markers = [
    {
      id: pickup.id,
      lat: pickup.lat,
      lng: pickup.lng,
      label: `Pickup · ${pickup.label}`,
      color: "primary" as const,
    },
    {
      id: dropoff.id,
      lat: dropoff.lat,
      lng: dropoff.lng,
      label: `Drop-off · ${dropoff.label}`,
      color: "secondary" as const,
    },
  ];

  const route = [
    { lat: pickup.lat, lng: pickup.lng },
    { lat: dropoff.lat, lng: dropoff.lng },
  ];

  const selectOptions = (hubs: CityPoint[]) =>
    hubs.map((h) => (
      <option key={h.id} value={h.id}>
        {h.label} — {h.address}
      </option>
    ));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-5 rounded-2xl bg-white border border-border shadow-card p-5 sm:p-6">
        <div>
          <p className="text-sm font-medium text-dark mb-2">Service city</p>
          <CitySelector value={city} onChange={onCityChange} />
        </div>

        <label className="block">
          <span className="block text-sm font-medium text-dark mb-1.5">
            Pickup
          </span>
          <select
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm"
            value={pickupId}
            onChange={(e) => {
              setPickupId(e.target.value);
              setBooked(false);
            }}
          >
            {selectOptions(config.hubs)}
          </select>
        </label>

        <label className="block">
          <span className="block text-sm font-medium text-dark mb-1.5">
            Drop-off
          </span>
          <select
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm"
            value={dropoffId}
            onChange={(e) => {
              setDropoffId(e.target.value);
              setBooked(false);
            }}
          >
            {selectOptions(config.hubs)}
          </select>
        </label>

        <Input
          label="Package notes (optional)"
          placeholder="Fragile, leave with security…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="rounded-xl bg-surface border border-border p-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted uppercase tracking-wide">Quote</p>
            <p className="font-display text-2xl font-bold mt-1">
              {formatCurrency(fee)}
            </p>
            <p className="text-xs text-muted mt-1 flex items-center gap-1">
              <Navigation className="h-3 w-3" />
              ~{km.toFixed(1)} km in {city}
            </p>
          </div>
          <Button
            type="button"
            size="lg"
            onClick={() => setBooked(true)}
            disabled={pickupId === dropoffId}
          >
            Confirm booking
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {booked && (
          <div
            role="status"
            className="rounded-xl bg-primary/10 text-primary text-sm px-4 py-3"
          >
            Booking draft saved for {city}: {pickup.label} → {dropoff.label}
            {notes ? ` · ${notes}` : ""}. A rider nearby will be matched next.
          </div>
        )}
      </div>

      <div className="space-y-3">
        <CityMap
          center={config.center}
          zoom={config.zoom}
          markers={markers}
          route={route}
          height="420px"
        />
        <p className="text-xs text-muted">
          Coverage hubs in {city}. Pickup and drop-off update the map route
          instantly.
        </p>
      </div>
    </div>
  );
}
