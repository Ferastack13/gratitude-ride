"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { pricingTiers } from "@/data/dummy/homepage";
import { formatCurrency } from "@/lib/utils";
import { Check } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export function PricingSection() {
  return (
    <section className="section-padding bg-white" id="pricing">
      <div className="container-app mx-auto">
        <SectionHeader
          badge="Pricing"
          title="Simple, Transparent Pricing"
          description="No hidden fees. Volume discounts available for business accounts."
        />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {pricingTiers.map((tier, i) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.45 }}
              className={`relative flex flex-col rounded-3xl p-8 ${
                tier.is_popular
                  ? "bg-dark text-white shadow-glow ring-1 ring-primary/40 scale-[1.02]"
                  : "bg-surface border border-border"
              }`}
            >
              {tier.is_popular && (
                <Badge
                  variant="secondary"
                  className="absolute -top-3 left-1/2 -translate-x-1/2 z-10"
                >
                  Most Popular
                </Badge>
              )}

              <div>
                <h3
                  className={`font-display text-xl font-bold tracking-tight ${
                    tier.is_popular ? "text-white" : "text-dark"
                  }`}
                >
                  {tier.name}
                </h3>
                <p
                  className={`text-sm mt-1 ${
                    tier.is_popular ? "text-white/55" : "text-muted"
                  }`}
                >
                  {tier.description}
                </p>
                <div className="mt-6">
                  <span
                    className={`font-display text-4xl font-bold ${
                      tier.is_popular ? "text-white" : "text-dark"
                    }`}
                  >
                    {formatCurrency(tier.base_price)}
                  </span>
                  <span
                    className={`text-sm ml-1 ${
                      tier.is_popular ? "text-white/45" : "text-muted"
                    }`}
                  >
                    + {formatCurrency(tier.per_km)}/km
                  </span>
                </div>
              </div>

              <ul className="mt-8 space-y-3 flex-1">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check
                      className={`h-4 w-4 shrink-0 mt-0.5 ${
                        tier.is_popular ? "text-secondary" : "text-primary"
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        tier.is_popular ? "text-white/70" : "text-muted"
                      }`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                href="/register"
                variant={tier.is_popular ? "secondary" : "outline"}
                className="w-full mt-8"
                size="lg"
              >
                Get Started
              </Button>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-sm text-muted mt-10">
          Need a custom plan?{" "}
          <Link href="/contact" className="text-primary hover:underline font-medium">
            Contact our sales team
          </Link>
        </p>
      </div>
    </section>
  );
}
