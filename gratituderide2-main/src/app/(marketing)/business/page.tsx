import type { Metadata } from "next";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  BarChart3,
  Building2,
  Code,
  Headphones,
  Package,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Business",
  description:
    "Enterprise delivery solutions with API integration, volume discounts, and dedicated support.",
};

const businessFeatures = [
  {
    icon: Package,
    title: "Bulk Delivery Dashboard",
    description:
      "Manage hundreds of deliveries from one dashboard. Upload CSV, schedule batches, and track everything.",
  },
  {
    icon: Code,
    title: "API Integration",
    description:
      "Connect Gratitude Ride to your e-commerce platform, ERP, or custom app with our REST API.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reporting",
    description:
      "Real-time delivery metrics, cost analysis, SLA tracking, and exportable reports.",
  },
  {
    icon: Users,
    title: "Dedicated Account Manager",
    description:
      "A single point of contact for onboarding, support, and strategic delivery planning.",
  },
  {
    icon: Headphones,
    title: "24/7 Priority Support",
    description:
      "Direct phone and chat support with guaranteed response times for business accounts.",
  },
  {
    icon: Building2,
    title: "Custom SLAs",
    description:
      "Negotiate delivery windows, insurance limits, and pricing tailored to your volume.",
  },
];

export default function BusinessPage() {
  return (
    <div className="pt-20">
      <section className="section-padding bg-gradient-hero">
        <div className="container-app mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            Business Solutions
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
            Scale Your Deliveries with Confidence
          </h1>
          <p className="mt-4 text-lg text-white/60 max-w-2xl mx-auto">
            Enterprise-grade delivery infrastructure for businesses that can&apos;t
            afford delays. From startups to Fortune 500.
          </p>
          <Button href="/contact" size="xl" variant="secondary" className="mt-8">
            Talk to Sales
          </Button>
        </div>
      </section>

      <section className="section-padding bg-surface">
        <div className="container-app mx-auto">
          <SectionHeader
            title="Everything Your Business Needs"
            description="Powerful tools designed for high-volume senders who demand reliability."
          />
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {businessFeatures.map((feature) => (
              <Card key={feature.title} variant="elevated">
                <div className="p-3 rounded-2xl bg-primary/10 w-fit">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
