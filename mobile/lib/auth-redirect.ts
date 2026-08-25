import * as Linking from "expo-linking";

/** Deep link used for email confirm + password reset on mobile. */
export function getAuthRedirectUri() {
  return Linking.createURL("auth/callback");
}

export const AUTH_CALLBACK_PATH = "auth/callback";

/** Add these in Supabase Dashboard → Authentication → URL Configuration → Redirect URLs */
export const SUPABASE_REDIRECT_URLS = [
  "gratituderide://auth/callback",
  "gratituderide://**",
  "exp://**/--/auth/callback",
] as const;
