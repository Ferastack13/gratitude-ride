import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Gratitude Ride terms of service — rules and guidelines for using our platform.",
};

export default function TermsPage() {
  return (
    <div className="pt-20 min-h-screen bg-surface">
      <section className="section-padding">
        <div className="container-app mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
          <p className="text-muted mb-8">Last updated: August 1, 2026</p>
          <Card variant="elevated" padding="lg">
            <div className="space-y-6 text-muted leading-relaxed">
              <section>
                <h2 className="text-lg font-semibold text-dark mb-2">1. Acceptance of Terms</h2>
                <p>By accessing or using Gratitude Ride, you agree to be bound by these Terms of Service and our Privacy Policy.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-dark mb-2">2. Services</h2>
                <p>Gratitude Ride provides express delivery services connecting clients with independent delivery riders. We facilitate the connection but riders are independent contractors.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-dark mb-2">3. User Responsibilities</h2>
                <p>Users must provide accurate information, comply with prohibited items policies, and treat riders and staff with respect. Fraudulent activity will result in account termination.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-dark mb-2">4. Payments & Refunds</h2>
                <p>All fees are displayed before booking. Refunds are processed for undelivered packages within 5-7 business days. Disputes must be reported within 24 hours of delivery.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-dark mb-2">5. Limitation of Liability</h2>
                <p>Gratitude Ride&apos;s liability is limited to the insurance coverage applicable to your delivery tier. We are not liable for delays caused by force majeure events.</p>
              </section>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
