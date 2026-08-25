import { supabase } from "@/lib/supabase";
import type { EmailOtpType } from "@supabase/supabase-js";
import * as Linking from "expo-linking";

export type AuthUrlResult =
  | { ok: true }
  | { ok: false; error: string };

function readParam(
  params: Linking.QueryParams | null | undefined,
  key: string
): string | undefined {
  const value = params?.[key];
  if (Array.isArray(value)) return value[0];
  return typeof value === "string" ? value : undefined;
}

export async function handleAuthRedirectUrl(url: string): Promise<AuthUrlResult> {
  const parsed = Linking.parse(url);
  const params = parsed.queryParams;

  const errorDescription = readParam(params, "error_description");
  if (errorDescription) {
    return { ok: false, error: errorDescription };
  }

  const code = readParam(params, "code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  const accessToken = readParam(params, "access_token");
  const refreshToken = readParam(params, "refresh_token");
  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  const tokenHash = readParam(params, "token_hash");
  const type = readParam(params, "type");
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as EmailOtpType,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  return {
    ok: false,
    error: "Auth link is invalid or expired. Please sign in or request a new link.",
  };
}
