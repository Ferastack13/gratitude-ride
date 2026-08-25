import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Gratitude Ride privacy policy — how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="pt-20 min-h-screen bg-surface">
      <section className="section-padding">
        <div className="container-app mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted mb-8">Last updated: August 1, 2026</p>
          <Card variant="elevated" padding="lg" className="prose prose-sm max-w-none">
            <div className="space-y-6 text-muted leading-relaxed">
              <section>
                <h2 className="text-lg font-semibold text-dark mb-2">1. Information We Collect</h2>
                <p>We collect information you provide directly, including name, email, phone number, delivery addresses, and payment information. We also collect usage data, device information, and location data when you use our services.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-dark mb-2">2. How We Use Your Information</h2>
                <p>Your information is used to provide delivery services, process payments, communicate about deliveries, improve our platform, and comply with legal obligations.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-dark mb-2">3. Data Sharing</h2>
                <p>We share delivery information with assigned riders, payment data with Paystack for processing, and analytics data with Google Analytics and Meta Pixel (with your consent). We never sell your personal data.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-dark mb-2">4. Data Security</h2>
                <p>We implement industry-standard security measures including encryption, secure servers, and regular security audits to protect your data.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-dark mb-2">5. Your Rights</h2>
                <p>You have the right to access, correct, delete, or export your personal data. Contact us at privacy@gratituderide.com to exercise these rights.</p>
              </section>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
