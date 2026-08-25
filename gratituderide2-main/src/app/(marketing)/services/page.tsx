import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { services } from "@/data/dummy/homepage";
import { getIcon } from "@/lib/icons";
import { formatCurrency } from "@/lib/utils";
import { Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Express, same-day, scheduled, and bulk delivery services across Lagos, Abuja, and Port Harcourt.",
};

export default function ServicesPage() {
  return (
    <div className="pt-20">
      <section className="section-padding bg-gradient-hero">
        <div className="container-app mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            Our Services
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
            Delivery Solutions for Every Need
          </h1>
          <p className="mt-4 text-lg text-white/60 max-w-2xl mx-auto">
            From urgent express deliveries to scheduled bulk shipments, we have
            the right service for you.
          </p>
        </div>
      </section>

      <section className="section-padding bg-surface">
        <div className="container-app mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service) => {
              const Icon = getIcon(service.icon);
              return (
                <Card
                  key={service.id}
                  id={service.id}
                  variant="elevated"
                  className="scroll-mt-24"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-primary/10 shrink-0">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-dark">
                        {service.title}
                      </h2>
                      <p className="text-muted mt-1">{service.description}</p>
                      <p className="text-primary font-semibold mt-3">
                        From {formatCurrency(service.starting_price)}
                      </p>
                      <ul className="mt-4 space-y-2">
                        {service.features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-sm text-muted">
                            <Check className="h-4 w-4 text-primary shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <Button href="/register" className="mt-6">
                        Book Now
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
