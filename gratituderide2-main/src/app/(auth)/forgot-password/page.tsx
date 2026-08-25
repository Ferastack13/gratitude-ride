"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { resetPassword } from "@/lib/actions/auth";
import Link from "next/link";
import { useState, useTransition } from "react";

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await resetPassword(formData);
      if (result.error) {
        setError(result.error);
      } else if (result.message) {
        setMessage(result.message);
      }
    });
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Reset Password
        </h1>
        <p className="text-muted mt-2 text-sm">
          Enter your email and we&apos;ll send a reset link
        </p>
      </div>

      <Card variant="elevated" padding="lg">
        <form action={handleSubmit} className="space-y-4">
          <Input
            name="email"
            label="Email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
          />

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
            Send Reset Link
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted">
          <Link href="/login" className="text-primary font-medium hover:underline">
            ← Back to sign in
          </Link>
        </div>
      </Card>
    </div>
  );
}
