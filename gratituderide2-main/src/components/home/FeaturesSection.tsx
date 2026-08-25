"use client";

import { SectionHeader } from "@/components/shared/SectionHeader";
import { features } from "@/data/dummy/homepage";
import { getIcon } from "@/lib/icons";
import { motion } from "framer-motion";

export function FeaturesSection() {
  return (
    <section className="section-padding bg-surface" id="features">
      <div className="container-app mx-auto">
        <SectionHeader
          badge="Why Gratitude Ride"
          title="Built for Speed, Designed for Trust"
          description="Every feature is crafted for a premium experience — from booking to doorstep."
        />

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {features.map((feature, i) => {
            const Icon = getIcon(feature.icon);
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.45 }}
                className="group"
              >
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:shadow-glow transition-all duration-300">
                  <Icon className="h-6 w-6 text-primary group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold text-dark tracking-tight">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-muted leading-relaxed max-w-sm">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
