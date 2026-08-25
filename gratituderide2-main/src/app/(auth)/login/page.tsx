"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { signIn } from "@/lib/actions/auth";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, useTransition } from "react";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "";
  const urlError = searchParams.get("error");
  const [error, setError] = useState<string | null>(
    urlError === "auth_callback_failed"
      ? "Authentication failed. Please try again."
      : urlError
        ? decodeURIComponent(urlError)
        : null
  );
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await signIn(formData);
        if (result?.error) {
          setError(result.error);
        }
      } catch (err) {
        // Next.js redirect() throws; let navigation proceed
        if (
          typeof err === "object" &&
          err !== null &&
          "digest" in err &&
          typeof (err as { digest: unknown }).digest === "string" &&
          (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
        ) {
          throw err;
        }
        setError(
          err instanceof Error
            ? err.message
            : "Sign in failed. Please try again."
        );
      }
    });
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Welcome Back
        </h1>
        <p className="text-muted mt-2 text-sm">
          Sign in to your Gratitude Ride account
        </p>
      </div>

      <Card variant="elevated" padding="lg">
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="redirect" value={redirect} />
          <Input
            name="email"
            label="Email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
          <Input
            name="password"
            label="Password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
          />
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-muted">
              <input
                type="checkbox"
                name="remember"
                className="rounded border-border"
              />
              Remember me
            </label>
            <Link
              href="/forgot-password"
              className="text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl bg-danger/10 text-danger text-sm px-4 py-3"
            >
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isPending}
          >
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-primary font-medium hover:underline"
          >
            Register
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="text-muted text-sm animate-pulse">Loading...</div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
