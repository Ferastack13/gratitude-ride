"use client";

import { SectionHeader } from "@/components/shared/SectionHeader";
import { coverageCities } from "@/data/dummy/homepage";
import { Clock, MapPin, Users } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

export function CoverageCitiesSection() {
  return (
    <section className="section-padding bg-dark" id="coverage">
      <div className="container-app mx-auto">
        <SectionHeader
          badge="Coverage"
          title="Delivering Across Nigeria's Top Cities"
          description="Premium express delivery where it matters most. More cities coming soon."
          dark
        />

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {coverageCities.map((city, i) => (
            <motion.div
              key={city.city}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className="group relative overflow-hidden rounded-3xl"
            >
              <div className="relative h-[28rem]">
                <div className="absolute inset-0 pointer-events-none" aria-hidden>
                  <Image
                    src={city.image}
                    alt=""
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/50 to-dark/10" />
                </div>

                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 z-10">
                  <h3 className="font-display text-3xl font-bold text-white tracking-tight">
                    {city.city}
                  </h3>
                  <p className="mt-2 text-white/65 text-sm leading-relaxed">
                    {city.description}
                  </p>

                  <div className="mt-6 flex items-center gap-6 text-white/80">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-medium">
                        {city.areas} areas
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-medium">
                        {city.riders}+ riders
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-secondary" />
                      <span className="text-xs font-medium">
                        {city.avgDelivery}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
