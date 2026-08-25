"use client";

import { Accordion } from "@/components/ui/Accordion";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { faqs } from "@/data/dummy/homepage";
import Link from "next/link";

export function FAQSection() {
  return (
    <section className="section-padding bg-surface" id="faq">
      <div className="container-app mx-auto">
        <SectionHeader
          badge="FAQ"
          title="Frequently Asked Questions"
          description="Everything you need to know about Gratitude Ride."
        />

        <div className="mt-16 max-w-3xl mx-auto">
          <div className="rounded-3xl bg-white p-2 sm:p-4 shadow-card">
            <Accordion items={faqs} />
          </div>
          <p className="text-center text-sm text-muted mt-8">
            Still have questions?{" "}
            <Link href="/contact" className="text-primary hover:underline font-medium">
              Contact us
            </Link>{" "}
            or visit our{" "}
            <Link href="/faq" className="text-primary hover:underline font-medium">
              full FAQ page
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
