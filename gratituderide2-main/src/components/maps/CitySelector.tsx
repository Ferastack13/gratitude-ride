"use client";

import { SERVICE_CITIES, type ServiceCity } from "@/lib/cities";
import { cn } from "@/lib/utils";
import { MapPinned } from "lucide-react";

export function CitySelector({
  value,
  onChange,
  className,
}: {
  value: ServiceCity;
  onChange: (city: ServiceCity) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {SERVICE_CITIES.map((city) => {
        const active = city.id === value;
        return (
          <button
            key={city.id}
            type="button"
            onClick={() => onChange(city.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors border",
              active
                ? "bg-primary text-white border-primary"
                : "bg-white text-muted border-border hover:text-dark hover:border-primary/40"
            )}
          >
            <MapPinned className="h-3.5 w-3.5" />
            {city.label}
          </button>
        );
      })}
    </div>
  );
}
