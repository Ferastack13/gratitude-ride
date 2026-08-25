"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { signUp } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, useTransition } from "react";

function RegisterForm() {
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") === "rider" ? "rider" : "client";
  const [role, setRole] = useState<"client" | "rider">(defaultRole);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    setError(null);
    setMessage(null);
    formData.set("role", role);
    startTransition(async () => {
      const result = await signUp(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.message) {
        setMessage(result.message);
      }
    });
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Create Account
        </h1>
        <p className="text-muted mt-2 text-sm">
          Join Gratitude Ride as a {role === "rider" ? "rider" : "client"}
        </p>
      </div>

      <Card variant="elevated" padding="lg">
        <div className="flex rounded-xl bg-dark/5 p-1 mb-6">
          {(["client", "rider"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={cn(
                "flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors capitalize",
                role === r
                  ? "bg-white shadow-sm text-dark"
                  : "text-muted hover:text-dark"
              )}
            >
              {r}
            </button>
          ))}
        </div>

        <form action={handleSubmit} className="space-y-4">
          <Input
            name="full_name"
            label="Full Name"
            required
            autoComplete="name"
            placeholder="Adaeze Okonkwo"
          />
          <Input
            name="email"
            label="Email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
          <Input
            name="phone"
            label="Phone"
            type="tel"
            required
            autoComplete="tel"
            placeholder="+234 800 000 0000"
          />
          <Input
            name="password"
            label="Password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Min. 8 characters"
          />
          {role === "rider" && (
            <Input
              name="vehicle_type"
              label="Vehicle Type"
              placeholder="Motorcycle, Bicycle, Car..."
              defaultValue="Motorcycle"
            />
          )}

          <label className="flex items-start gap-2 text-xs text-muted">
            <input
              type="checkbox"
              required
              className="rounded border-border mt-0.5"
            />
            <span>
              I agree to the{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </span>
          </label>

          {error && (
            <div
              role="alert"
              className="rounded-xl bg-danger/10 text-danger text-sm px-4 py-3"
            >
              {error}
            </div>
          )}

          {message && (
            <div
              role="status"
              className="rounded-xl bg-primary/10 text-primary text-sm px-4 py-3"
            >
              {message}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isPending}
          >
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary font-medium hover:underline"
          >
            Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="text-muted text-sm animate-pulse">Loading...</div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
