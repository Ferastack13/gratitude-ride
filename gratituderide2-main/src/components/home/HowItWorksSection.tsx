"use client";

import { SectionHeader } from "@/components/shared/SectionHeader";
import { howItWorks } from "@/data/dummy/homepage";
import { getIcon } from "@/lib/icons";
import { motion } from "framer-motion";

export function HowItWorksSection() {
  return (
    <section className="section-padding bg-white" id="how-it-works">
      <div className="container-app mx-auto">
        <SectionHeader
          badge="How It Works"
          title="Four Steps to Your Doorstep"
          description="Booking a delivery takes less than two minutes."
        />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6">
          {howItWorks.map((step, i) => {
            const Icon = getIcon(step.icon);
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.45 }}
                className="relative text-center lg:text-left"
              >
                {i < howItWorks.length - 1 && (
                  <div
                    className="hidden lg:block absolute top-8 left-[calc(3rem+12px)] right-0 h-px bg-gradient-to-r from-primary/50 to-primary/5"
                    aria-hidden="true"
                  />
                )}

                <div className="relative inline-flex lg:flex">
                  <div className="h-16 w-16 rounded-2xl bg-dark flex items-center justify-center">
                    <Icon className="h-7 w-7 text-secondary" />
                  </div>
                  <span className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shadow-lg shadow-primary/30">
                    {step.step}
                  </span>
                </div>

                <h3 className="mt-6 font-display text-lg font-semibold text-dark tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
