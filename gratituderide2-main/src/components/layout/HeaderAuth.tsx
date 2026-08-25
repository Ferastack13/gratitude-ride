"use client";

import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { getDashboardPath } from "@/lib/routes";
import type { UserRole } from "@/types";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type AuthState = {
  name: string;
  role: UserRole;
} | null;

export function HeaderAuth({ isScrolled }: { isScrolled: boolean }) {
  const [auth, setAuth] = useState<AuthState>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setAuth(null);
          setLoaded(true);
          return;
        }

        const { data: profile } = await supabase
          .from("users")
          .select("full_name, role")
          .eq("id", user.id)
          .single();

        setAuth({
          name: profile?.full_name || user.email || "Account",
          role: (profile?.role as UserRole) || "client",
        });
      } catch {
        setAuth(null);
      } finally {
        setLoaded(true);
      }
    }

    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      load();
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!loaded) {
    return <div className="hidden lg:block w-40 h-9" aria-hidden />;
  }

  if (auth) {
    return (
      <div className="hidden lg:flex items-center gap-3">
        <span
          className={cn(
            "text-sm truncate max-w-[140px]",
            isScrolled ? "text-muted" : "text-white/70"
          )}
        >
          {auth.name.split(" ")[0]}
        </span>
        <Button href={getDashboardPath(auth.role)} size="sm">
          Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="hidden lg:flex items-center gap-3">
      <Button
        href="/login"
        variant="ghost"
        size="sm"
        className={cn(
          isScrolled
            ? "text-dark hover:bg-dark/5"
            : "text-white hover:bg-white/10"
        )}
      >
        Login
      </Button>
      <Button href="/register" size="sm">
        Register
      </Button>
    </div>
  );
}
