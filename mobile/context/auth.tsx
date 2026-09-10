import {
  getAccountType,
  homeForAccount,
  setAccountType as persistAccountType,
  type AccountType,
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
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setAccountTypePreference: (type: AccountType) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from("users")
    .select("id, email, full_name, phone, role, avatar_url, created_at, updated_at")
    .eq("id", userId)
    .maybeSingle();
  return data;
}

function accountTypeFromMeta(meta: Record<string, unknown> | undefined): AccountType | null {
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

  const hydrateAccountType = useCallback(async (sess: Session | null) => {
    const fromMeta = accountTypeFromMeta(sess?.user?.user_metadata);
    if (fromMeta) {
      setAccountTypeState(fromMeta);
      return fromMeta;
    }
    const stored = await getAccountType();
    if (stored) {
      setAccountTypeState(stored);
      return stored;
    }
    if (sess?.user) {
      // Infer from DB role for legacy users
      const p = await loadProfile(sess.user.id);
      const inferred: AccountType = p?.role === "rider" ? "driver" : "passenger";
      setAccountTypeState(inferred);
      return inferred;
    }
    setAccountTypeState(null);
    return null;
  }, []);

  const refreshProfile = useCallback(async () => {
    const {
      data: { session: next },
    } = await supabase.auth.getSession();
    setSession(next);
    if (!next?.user) {
      setProfile(null);
      setAccountTypeState(null);
      return;
    }
    setProfile(await loadProfile(next.user.id));
    await hydrateAccountType(next);
  }, [hydrateAccountType]);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session?.user) {
        setProfile(await loadProfile(data.session.user.id));
        await hydrateAccountType(data.session);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, next) => {
      setSession(next);
      if (next?.user) {
        setProfile(await loadProfile(next.user.id));
        await hydrateAccountType(next);
      } else {
        setProfile(null);
        setAccountTypeState(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [hydrateAccountType]);

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
      signOut,
      refreshProfile,
      setAccountTypePreference,
    }),
    [
      session,
      profile,
      accountType,
      loading,
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

/** @deprecated Prefer homeForAccount via useAuth().accountType */
export function homeForRole(role?: UserRole | null, accountType?: AccountType | null) {
  return homeForAccount(role, accountType) as "/rider" | "/passenger" | "/business" | "/login";
}
