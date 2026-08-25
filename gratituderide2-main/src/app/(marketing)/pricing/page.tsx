import type { Metadata } from "next";
import { PricingSection } from "@/components/home/PricingSection";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Transparent delivery pricing for standard, express, and business plans. No hidden fees.",
};

export default function PricingPage() {
  return (
    <div className="pt-20">
      <section className="section-padding bg-gradient-hero pb-0">
        <div className="container-app mx-auto text-center pb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
            Pricing Plans
          </h1>
          <p className="mt-4 text-lg text-white/60 max-w-2xl mx-auto">
            Choose the plan that fits your delivery needs. Upgrade or downgrade anytime.
          </p>
        </div>
      </section>
      <PricingSection />
    </div>
  );
}
