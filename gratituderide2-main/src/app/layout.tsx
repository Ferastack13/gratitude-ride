import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Syne } from "next/font/google";
import { Analytics } from "@/components/shared/Analytics";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-syne",
  weight: ["500", "600", "700", "800"],
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
};
export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — Premium Express Delivery in Nigeria`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://gratituderide2.vercel.app"
  ),
  keywords: [
    "express delivery",
    "courier service",
    "Lagos delivery",
    "Abuja delivery",
    "Port Harcourt delivery",
    "same day delivery Nigeria",
    "package tracking",
    "Gratitude Ride",
  ],
  authors: [{ name: APP_NAME }],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: APP_NAME,
    title: `${APP_NAME} — Premium Express Delivery in Nigeria`,
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} — Premium Express Delivery`,
    description: APP_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${syne.variable} ${plusJakarta.variable}`}>
      <body className="min-h-screen flex flex-col antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
