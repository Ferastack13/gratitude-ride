"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowRight, Mail } from "lucide-react";
import { motion } from "framer-motion";

export function CTASection() {
  return (
    <section className="section-padding bg-white">
      <div className="container-app mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-[2rem] bg-gradient-brand p-8 sm:p-12 lg:p-16"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-56 h-56 bg-secondary/25 rounded-full blur-3xl" />
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                backgroundSize: "28px 28px",
              }}
            />
          </div>

          <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
                Ready for Lightning-Fast Delivery?
              </h2>
              <p className="mt-4 text-white/80 text-lg leading-relaxed max-w-md">
                Join thousands of Nigerians who trust Gratitude Ride. Sign up in
                minutes and send your first package today.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button
                  href="/register"
                  size="xl"
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  Get Started Free
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <Button
                  href="/become-rider"
                  size="xl"
                  variant="outline"
                  className="w-full sm:w-auto border-white/35 text-white hover:bg-white hover:text-primary"
                >
                  Become a Rider
                </Button>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-dark text-sm">
                    Stay in the loop
                  </p>
                  <p className="text-muted text-xs">
                    Delivery tips & exclusive offers
                  </p>
                </div>
              </div>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex flex-col sm:flex-row gap-2"
              >
                <Input
                  type="email"
                  placeholder="Enter your email"
                  aria-label="Email for newsletter"
                  className="flex-1"
                />
                <Button type="submit" className="shrink-0">
                  Subscribe
                </Button>
              </form>
              <p className="text-xs text-muted mt-3">
                No spam. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
