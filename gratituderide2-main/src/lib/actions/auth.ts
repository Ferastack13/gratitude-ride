"use server";

import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { ensureUserProfile } from "@/lib/supabase/profile";
import { getDashboardPath } from "@/lib/routes";
import type { UserRole } from "@/types";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export type AuthResult = {
  success: boolean;
  error?: string;
  message?: string;
};

function missingEnvResult(): AuthResult | null {
  const { error } = getSupabaseEnv();
  if (error) {
    return { success: false, error };
  }
  return null;
}

export async function signUp(formData: FormData): Promise<AuthResult> {
  const envError = missingEnvResult();
  if (envError) return envError;

  const supabase = await createClient();

  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const fullName = String(formData.get("full_name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const role = (String(formData.get("role") || "client") as UserRole) || "client";
  const vehicleType = String(formData.get("vehicle_type") || "Motorcycle").trim();

  if (!email || !password || !fullName) {
    return { success: false, error: "Please fill in all required fields." };
  }

  if (password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters." };
  }

  const safeRole: UserRole = role === "rider" ? "rider" : "client";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone,
        role: safeRole,
        vehicle_type: safeRole === "rider" ? vehicleType : undefined,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (data.user && !data.session) {
    return {
      success: true,
      message:
        "Account created. Check your email to confirm your address, then sign in.",
    };
  }

  if (data.user) {
    await ensureUserProfile(supabase, data.user);
  }

  revalidatePath("/", "layout");
  redirect(getDashboardPath(safeRole));
}

export async function signIn(formData: FormData): Promise<AuthResult> {
  const envError = missingEnvResult();
  if (envError) return envError;

  try {
    const supabase = await createClient();

    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    if (!email || !password) {
      return { success: false, error: "Email and password are required." };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const message =
        error.message === "Invalid login credentials"
          ? "Incorrect email or password. If you just confirmed your email, make sure you're using the same password you registered with — or use Forgot password."
          : error.message;
      return { success: false, error: message };
    }

    const user = data.user ?? (await supabase.auth.getUser()).data.user;
    if (!user) {
      return {
        success: false,
        error: "Signed in, but no user session was returned. Please try again.",
      };
    }

    const profile = await ensureUserProfile(supabase, user);
    const role: UserRole = profile?.role ?? "client";

    revalidatePath("/", "layout");

    const redirectTo = String(formData.get("redirect") || "");
    if (
      redirectTo.startsWith("/") &&
      !redirectTo.startsWith("//") &&
      (redirectTo.startsWith("/client") ||
        redirectTo.startsWith("/rider") ||
        redirectTo.startsWith("/admin") ||
        redirectTo.startsWith("/dashboard"))
    ) {
      redirect(redirectTo);
    }

    redirect(getDashboardPath(role));
  } catch (err) {
    // redirect() throws a special error — rethrow so Next.js can navigate
    if (
      typeof err === "object" &&
      err !== null &&
      "digest" in err &&
      typeof (err as { digest: unknown }).digest === "string" &&
      (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    ) {
      throw err;
    }

    const message =
      err instanceof Error ? err.message : "Sign in failed. Please try again.";
    return { success: false, error: message };
  }
}

export async function signOut(): Promise<void> {
  const envError = missingEnvResult();
  if (envError) {
    redirect("/login");
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function resetPassword(formData: FormData): Promise<AuthResult> {
  const envError = missingEnvResult();
  if (envError) return envError;

  const supabase = await createClient();
  const email = String(formData.get("email") || "").trim();

  if (!email) {
    return { success: false, error: "Email is required." };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback?next=/client/profile`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    message: "If an account exists for that email, a reset link has been sent.",
  };
}
