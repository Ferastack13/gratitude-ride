import type { Metadata } from "next";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { stats } from "@/data/dummy/homepage";
import { Target, Eye, Heart, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Gratitude Ride — Nigeria's premium express delivery platform built for speed and trust.",
};

const values = [
  { icon: Zap, title: "Speed", description: "Every second counts. We optimize routes, riders, and processes for maximum velocity." },
  { icon: Heart, title: "Gratitude", description: "We deliver with care. Every package matters, every customer deserves excellence." },
  { icon: Eye, title: "Transparency", description: "Real-time tracking, honest pricing, and open communication at every step." },
  { icon: Target, title: "Reliability", description: "When we say 60 minutes, we mean it. Our SLAs aren't suggestions — they're promises." },
];

export default function AboutPage() {
  return (
    <div className="pt-20">
      <section className="section-padding bg-gradient-hero">
        <div className="container-app mx-auto text-center max-w-3xl">
          <Badge variant="secondary" className="mb-4">About Us</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
            Redefining Delivery in Nigeria
          </h1>
          <p className="mt-6 text-lg text-white/60 leading-relaxed">
            Gratitude Ride was born from a simple frustration: deliveries in Nigeria
            were slow, unreliable, and opaque. We built the platform we wished existed —
            premium express delivery with the speed of lightning and the trust of a handshake.
          </p>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-app mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s) => (
              <Card key={s.label} variant="elevated" className="text-center">
                <p className="text-3xl font-bold text-primary">{s.value}</p>
                <p className="text-sm text-muted mt-1">{s.label}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-surface">
        <div className="container-app mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <Card key={v.title} variant="elevated" className="text-center">
                <div className="p-3 rounded-2xl bg-primary/10 w-fit mx-auto">
                  <v.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm text-muted">{v.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
