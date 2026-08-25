import { Logo } from "@/components/layout/Logo";
import { FOOTER_LINKS, SOCIAL_LINKS, CITIES } from "@/lib/constants";
import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from "lucide-react";
import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-white">
      <div className="container-app mx-auto section-padding pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          <div className="lg:col-span-2">
            <Logo variant="light" size="lg" />
            <p className="mt-4 text-white/60 text-sm leading-relaxed max-w-sm">
              Nigeria&apos;s premium express delivery platform. Fast, reliable,
              and secure deliveries across Lagos, Abuja, and Port Harcourt.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[
                { icon: Twitter, href: SOCIAL_LINKS.twitter, label: "Twitter" },
                {
                  icon: Instagram,
                  href: SOCIAL_LINKS.instagram,
                  label: "Instagram",
                },
                {
                  icon: Facebook,
                  href: SOCIAL_LINKS.facebook,
                  label: "Facebook",
                },
                {
                  icon: Linkedin,
                  href: SOCIAL_LINKS.linkedin,
                  label: "LinkedIn",
                },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="p-2 rounded-lg bg-white/5 hover:bg-primary/20 text-white/60 hover:text-primary transition-colors"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-white/40 mb-4">
              Company
            </h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-white/40 mb-4">
              Services
            </h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.services.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-white/40 mb-4">
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-white/60">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                <span>
                  {CITIES.join(", ")}
                  <br />
                  Nigeria
                </span>
              </li>
              <li>
                <a
                  href="mailto:hello@gratituderide.com"
                  className="flex items-center gap-2 text-sm text-white/60 hover:text-primary transition-colors"
                >
                  <Mail className="h-4 w-4 shrink-0 text-primary" />
                  hello@gratituderide.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+2348000000000"
                  className="flex items-center gap-2 text-sm text-white/60 hover:text-primary transition-colors"
                >
                  <Phone className="h-4 w-4 shrink-0 text-primary" />
                  +234 800 000 0000
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/40">
            &copy; {currentYear} Gratitude Ride. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-sm text-white/40 hover:text-primary transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-white/40 hover:text-primary transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/cookies"
              className="text-sm text-white/40 hover:text-primary transition-colors"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
