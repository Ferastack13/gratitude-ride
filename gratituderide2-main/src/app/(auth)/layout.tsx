import { Logo } from "@/components/layout/Logo";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="px-4 sm:px-6 lg:px-8 py-5">
        <div className="container-app mx-auto flex items-center justify-between">
          <Logo />
          <Link
            href="/"
            className="text-sm text-muted hover:text-primary transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        {children}
      </main>
      <footer className="py-6 text-center text-xs text-muted">
        &copy; {new Date().getFullYear()} Gratitude Ride. All rights reserved.
      </footer>
    </div>
  );
}
