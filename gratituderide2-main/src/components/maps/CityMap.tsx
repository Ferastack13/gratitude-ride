"use client";

import { cn } from "@/lib/utils";
import { GoogleMap, MarkerF, PolylineF, useJsApiLoader } from "@react-google-maps/api";
import { MapPin } from "lucide-react";
import { useMemo } from "react";

export type MapMarker = {
  id: string;
  lat: number;
  lng: number;
  label?: string;
  color?: "primary" | "secondary" | "dark";
};

type CityMapProps = {
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: MapMarker[];
  route?: { lat: number; lng: number }[];
  className?: string;
  height?: string;
};

const markerColors = {
  primary: "#16a34a",
  secondary: "#eab308",
  dark: "#0f0f0f",
};

function FallbackMap({
  center,
  markers = [],
  className,
  height,
}: CityMapProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-[linear-gradient(160deg,#ecfdf5_0%,#f8fafc_45%,#fef9c3_100%)]",
        className
      )}
      style={{ height: height || "320px" }}
    >
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,#16a34a22_1px,transparent_1px),linear-gradient(to_bottom,#16a34a22_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center px-4">
          <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
          <p className="text-sm font-medium text-dark">
            Map preview · {center.lat.toFixed(3)}, {center.lng.toFixed(3)}
          </p>
          <p className="text-xs text-muted mt-1 max-w-xs mx-auto">
            Add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to `.env.local` for live Google
            Maps.
          </p>
        </div>
      </div>
      {markers.map((m, i) => {
        const left = 20 + ((i * 17) % 60);
        const top = 25 + ((i * 23) % 45);
        return (
          <div
            key={m.id}
            className="absolute z-10 -translate-x-1/2 -translate-y-full"
            style={{ left: `${left}%`, top: `${top}%` }}
            title={m.label}
          >
            <div
              className="h-3 w-3 rounded-full border-2 border-white shadow"
              style={{ background: markerColors[m.color || "primary"] }}
            />
            {m.label && (
              <span className="mt-1 block whitespace-nowrap rounded-md bg-white/95 px-1.5 py-0.5 text-[10px] font-medium shadow">
                {m.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function LiveGoogleMap({
  center,
  zoom = 12,
  markers = [],
  route,
  className,
  height,
}: CityMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "gratitude-ride-maps",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const path = useMemo(() => route || [], [route]);

  if (loadError || !isLoaded) {
    return (
      <FallbackMap
        center={center}
        markers={markers}
        className={className}
        height={height}
      />
    );
  }

  return (
    <div
      className={cn("overflow-hidden rounded-2xl border border-border", className)}
      style={{ height: height || "320px" }}
    >
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={center}
        zoom={zoom}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          styles: [
            { featureType: "poi", stylers: [{ visibility: "off" }] },
            {
              featureType: "road",
              elementType: "geometry",
              stylers: [{ color: "#e5e7eb" }],
            },
          ],
        }}
      >
        {markers.map((m) => (
          <MarkerF
            key={m.id}
            position={{ lat: m.lat, lng: m.lng }}
            title={m.label}
          />
        ))}
        {path.length >= 2 && (
          <PolylineF
            path={path}
            options={{
              strokeColor: "#16a34a",
              strokeOpacity: 0.9,
              strokeWeight: 4,
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
}

export function CityMap(props: CityMapProps) {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();
  const hasKey = Boolean(key && !key.includes("your_google"));

  if (!hasKey) {
    return <FallbackMap {...props} />;
  }

  return <LiveGoogleMap {...props} />;
}
