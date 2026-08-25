"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { CityMap } from "@/components/maps/CityMap";
import { Search, Package, MapPin, Clock, User } from "lucide-react";
import { useState } from "react";

const dummyTracking = {
  tracking_id: "GR7X2K9M",
  status: "in_transit" as const,
  pickup: "12 Admiralty Way, Lekki Phase 1, Lagos",
  delivery: "45 Allen Avenue, Ikeja, Lagos",
  package_description: "Electronics — Laptop box",
  rider: { name: "Adaeze O.", phone: "+234 801 234 5678", rating: 4.9, vehicle: "Honda CB125" },
  timeline: [
    { status: "Order Placed", time: "1:45 PM", done: true },
    { status: "Rider Assigned", time: "1:52 PM", done: true },
    { status: "Picked Up", time: "2:15 PM", done: true },
    { status: "In Transit", time: "2:28 PM", done: true, active: true },
    { status: "Delivered", time: "Est. 3:00 PM", done: false },
  ],
  estimated_delivery: "3:00 PM",
};

export default function TrackPage() {
  const [trackingId, setTrackingId] = useState("");
  const [result, setResult] = useState<typeof dummyTracking | null>(null);
  const [searched, setSearched] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    if (trackingId.toUpperCase() === "GR7X2K9M" || trackingId.length > 0) {
      setResult(dummyTracking);
    } else {
      setResult(null);
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-surface">
      <section className="section-padding bg-gradient-hero">
        <div className="container-app mx-auto text-center max-w-2xl">
          <Badge variant="secondary" className="mb-4">
            Track Package
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
            Where&apos;s Your Package?
          </h1>
          <p className="mt-4 text-lg text-white/60">
            Enter your tracking ID to see real-time delivery status.
          </p>
          <form onSubmit={handleTrack} className="mt-8 flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Enter tracking ID (e.g. GR7X2K9M)"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              icon={<Search className="h-4 w-4" />}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 flex-1"
            />
            <Button type="submit" size="lg" variant="secondary" className="shrink-0">
              Track
            </Button>
          </form>
          <p className="mt-3 text-xs text-white/40">
            Try demo ID: <button type="button" onClick={() => setTrackingId("GR7X2K9M")} className="text-secondary hover:underline">GR7X2K9M</button>
          </p>
        </div>
      </section>

      {searched && (
        <section className="section-padding">
          <div className="container-app mx-auto max-w-3xl">
            {result ? (
              <div className="space-y-6">
                <Card variant="elevated">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted">Tracking ID</p>
                      <p className="text-xl font-mono font-bold">{result.tracking_id}</p>
                    </div>
                    <Badge variant="primary" className="w-fit">
                      In Transit
                    </Badge>
                  </div>
                </Card>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Card>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted">Pickup</p>
                        <p className="text-sm font-medium">{result.pickup}</p>
                      </div>
                    </div>
                  </Card>
                  <Card>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted">Delivery</p>
                        <p className="text-sm font-medium">{result.delivery}</p>
                      </div>
                    </div>
                  </Card>
                </div>

                <Card variant="elevated" padding="none" className="overflow-hidden p-0">
                  <div className="px-5 py-4 border-b border-border">
                    <h3 className="font-semibold">Live map · Lagos</h3>
                  </div>
                  <div className="p-4">
                    <CityMap
                      center={{ lat: 6.47, lng: 3.45 }}
                      zoom={12}
                      markers={[
                        {
                          id: "pickup",
                          lat: 6.4474,
                          lng: 3.4721,
                          label: "Pickup",
                          color: "primary",
                        },
                        {
                          id: "dropoff",
                          lat: 6.6018,
                          lng: 3.3515,
                          label: "Drop-off",
                          color: "secondary",
                        },
                      ]}
                      route={[
                        { lat: 6.4474, lng: 3.4721 },
                        { lat: 6.6018, lng: 3.3515 },
                      ]}
                      height="300px"
                    />
                  </div>
                </Card>

                <Card variant="elevated">
                  <h3 className="font-semibold mb-4">Delivery Timeline</h3>
                  <div className="space-y-4">
                    {result.timeline.map((step) => (
                      <div key={step.status} className="flex items-center gap-4">
                        <div className={`h-3 w-3 rounded-full shrink-0 ${step.active ? "bg-primary animate-pulse" : step.done ? "bg-primary" : "bg-dark/10"}`} />
                        <p className={`flex-1 text-sm ${step.done || step.active ? "font-medium text-dark" : "text-muted"}`}>{step.status}</p>
                        <p className="text-xs text-muted">{step.time}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{result.rider.name}</p>
                      <p className="text-sm text-muted">{result.rider.vehicle} • ⭐ {result.rider.rating}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <Clock className="h-4 w-4" />
                      ETA {result.estimated_delivery}
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              <Card variant="elevated" className="text-center py-12">
                <Package className="h-12 w-12 text-muted mx-auto mb-4" />
                <h3 className="font-semibold text-lg">Package Not Found</h3>
                <p className="text-muted mt-2 text-sm">No delivery found with that tracking ID. Please check and try again.</p>
              </Card>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
