import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Learn about how Gratitude Ride uses cookies and similar technologies.",
};

export default function CookiesPage() {
  return (
    <div className="pt-20 min-h-screen bg-surface">
      <section className="section-padding">
        <div className="container-app mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold mb-2">Cookie Policy</h1>
          <p className="text-muted mb-8">Last updated: August 1, 2026</p>
          <Card variant="elevated" padding="lg">
            <div className="space-y-6 text-muted leading-relaxed">
              <section>
                <h2 className="text-lg font-semibold text-dark mb-2">What Are Cookies</h2>
                <p>Cookies are small text files stored on your device when you visit our website. They help us provide a better experience and understand how our site is used.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-dark mb-2">Cookies We Use</h2>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong className="text-dark">Essential:</strong> Required for authentication, security, and core functionality.</li>
                  <li><strong className="text-dark">Analytics:</strong> Google Analytics helps us understand site usage and improve performance.</li>
                  <li><strong className="text-dark">Marketing:</strong> Meta Pixel tracks conversions for advertising optimization (requires consent).</li>
                  <li><strong className="text-dark">Preferences:</strong> Remember your settings like cookie consent and theme preferences.</li>
                </ul>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-dark mb-2">Managing Cookies</h2>
                <p>You can manage cookie preferences through our cookie banner or your browser settings. Declining non-essential cookies will not affect core functionality.</p>
              </section>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
