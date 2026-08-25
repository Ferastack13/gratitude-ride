import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Package",
  description: "Track your Gratitude Ride delivery in real-time with your tracking ID.",
};

export default function TrackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
