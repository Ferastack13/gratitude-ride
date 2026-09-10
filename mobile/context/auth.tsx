import {
  getAccountType,
  homeForAccount,
  setAccountType as persistAccountType,
  type AccountType,
  type AppHome,
} from "@/lib/account-type";
import { supabase } from "@/lib/supabase";
import type { Tables } from "@/types/database";
import type { Session } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type Profile = Tables<"users">;
export type UserRole = Profile["role"];

type AuthContextValue = {
  session: Session | null;
  profile: Profile | null;
  accountType: AccountType | null;
  loading: boolean;
  /** True once session bootstrap finished (profile may still be null if offline). */
  ready: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setAccountTypePreference: (type: AccountType) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadProfile(userId: string): Promise<Profile | null> {
  try {
    const { data } = await supabase
      .from("users")
      .select(
        "id, email, full_name, phone, role, avatar_url, created_at, updated_at"
      )
      .eq("id", userId)
      .maybeSingle();
    return data;
  } catch {
    return null;
  }
}

function accountTypeFromMeta(
  meta: Record<string, unknown> | undefined
): AccountType | null {
  const v = meta?.account_type;
  if (v === "driver" || v === "passenger" || v === "business") return v;
  if (meta?.role === "rider") return "driver";
  if (meta?.role === "client") return "passenger";
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [accountType, setAccountTypeState] = useState<AccountType | null>(null);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const bootstrapped = useRef(false);

  const hydrateAccountType = useCallback(async (sess: Session | null) => {
    if (!sess?.user) {
      setAccountTypeState(null);
      return null;
    }

    const fromMeta = accountTypeFromMeta(sess.user.user_metadata);
    if (fromMeta) {
      setAccountTypeState(fromMeta);
      await persistAccountType(fromMeta).catch(() => undefined);
      return fromMeta;
    }

    const stored = await getAccountType();
    if (stored) {
      setAccountTypeState(stored);
      return stored;
    }

    // Prefer DB role when reachable; otherwise default so routing never stalls.
    const p = await loadProfile(sess.user.id);
    const inferred: AccountType = p?.role === "rider" ? "driver" : "passenger";
    setAccountTypeState(inferred);
    await persistAccountType(inferred).catch(() => undefined);
    return inferred;
  }, []);

  const applySession = useCallback(
    async (next: Session | null) => {
      setSession(next);
      if (!next?.user) {
        setProfile(null);
        setAccountTypeState(null);
        return;
      }
      const [p] = await Promise.all([
        loadProfile(next.user.id),
        hydrateAccountType(next),
      ]);
      setProfile(p);
    },
    [hydrateAccountType]
  );

  const refreshProfile = useCallback(async () => {
    const {
      data: { session: next },
    } = await supabase.auth.getSession();
    await applySession(next);
  }, [applySession]);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      await applySession(data.session);
      if (!mounted) return;
      bootstrapped.current = true;
      setLoading(false);
      setReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, next) => {
      // Skip duplicate INITIAL_SESSION after getSession bootstrap.
      if (event === "INITIAL_SESSION" && bootstrapped.current) return;
      if (!mounted) return;
      await applySession(next);
      if (!mounted) return;
      setLoading(false);
      setReady(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [applySession]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setAccountTypeState(null);
  }, []);

  const setAccountTypePreference = useCallback(async (type: AccountType) => {
    await persistAccountType(type);
    setAccountTypeState(type);
  }, []);

  const value = useMemo(
    () => ({
      session,
      profile,
      accountType,
      loading,
      ready,
      signOut,
      refreshProfile,
      setAccountTypePreference,
    }),
    [
      session,
      profile,
      accountType,
      loading,
      ready,
      signOut,
      refreshProfile,
      setAccountTypePreference,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}

/** Safe home href for redirects — never returns /login while session exists. */
export function homeForRole(
  role?: UserRole | null,
  accountType?: AccountType | null
): AppHome {
  return homeForAccount(role, accountType) ?? "/passenger";
}
