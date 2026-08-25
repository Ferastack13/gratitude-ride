"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { CITIES } from "@/lib/constants";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="pt-20 min-h-screen bg-surface">
      <section className="section-padding bg-gradient-hero">
        <div className="container-app mx-auto text-center">
          <Badge variant="secondary" className="mb-4">Contact</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
            Get in Touch
          </h1>
          <p className="mt-4 text-lg text-white/60 max-w-2xl mx-auto">
            Have a question, partnership inquiry, or need support? We&apos;re here to help.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-app mx-auto grid lg:grid-cols-3 gap-8">
          <div className="space-y-4">
            {[
              { icon: Mail, label: "Email", value: "hello@gratituderide.com", href: "mailto:hello@gratituderide.com" },
              { icon: Phone, label: "Phone", value: "+234 800 000 0000", href: "tel:+2348000000000" },
              { icon: MapPin, label: "Cities", value: CITIES.join(", ") + ", Nigeria", href: undefined },
            ].map((item) => (
              <Card key={item.label} variant="elevated">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="text-sm font-medium hover:text-primary transition-colors">{item.value}</a>
                    ) : (
                      <p className="text-sm font-medium">{item.value}</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-2">
            <Card variant="elevated" padding="lg">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Send className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold">Message Sent!</h3>
                  <p className="text-muted mt-2">We&apos;ll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input label="Full Name" required placeholder="John Doe" />
                    <Input label="Email" type="email" required placeholder="john@example.com" />
                  </div>
                  <Input label="Subject" required placeholder="How can we help?" />
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1.5">Message</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Tell us more..."
                      className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    />
                  </div>
                  <Button type="submit" size="lg">
                    Send Message
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
