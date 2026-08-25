"use client";

import { SectionHeader } from "@/components/shared/SectionHeader";
import { testimonials } from "@/data/dummy/homepage";
import { Star } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

export function TestimonialsSection() {
  return (
    <section className="section-padding bg-surface" id="testimonials">
      <div className="container-app mx-auto">
        <SectionHeader
          badge="Testimonials"
          title="Loved Across Nigeria"
          description="Businesses and individuals who trust Gratitude Ride every day."
        />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {testimonials.map((testimonial, i) => (
            <motion.blockquote
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.45 }}
              className="relative rounded-3xl bg-white p-8 sm:p-10 shadow-card"
            >
              <div className="flex items-center gap-1 mb-5">
                {Array.from({ length: testimonial.rating }).map((_, j) => (
                  <Star
                    key={j}
                    className="h-4 w-4 fill-secondary text-secondary"
                  />
                ))}
              </div>

              <p className="text-dark text-base sm:text-lg leading-relaxed">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              <footer className="mt-8 flex items-center gap-3 pt-6 border-t border-border">
                <Image
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div>
                  <cite className="not-italic font-semibold text-dark text-sm">
                    {testimonial.name}
                  </cite>
                  <p className="text-muted text-xs mt-0.5">
                    {testimonial.role}
                    {testimonial.company && ` · ${testimonial.company}`}
                  </p>
                  <p className="text-primary text-xs mt-0.5 font-medium">
                    {testimonial.city}
                  </p>
                </div>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
