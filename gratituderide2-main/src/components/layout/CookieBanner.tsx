"use client";

import { Button } from "@/components/ui/Button";
import { Cookie, X } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

const COOKIE_CONSENT_KEY = "gr-cookie-consent";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!consent) {
        const timer = setTimeout(() => setIsVisible(true), 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    } catch {
      // ignore
    }
    setIsVisible(false);
  };

  const decline = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    } catch {
      // ignore
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50 pointer-events-none sm:left-auto sm:right-6 sm:max-w-md"
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="pointer-events-auto rounded-2xl bg-white border border-border p-4 shadow-elevated">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-primary/10 shrink-0">
            <Cookie className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-dark">We use cookies</p>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              For analytics and a better experience. See our{" "}
              <Link href="/cookies" className="text-primary hover:underline">
                Cookie Policy
              </Link>
              .
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Button variant="ghost" size="sm" onClick={decline}>
                Decline
              </Button>
              <Button size="sm" onClick={accept}>
                Accept
              </Button>
            </div>
          </div>
          <button
            type="button"
            onClick={decline}
            className="p-1 text-muted hover:text-dark"
            aria-label="Close cookie banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
