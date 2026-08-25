export const APP_NAME = "Gratitude Ride";
export const APP_TAGLINE = "Premium Express Delivery";
export const APP_DESCRIPTION =
  "Nigeria's premium express delivery platform. Fast, reliable, and secure deliveries across Lagos, Abuja, and Port Harcourt.";

export const CITIES = ["Lagos", "Abuja", "Port Harcourt"] as const;
export type { ServiceCity } from "@/lib/cities";
export { SERVICE_CITIES, getCityConfig } from "@/lib/cities";

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/business", label: "Business" },
  { href: "/become-rider", label: "Become Rider" },
  { href: "/pricing", label: "Pricing" },
  { href: "/track", label: "Track Package" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export const FOOTER_LINKS = {
  company: [
    { href: "/about", label: "About Us" },
    { href: "/services", label: "Services" },
    { href: "/pricing", label: "Pricing" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
  ],
  services: [
    { href: "/services#express", label: "Express Delivery" },
    { href: "/services#same-day", label: "Same-Day Delivery" },
    { href: "/services#scheduled", label: "Scheduled Delivery" },
    { href: "/business", label: "Business Solutions" },
    { href: "/become-rider", label: "Become a Rider" },
  ],
  support: [
    { href: "/track", label: "Track Package" },
    { href: "/contact", label: "Help Center" },
    { href: "/faq", label: "FAQ" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
  ],
} as const;

export const SOCIAL_LINKS = {
  twitter: "https://twitter.com/gratituderide",
  instagram: "https://instagram.com/gratituderide",
  facebook: "https://facebook.com/gratituderide",
  linkedin: "https://linkedin.com/company/gratituderide",
} as const;

export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "2348000000000";
