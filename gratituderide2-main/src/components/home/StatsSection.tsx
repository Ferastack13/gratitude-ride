"use client";

import { stats } from "@/data/dummy/homepage";
import { motion } from "framer-motion";

export function StatsSection() {
  return (
    <section className="bg-dark border-y border-white/5" aria-label="Platform statistics">
      <div className="container-app mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/5">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.45 }}
              className="py-10 sm:py-12 px-4 sm:px-6 text-center"
            >
              <p className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
                {stat.value}
              </p>
              <p className="mt-2 text-xs sm:text-sm text-white/45 tracking-wide">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
