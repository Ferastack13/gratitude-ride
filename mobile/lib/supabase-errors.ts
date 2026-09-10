/** Map raw Supabase / network errors into actionable signup/login copy. */
export function friendlyAuthError(message: string | null | undefined): string {
  const raw = (message ?? "").trim();
  if (!raw) return "Something went wrong. Please try again.";

  const lower = raw.toLowerCase();

  if (
    lower.includes("unknownhostexception") ||
    lower.includes("unable to resolve host") ||
    lower.includes("could not resolve host") ||
    lower.includes("err_name_not_resolved") ||
    lower.includes("getaddrinfo") ||
    lower.includes("enotfound") ||
    (lower.includes("fetch failed") && lower.includes("host"))
  ) {
    return "Cannot reach the Gratitude Ride servers. Your Supabase project may be paused or offline — open the Supabase dashboard, restore the project, then restart Expo with npx expo start --lan --clear.";
  }

  if (
    lower.includes("network request failed") ||
    lower.includes("failed to fetch") ||
    lower === "fetch failed"
  ) {
    return "Network error. Check your phone’s internet connection and that you’re on the same Wi‑Fi as your computer, then try again.";
  }

  if (lower.includes("email not confirmed")) {
    return "Confirm your email from the link we sent, then sign in.";
  }

  if (lower.includes("invalid login credentials")) {
    return "Incorrect email or password.";
  }

  if (lower.includes("user already registered")) {
    return "An account with this email already exists. Sign in instead.";
  }

  // Strip Java exception prefixes for cleaner UI
  const cleaned = raw
    .replace(/^fetch failed:\s*/i, "")
    .replace(/^java\.net\.[^:]+:\s*/i, "");
  return cleaned || raw;
}
