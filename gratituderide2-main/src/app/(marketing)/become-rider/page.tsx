import type { Metadata } from "next";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  Bike,
  Clock,
  DollarSign,
  ShieldCheck,
  Smartphone,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Become a Rider",
  description:
    "Join Gratitude Ride as a delivery rider. Flexible hours, competitive earnings, and weekly payouts.",
};

const benefits = [
  {
    icon: DollarSign,
    title: "Competitive Earnings",
    description: "Earn ₦3,000–₦8,000 daily. Weekly payouts directly to your bank account.",
  },
  {
    icon: Clock,
    title: "Flexible Schedule",
    description: "Work when you want. Toggle availability on and off from the rider app.",
  },
  {
    icon: Smartphone,
    title: "Smart Rider App",
    description: "Accept orders, navigate with GPS, chat with clients, and track earnings.",
  },
  {
    icon: ShieldCheck,
    title: "Insurance Coverage",
    description: "Accident insurance and package protection while you're on delivery.",
  },
  {
    icon: Bike,
    title: "Any Vehicle",
    description: "Motorcycles, bicycles, cars — all vehicle types welcome.",
  },
  {
    icon: Zap,
    title: "Instant Onboarding",
    description: "Most riders are verified and earning within 48 hours of applying.",
  },
];

const requirements = [
  "Valid government-issued ID",
  "Driver's license (for motorized vehicles)",
  "Smartphone with internet access",
  "Bank account for payouts",
  "Must be 18 years or older",
  "Clean background check",
];

export default function BecomeRiderPage() {
  return (
    <div className="pt-20">
      <section className="section-padding bg-gradient-hero">
        <div className="container-app mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            Join Our Fleet
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
            Ride with Gratitude. Earn with Pride.
          </h1>
          <p className="mt-4 text-lg text-white/60 max-w-2xl mx-auto">
            Become a Gratitude Ride delivery partner. Flexible hours, great pay,
            and the support you need to succeed.
          </p>
          <Button
            href="/register?role=rider"
            size="xl"
            variant="secondary"
            className="mt-8"
          >
            Apply Now
          </Button>
        </div>
      </section>

      <section className="section-padding bg-surface">
        <div className="container-app mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Ride With Us</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b) => (
              <Card key={b.title} variant="elevated">
                <div className="p-3 rounded-2xl bg-primary/10 w-fit">
                  <b.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold">{b.title}</h3>
                <p className="mt-2 text-sm text-muted">{b.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-app mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold text-center mb-8">Requirements</h2>
          <Card variant="elevated">
            <ul className="space-y-3">
              {requirements.map((req) => (
                <li key={req} className="flex items-center gap-3 text-muted">
                  <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                  {req}
                </li>
              ))}
            </ul>
          </Card>
          <div className="text-center mt-8">
            <Button href="/register?role=rider" size="lg">
              Start Your Application
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
