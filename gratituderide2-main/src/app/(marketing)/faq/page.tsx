import type { Metadata } from "next";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Accordion } from "@/components/ui/Accordion";
import { faqs } from "@/data/dummy/homepage";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about Gratitude Ride delivery services.",
};

export default function FAQPage() {
  return (
    <div className="pt-20 min-h-screen bg-surface">
      <section className="section-padding bg-gradient-hero">
        <div className="container-app mx-auto text-center">
          <Badge variant="secondary" className="mb-4">FAQ</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
            Frequently Asked Questions
          </h1>
        </div>
      </section>
      <section className="section-padding">
        <div className="container-app mx-auto max-w-3xl">
          <Card variant="elevated" padding="lg">
            <Accordion items={faqs} />
          </Card>
        </div>
      </section>
    </div>
  );
}
