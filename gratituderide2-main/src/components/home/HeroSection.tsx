"use client";

import { Button } from "@/components/ui/Button";
import { ArrowRight, Search } from "lucide-react";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="relative min-h-[100svh] flex items-end overflow-hidden">
      {/* Image wrapper must be pointer-events-none — Next/Image fill span blocks clicks */}
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden>
        <Image
          src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1920&q=80"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/75 to-dark/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark/80 via-dark/40 to-transparent" />
      </div>

      <div className="container-app relative z-20 mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 lg:pb-28 pt-32">
        <div className="max-w-3xl">
          <p className="font-display text-primary text-sm sm:text-base font-semibold tracking-[0.2em] uppercase mb-4">
            Gratitude Ride
          </p>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-[1.05] tracking-tight">
            Deliver at{" "}
            <span className="text-gradient-gold">Lightning</span> Speed
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-white/70 leading-relaxed max-w-xl">
            Premium express delivery across Lagos, Abuja, and Port Harcourt —
            book, track, and receive in under 60 minutes.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Button href="/register" size="xl" className="w-full sm:w-auto">
              Book a Delivery
              <ArrowRight className="h-5 w-5" aria-hidden />
            </Button>
            <Button
              href="/track"
              variant="outline"
              size="xl"
              className="w-full sm:w-auto border-white/25 text-white hover:bg-white hover:text-dark hover:border-white"
            >
              <Search className="h-5 w-5" aria-hidden />
              Track Package
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
